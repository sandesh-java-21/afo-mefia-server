const Media = require("../models/Media");
const GeneralContent = require("../models/GeneralContent");
const LanguagesContent = require("../models/LanguagesContent");
const Thumbnail = require("../models/Thumbnail");

const { getVideoDurationInSeconds } = require("get-video-duration");

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");

const axios = require("axios");

const uploadMediaOld = async (req, res) => {
  try {
    var {
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status,
    } = req.body;

    console.log(
      "Data body: ",
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status
    );
    console.log("API Key: ", process.env.JW_PLAYER_API_KEY);

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var video_duration = getVideoDurationInSeconds(`${download_url}`).then(
      async (duration) => {
        var data = {
          upload: {
            method: "fetch",
            download_url: `${download_url}`,
          },
          metadata: {
            custom_params: {
              category: "sfhgs",
              sub_category: "kjfgf",
            },
            title: title,
            description: description,
            author: author,
            duration: duration * 1000,
            category: `${category}`,
            tags: tags,
            language: default_language,
          },
        };

        var apiResponse = await axios
          .post("https://api.jwplayer.com/v2/sites/yP9ghzCy/media", data, {
            headers: headers,
          })
          .then(async (result) => {
            var { author, category, description, language, tags, title } =
              result.data.metadata;
            var { duration, id } = result.data;

            var movieObj = new Movie({
              title,
              description,
              duration,
              banner_url,
              category,
              default_language: language,
              release_year: release_year,
              media_id: id,
            });

            var savedMovie = await movieObj.save();

            res.json({
              status: "200",
              message: "New movie uploaded!",
              movie: savedMovie,
              success: true,
              result: result.data,
            });
          })
          .catch((error) => {
            console.log("Error: ", error.data);
            res.json({
              error,
              message: "Error occurred while uploading movie",
              status: "400",
            });
          });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const deleteMedia = async (req, res) => {
  try {
    var movie_id = req.params.movie_id;

    if (!movie_id) {
      res.json({
        message: "Please provide a movie id!",
        status: "400",
      });
    } else {
      var movie = await Movie.findById({
        _id: movie_id,
      });

      var site_id = process.env.SITE_ID;
      var media_id = movie.media_id;

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var apiResponse = await axios
        .delete(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/`,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          console.log("JW Delete Response: ", result.data);
          var deletedMovie = await Movie.findByIdAndDelete({
            _id: movie_id,
          })
            .then((result) => {
              console.log("Database Result Delete: ", result.data);
              res.json({
                message: "Movie deleted successfully!",
                status: "200",
              });
            })
            .catch((error) => {
              console.log("Database Error Delete: ", error);
              res.json({
                message: "No movie found with provided id!",
                status: "404",
                error,
              });
            });
        })

        .catch((error) => {
          console.log("JW Delete Error: ", error);
          res.json({
            message: "Something went wrong!",
            error,
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const updateMedia = async (req, res) => {
  try {
    var movie_id = req.params.movie_id;
    var { title, description, category, default_language, release_year, tags } =
      req.body;

    if (!movie_id) {
      res.json({
        message: "Please provide a movie id!",
        status: "400",
      });
    } else if (
      title === "" ||
      description === "" ||
      category === "" ||
      default_language === "" ||
      release_year === ""
    ) {
      res.json({
        message: "Required field are empty!",
        status: "400",
      });
    } else {
      var movie = await Movie.findById({
        _id: movie_id,
      });

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        metadata: {
          custom_params: {
            category: `${category}`,
          },
          title: title,
          description: description,
          category: `${category}`,
          tags: tags,
          language: default_language,
        },
      };

      var site_id = process.env.SITE_ID;
      var media_id = movie.media_id;

      var apiResponse = await axios
        .patch(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          console.log("JW Result: ", result.data);
          var filter = {
            _id: movie_id,
          };
          var updateData = {
            title,
            description,
            category,
            default_language,
            release_year,
          };
          var updatedMovie = await Movie.findByIdAndUpdate(filter, updateData, {
            new: true,
          })
            .then((result) => {
              console.log("Database update result: ", result);
              res.json({
                message: "Movie updated successfully!",
                status: "200",
                updatedMovie,
              });
            })

            .catch((error) => {
              console.log("Database update error: ", error);
              res.json({
                message: "No movie found with provided id!",
                status: "404",
                error,
              });
            });
        })

        .catch((error) => {
          console.log("JW catch update error: ", error);
          res.json({
            message: "Something went wrong!",
            status: "400",
            error,
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const createMedia = async (req, res) => {
  try {
    var {
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status,
    } = req.body;

    console.log(
      "Data body: ",
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status
    );

    if (
      !title ||
      !description ||
      !jw_tags ||
      !category ||
      !default_language ||
      !release_year ||
      !genres ||
      !seo_tags ||
      !rating ||
      !status
    ) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var languagesContentObj = new LanguagesContent({
        title_translated: title,
        description_translated: description,
      });

      var savedLanguagesContent = await languagesContentObj.save();

      var customTags = jw_tags.map((tag) => tag + `-${category}`);
      var jw_tags = [...jw_tags, ...customTags];

      var mediaObj = new Media({
        title: title,
        description: description,
        duration: 0,
        default_language: default_language,
        release_year: release_year,
        subtitles: [],
        audio_tracks: [],
        jw_tags: jw_tags,
        seo_tags: seo_tags,
        translated_content: [savedLanguagesContent._id],
        rating: rating,
      });

      var savedMedia = await mediaObj.save();

      var generalContentObj = new GeneralContent({
        media: savedMedia._id,
        category: category,
        genre: genres,
        rating: rating,
        status: status,
      });

      var savedGeneralContent = await generalContentObj.save();

      res.json({
        message: "Media and general content created!",
        status: "200",
        savedGeneralContent,
        savedMedia,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const uploadMedia = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    var { download_url } = req.body;

    var generalContentObj = await GeneralContent.findById({
      _id: general_content_id,
    });

    var mediaObj = await Media.findById({
      _id: generalContentObj.media,
    });

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var video_duration = getVideoDurationInSeconds(`${download_url}`).then(
      async (duration) => {
        var data = {
          upload: {
            method: "fetch",
            download_url: `${download_url}`,
          },
          metadata: {
            custom_params: {
              category: `${generalContentObj.category}`,
            },
            title: mediaObj.title,
            description: mediaObj.description,
            // author: author,
            duration: duration * 1000,
            // category: `${category}`,
            tags: mediaObj.jw_tags,
            language: mediaObj.default_language,
          },
        };

        var apiResponse = await axios
          .post("https://api.jwplayer.com/v2/sites/yP9ghzCy/media", data, {
            headers: headers,
          })
          .then(async (result) => {
            var { duration, id } = result.data;
            var filter = {
              _id: mediaObj._id,
            };
            var updateData = {
              media_id: id,
            };
            var updatedMedia = await Media.findByIdAndUpdate(
              filter,
              updateData,
              {
                new: true,
              }
            ).then((resultObj) => {
              console.log("Updated Doc: ", resultObj);

              res.json({
                message: "Video uploaded successfully!",
                status: "200",
                updatedMedia: resultObj,
              });
            });
          })
          .catch((error) => {
            console.log("Error: ", error.data);
            res.json({
              error,
              message: "Error occurred while uploading movie",
              status: "400",
            });
          });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const reUploadMediaByMediaId = async (req, res) => {
  try {
    var media_id = req.params.media_id;
    var { download_url } = req.body;

    if (!media_id || media_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var site_id = process.env.SITE_ID;
      var media_id = media_id;

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        upload: {
          method: "fetch",
          download_url: `${download_url}`,
        },
      };

      var apiResponse = await axios
        .put(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/reupload/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          var { id } = result.data;

          var filter = {
            _id: media_id,
          };

          var updateData = {
            media_id: id,
          };

          var updatedMedia = await Media.findByIdAndUpdate(filter, updateData, {
            new: true,
          })
            .then((updateResult) => {
              res.json({
                message: "Media reuploaded successfully!",
                status: "200",
                updatedMedia: updateResult,
              });
            })
            .catch((error) => {
              res.json({
                message: "Something went wrong while updating media!",
                status: "400",
                error,
              });
            });
        })
        .catch((error) => {
          console.log("JW Error: ", error);
          res.json({
            message: "Something went wrong while reuploading media!",
            status: "400",
            error,
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const createMediaUpdated = async (req, res) => {
  try {
    var {
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status,
      isThumbnailSelected,
      language_code,
      imageBase64,
    } = req.body;

    console.log(
      "Data body: ",
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status,
      isThumbnailSelected
    );

    if (!title) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      if (isThumbnailSelected) {
        cloudinary.config(cloudinaryConfigObj);
        console.log(" image base 64 : ", imageBase64);

        cloudinary.uploader
          .upload(imageBase64)
          .then(async (result) => {
            console.log("cloudinary result : ", result);

            var publicId = result.public_id;

            var headers = {
              Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            };

            var data = {
              relationships: {
                media: [
                  {
                    id: `${mediaObj.media_id}`,
                  },
                ],
              },
              upload: {
                source_type: "custom_upload",
                method: "fetch",
                thumbnail_type: "static",
                download_url: `${result.secure_url}`,
              },
            };

            var site_id = process.env.SITE_ID;
            var apiResponse = await axios
              .post(
                `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/`,
                data,
                {
                  headers: headers,
                }
              )
              .then(async (result) => {
                console.log("JW Thumbnail Success: ", result.data);
                var { id } = result.data;
                var site_id = process.env.SITE_ID;
                var thumbnail_id = id;

                setTimeout(async () => {
                  var apiResponse_2 = await axios
                    .get(
                      `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                      {
                        headers: headers,
                      }
                    )

                    .then(async (result) => {
                      cloudinary.config(cloudinaryConfigObj);

                      cloudinary.uploader
                        .destroy(publicId)
                        .then((deleteResult) => {
                          console.log(deleteResult);
                        })
                        .catch((deleteError) => {
                          console.log("delete error: ", deleteError);
                        });

                      console.log("JW Get Thumbnail Success: ", result.data);
                      console.log(
                        "JW Get Thumbnail Success URL: ",
                        result.data.delivery_url
                      );

                      var thumbnail = new Thumbnail({
                        thumbnail_id: thumbnail_id,
                        static_thumbnail_url: result.data.delivery_url,
                        banner_thumbnail_url: result.data.delivery_url,
                        motion_thumbnail_url: "",
                        thumbnail_type: "jw_player",
                      });

                      var savedThumbnail = await thumbnail.save();

                      var languagesContentObj = new LanguagesContent({
                        title_translated: title,
                        description_translated: description,
                        language_type: default_language,
                        language_code: language_code,
                      });

                      var savedLanguagesContent =
                        await languagesContentObj.save();

                      var customTags = jw_tags.map(
                        (tag) => tag + `-${category}`
                      );
                      var jw_tags = [...jw_tags, ...customTags];

                      var mediaObj = new Media({
                        title: title,
                        description: description,
                        duration: 0,
                        default_language: default_language,
                        release_year: release_year,
                        subtitles: [],
                        audio_tracks: [],
                        jw_tags: jw_tags,
                        seo_tags: seo_tags,
                        translated_content: [savedLanguagesContent._id],
                        rating: rating,
                      });

                      var savedMedia = await mediaObj.save();

                      var generalContentObj = new GeneralContent({
                        media: savedMedia._id,
                        category: category,
                        genre: genres,
                        rating: rating,
                        status: status,
                        thumbnail: savedThumbnail._id,
                      });

                      var savedGeneralContent = await generalContentObj.save();

                      res.json({
                        message: "Media and general content created!",
                        status: "200",
                        savedGeneralContent,
                        savedMedia,
                      });
                    })
                    .catch(async (jwGetThumbnailError) => {
                      res.json({
                        jwGetThumbnailError,
                      });
                    });
                }, 10000);
              })
              .catch(async (jwThumbnailError) => {
                res.json({
                  jwThumbnailError,
                });
              });
          })
          .catch((cloudinaryError) => {
            console.log("cloudinary error: ", cloudinaryError);
            res.json({
              cloudinaryError,
            });
          });

        // var { thumbnail_id, static_thumbnail_url, banner_thumbnail_url } =
        //   req.body;

        // var thumbnail = new Thumbnail({
        //   thumbnail_id: thumbnail_id,
        //   static_thumbnail_url: static_thumbnail_url,
        //   banner_thumbnail_url: banner_thumbnail_url,
        //   motion_thumbnail_url: "",
        // });

        // var savedThumbnail = await thumbnail.save();

        // var languagesContentObj = new LanguagesContent({
        //   title_translated: title,
        //   description_translated: description,
        //   language_type: default_language,
        //   language_code: language_code,
        // });

        // var savedLanguagesContent = await languagesContentObj.save();

        // var customTags = jw_tags.map((tag) => tag + `-${category}`);
        // var jw_tags = [...jw_tags, ...customTags];

        // var mediaObj = new Media({
        //   title: title,
        //   description: description,
        //   duration: 0,
        //   default_language: default_language,
        //   release_year: release_year,
        //   subtitles: [],
        //   audio_tracks: [],
        //   jw_tags: jw_tags,
        //   seo_tags: seo_tags,
        //   translated_content: [savedLanguagesContent._id],
        //   rating: rating,
        // });

        // var savedMedia = await mediaObj.save();

        // var generalContentObj = new GeneralContent({
        //   media: savedMedia._id,
        //   category: category,
        //   genre: genres,
        //   rating: rating,
        //   status: status,
        //   thumbnail: savedThumbnail._id,
        // });

        // var savedGeneralContent = await generalContentObj.save();

        // res.json({
        //   message: "Media and general content created!",
        //   status: "200",
        //   savedGeneralContent,
        //   savedMedia,
        // });
      } else {
        var languagesContentObj = new LanguagesContent({
          title_translated: title,
          description_translated: description,
        });

        var savedLanguagesContent = await languagesContentObj.save();

        var customTags = jw_tags.map((tag) => tag + `-${category}`);
        var jw_tags = [...jw_tags, ...customTags];

        var mediaObj = new Media({
          title: title,
          description: description,
          duration: 0,
          default_language: default_language,
          release_year: release_year,
          subtitles: [],
          audio_tracks: [],
          jw_tags: jw_tags,
          seo_tags: seo_tags,
          translated_content: [savedLanguagesContent._id],
          rating: rating,
        });

        var savedMedia = await mediaObj.save();

        var thumbnail = new Thumbnail({
          thumbnail_id: "",
          static_thumbnail_url: "",
          banner_thumbnail_url: "",
          motion_thumbnail_url: "",
          thumbnail_type: "",
          cloudinary_public_id: "",
        });

        var savedThumbnail = await thumbnail.save();

        var generalContentObj = new GeneralContent({
          media: savedMedia._id,
          category: category,
          genre: genres,
          rating: rating,
          status: status,
          thumbnail: savedThumbnail._id,
        });

        var savedGeneralContent = await generalContentObj.save();

        res.json({
          message: "Media and general content created!",
          status: "200",
          savedGeneralContent,
          savedMedia,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const uploadMediaId = async (req, res) => {
  try {
    var mediaObjId = req.params.media_Obj_Id;

    var { media_id } = req.body;

    console.log(">>>>>>>>>  ", media_id, mediaObjId);

    var media = await Media.findById({
      _id: mediaObjId,
    })

      .then(async (onMediaFound) => {
        console.log("media found: ", onMediaFound);

        var filter = {
          _id: onMediaFound._id,
        };

        var updateData = {
          media_id: media_id,
        };

        var updatedMedia = await Media.findByIdAndUpdate(filter, updateData, {
          new: true,
        })
          .then(async (onMediaUpdate) => {
            var headers = {
              Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            };

            var apiResponse = await axios
              .get(
                `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails/?q=media_id:${media_id}`,
                {
                  headers: headers,
                }
              )
              .then(async (thumbnailResult) => {
                var { thumbnails } = thumbnailResult.data;
                console.log("thumbnails: ", thumbnailResult.data);

                var general_content = await GeneralContent.findOne({
                  media: onMediaFound._id,
                })
                  .then(async (onGcFound) => {
                    console.log("on gc found: ", onGcFound);

                    var thumbnailObj = onGcFound.thumbnail;

                    var filter = {
                      _id: onGcFound.thumbnail,
                    };

                    console.log(
                      "url >>>> ",
                      thumbnailResult.data.thumbnails[0]
                    );

                    var updatedData = {
                      general_content: onGcFound._id,
                      motion_thumbnail_url:
                        thumbnailResult.data.thumbnails[0].delivery_url,
                    };

                    var updatedThumbnail = await Thumbnail.findByIdAndUpdate(
                      filter,
                      updatedData,
                      {
                        new: true,
                      }
                    )
                      .then(async (onThumbnailGenerated) => {
                        console.log(
                          "on thumbnail generated: ",
                          onThumbnailGenerated
                        );

                        res.json({
                          message: "Media Reuploaded!",
                          status: "200",
                          updatedMedia: onMediaUpdate,
                          updatedThumbnail: onThumbnailGenerated,
                        });
                      })
                      .catch(async (onThumbnailGenerateError) => {
                        console.log(
                          "on thumbnail generate error: ",
                          onThumbnailGenerateError
                        );
                        res.json({
                          message:
                            "Something went wrong while generating motion thumbnail!",
                          status: "400",
                          error: onThumbnailGenerateError,
                        });
                      });
                  })
                  .catch(async (onGcNotFound) => {
                    console.log("on gc not found: ", onGcNotFound);
                    res.json({
                      message: "No general content found with provided id!",
                      status: "404",
                      error: onGcNotFound,
                    });
                  });
              });
          })
          .catch((onMediaNotUpdate) => {
            console.log("media not update: ", onMediaNotUpdate);
            res.json({
              message: "Something went wrong while uploading media!",
              status: "400",
              error: onMediaNotUpdate,
            });
          });
      })
      .catch((onMediaNotFound) => {
        console.log("media not found: ", onMediaNotFound);
        res.json({
          message: "General info not submitted yet!",
          status: "404",
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
  uploadMedia,
  deleteMedia,
  updateMedia,
  createMedia,
  reUploadMediaByMediaId,
  createMediaUpdated,
  uploadMediaId,
};
