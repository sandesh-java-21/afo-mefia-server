const Genre = require("../models/Genre");

const cloudinary = require("cloudinary").v2;
const cloudinaryConfigObj = require("../configurations/Cloudinary");

const addGenre = async (req, res) => {
  try {
    var { name, type, imageBase64, is_enabled } = req.body;
    var existingGenre = await Genre.findOne({
      name: name,
      genre_type: type,
    });

    if (existingGenre) {
      res.json({
        message: `${name} genre already exists!`,
        status: "409",
        genreFound: true,
      });
    } else {
      cloudinary.config(cloudinaryConfigObj);

      cloudinary.uploader
        .upload(imageBase64, {
          folder: "genre",
        })
        .then(async (onImageUpload) => {
          console.log("on image upload:  ", onImageUpload);

          var genreObj = new Genre({
            name: name,
            genre_type: type,
            is_enabled: is_enabled,
            genre_image: {
              url: onImageUpload.secure_url,
              public_id: onImageUpload.public_id,
            },
          });

          var savedGenre = await genreObj.save();

          res.json({
            message: "New genre created!",
            status: "200",
            savedGenre: savedGenre,
          });
        })
        .catch(async (onImageNotUpload) => {
          console.log("on image not upload: ", onImageNotUpload);
          res.json({
            message: "Something went wrong while uploading genre image!",
            status: "400",
            error: onImageNotUpload,
          });
        });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const deleteGenre = async (req, res) => {
  try {
    var genre_id = req.params.id;

    var genre = await Genre.findById(genre_id)
      .then(async (result) => {
        var genreObj = result;

        cloudinary.config(cloudinaryConfigObj);

        cloudinary.uploader
          .destroy(genreObj.genre_image.public_id)
          .then(async (deleteResult) => {
            console.log("cloudinary delete result: ", deleteResult);

            var deletedGenre = await Genre.findByIdAndDelete(genreObj._id)
              .then(async (onGenreDelete) => {
                console.log("on genre delete: ", onGenreDelete);
                res.json({
                  message: "Genre deleted!",
                  status: "200",
                  genreDeleted: true,
                  genreFound: true,
                });
              })
              .catch(async (onGenreNotDelete) => {
                console.log("on genre not delete: ", onGenreNotDelete);
                res.json({
                  message: "Something went wrong while deleting genre!",
                  status: "400",
                  error: onGenreNotDelete,
                });
              });
          })
          .catch(async (deleteError) => {
            console.log("cloudinary delete error: ", deleteError);
            res.json({
              message: "Something went wrong while deleting the genre!",
              status: "400",
              error: deleteError,
            });
          });
      })
      .catch((error) => {
        res.json({
          message: "No genre found with provided id!",
          status: "404",
          genreDeleted: false,
          genreFound: false,
          error,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const updateGenre = async (req, res) => {
  var genre_id = req.params.id;
  var { name, imageBase64, type, isImageSelected, is_enabled } = req.body;

  if (!genre_id || genre_id === "") {
    res.json({
      message: "No genre found with provided id!",
      status: "404",
      genreUpdated: false,
      genreFound: false,
    });
  } else {
    var genre = await Genre.findById(genre_id)
      .then(async (result) => {
        var genreObj = result;
        console.log("genre obj: ", genreObj);

        if (isImageSelected) {
          cloudinary.config(cloudinaryConfigObj);

          cloudinary.uploader
            .destroy(genreObj.genre_image.public_id)
            .then(async (onImageDelete) => {
              console.log("on image delete: ", onImageDelete);

              cloudinary.config(cloudinaryConfigObj);

              cloudinary.uploader
                .upload(imageBase64, {
                  folder: "genre",
                })
                .then(async (onImageReUpload) => {
                  console.log("on image reupload: ", onImageReUpload);

                  var filter = {
                    _id: genreObj._id,
                  };

                  var updateData = {
                    name: name,
                    genre_type: type,
                    is_enabled: is_enabled,
                    genre_image: {
                      url: onImageReUpload.secure_url,
                      public_id: onImageReUpload.public_id,
                    },
                  };

                  var updatedGenre = await Genre.findByIdAndUpdate(
                    filter,
                    updateData,
                    {
                      new: true,
                    }
                  )
                    .then(async (onGenreUpdate) => {
                      console.log("on genre update: ", onGenreUpdate);
                      res.json({
                        message: "Genre updated!",
                        status: "200",
                        genreUpdated: true,
                        genreFound: true,
                        updatedGenre: onGenreUpdate,
                        updatedImage: onImageReUpload.secure_url,
                      });
                    })
                    .catch(async (onGenreNotUpdate) => {
                      console.log("on genre not update: ", onGenreNotUpdate);
                      res.json({
                        message: "Something went wrong while updating genre!",
                        status: "400",
                        error: onGenreNotUpdate,
                      });
                    });
                })
                .catch(async (onImageNotUploadError) => {
                  console.log(
                    "on image reupload error: ",
                    onImageNotUploadError
                  );
                  res.json({
                    message: "Something went wrong while updating genre!",
                    status: "400",
                    error: onImageNotUploadError,
                  });
                });
            })
            .catch(async (onImageNotDelete) => {
              console.log("on image not delete: ", onImageNotDelete);
              res.json({
                message: "Something went wrong while updating genre!",
                status: "400",
                error: onImageNotDelete,
              });
            });
        } else {
          var filter = {
            _id: genreObj._id,
          };

          var updateData = {
            name: name,
            genre_type: type,
            is_enabled: is_enabled,
          };

          var updatedGenre = await Genre.findByIdAndUpdate(filter, updateData, {
            new: true,
          })
            .then(async (onGenreUpdate) => {
              console.log("on genre update 2:  ", onGenreUpdate);

              res.json({
                message: "Genre updated!",
                status: "200",
                genreUpdated: true,
                genreFound: true,
                updatedGenre: onGenreUpdate,
              });
            })
            .catch(async (onGenreNotUpdate) => {
              console.log("on genre not update 2:  ", onGenreNotUpdate);
              res.json({
                message: "Something went wrong while updating genre!",
                status: "400",
                error: onGenreNotUpdate,
              });
            });
        }
      })
      .catch((error) => {
        res.json({
          message: "No genre found with provided id!",
          status: "404",
          genreUpdated: false,
          genreFound: false,
          error,
        });
      });
  }
};

const getAllGenres = async (req, res) => {
  try {
    var allGenres = await Genre.find();
    if (!allGenres || allGenres.length <= 0) {
      res.json({
        message: "No genres found!",
        status: "404",
        genresFound: false,
      });
    } else {
      res.json({
        message: "Genres found!",
        status: "200",
        genresFound: true,
        allGenres,
      });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getGenreById = async (req, res) => {
  try {
    var genre_id = req.params.id;
    var genre = await Genre.findById({
      _id: genre_id,
    })

      .then((result) => {
        res.json({
          message: "Genre found!",
          status: "200",
          genre: result,
        });
      })
      .catch((error) => {
        res.json({
          message: "No genre found!",
          status: "404",
          error,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const enableGenre = async (req, res) => {
  try {
    var genre_id = req.params.genre_id;

    var updatedGenre = await Genre.findByIdAndUpdate(
      { _id: genre_id },
      {
        is_enabled: true,
      },
      {
        new: true,
      }
    )
      .then(async (onGenreUpdate) => {
        console.log("on genre update: ", onGenreUpdate);
        res.json({
          message: "Genre is active now!",
          status: "200",
          activatedGenre: onGenreUpdate,
        });
      })
      .catch(async (onGenreNotUpdate) => {
        console.log("on genre not update: ", onGenreNotUpdate);

        res.json({
          message: "Genre not found with provide id!",
          status: "404",
          error: onGenreNotUpdate,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const disableGenre = async (req, res) => {
  try {
    var genre_id = req.params.genre_id;

    var updatedGenre = await Genre.findByIdAndUpdate(
      { _id: genre_id },
      {
        is_enabled: false,
      },
      {
        new: true,
      }
    )
      .then(async (onGenreUpdate) => {
        console.log("on genre update: ", onGenreUpdate);
        res.json({
          message: "Genre is inactive now!",
          status: "200",
          inactivatedGenre: onGenreUpdate,
        });
      })
      .catch(async (onGenreNotUpdate) => {
        console.log("on genre not update: ", onGenreNotUpdate);

        res.json({
          message: "Genre not found with provide id!",
          status: "404",
          error: onGenreNotUpdate,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  addGenre,
  deleteGenre,
  updateGenre,
  getAllGenres,
  getGenreById,
  enableGenre,
  disableGenre,
};
