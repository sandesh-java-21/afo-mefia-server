const TvShow = require("../models/TvShow");
const Season = require("../models/Season");
const LanguagesContent = require("../models/LanguagesContent");
const Thumbnail = require("../models/Thumbnail");
const Trailer = require("../models/Trailer");

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");

const axios = require("axios");

const createTvShow = async (req, res) => {
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
      content_type,
      availability,
      monetization,
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
      isThumbnailSelected,
      content_type,
      availability,
      monetization
    );

    category = "tvshow";

    if (!title) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      if (isThumbnailSelected) {
        cloudinary.config(cloudinaryConfigObj);
        console.log(" image base 64 : ");

        cloudinary.uploader
          .upload(imageBase64, {
            folder: "thumbnails",
          })
          .then(async (result) => {
            console.log("cloudinary result : ", result);

            var publicId = result.public_id;

            var thumbnail = new Thumbnail({
              thumbnail_id: "",
              static_thumbnail_url: result.secure_url,
              banner_thumbnail_url: result.secure_url,
              motion_thumbnail_url: "",
              thumbnail_type: "cloudinary",
              cloudinary_public_id: publicId,
            });

            var savedThumbnail = await thumbnail.save();

            var languagesContentObj = new LanguagesContent({
              title_translated: title,
              description_translated: description,
              language_type: default_language,
              language_code: language_code,
            });

            var savedLanguagesContent = await languagesContentObj.save();

            var customTags = req.body.jw_tags.map(
              (tag) => tag + `-${category}`
            );
            var jw_tags = [...req.body.jw_tags, ...customTags];

            var tvShowTrailer = new Trailer({
              media_id: "",
              audio_tracks: [],
              subtitles: [],
              type: "trailer",
            });

            var savedTrailerTvShow = await tvShowTrailer.save();

            var tvShowObj = new TvShow({
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
              monetization: monetization,
              genre: genres,
              availability: availability,
              content_type: content_type,
              thumbnail: savedThumbnail._id,
              status: status,
              rating: rating,
              category: category,
              comments: [],
              total_likes: 0,
              crew_members: [],
              seasons: [],
              trailer: savedTrailerTvShow._id,
            });

            var savedTvShow = await tvShowObj.save();

            //   var generalContentObj = new GeneralContent({
            //     media: savedMedia._id,
            //     category: "movie",
            //     genre: genres,
            //     rating: rating,
            //     status: status,
            //     thumbnail: savedThumbnail._id,
            //     content_type: content_type,
            //     availability: availability,
            //   });

            //   var savedGeneralContent = await generalContentObj.save();

            res.json({
              message: "Tv Showcreated!",
              status: "200",
              savedTvShow,
              thumbnail: savedThumbnail,
            });

            // var headers = {
            //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            // };

            // var data = {
            //   relationships: {
            //     media: [
            //       {
            //         id: `${mediaObj.media_id}`,
            //       },
            //     ],
            //   },
            //   upload: {
            //     source_type: "custom_upload",
            //     method: "fetch",
            //     thumbnail_type: "static",
            //     download_url: `${result.secure_url}`,
            //   },
            // };

            // var site_id = process.env.SITE_ID;
            // var apiResponse = await axios
            //   .post(
            //     `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/`,
            //     data,
            //     {
            //       headers: headers,
            //     }
            //   )
            //   .then(async (result) => {
            //     console.log("JW Thumbnail Success: ", result.data);
            //     var { id } = result.data;
            //     var site_id = process.env.SITE_ID;
            //     var thumbnail_id = id;

            //     setTimeout(async () => {
            //       var apiResponse_2 = await axios
            //         .get(
            //           `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
            //           {
            //             headers: headers,
            //           }
            //         )

            //         .then(async (result) => {
            //           cloudinary.config(cloudinaryConfigObj);

            //           cloudinary.uploader
            //             .destroy(publicId)
            //             .then((deleteResult) => {
            //               console.log(deleteResult);
            //             })
            //             .catch((deleteError) => {
            //               console.log("delete error: ", deleteError);
            //             });

            //           console.log("JW Get Thumbnail Success: ", result.data);
            //           console.log(
            //             "JW Get Thumbnail Success URL: ",
            //             result.data.delivery_url
            //           );

            //           var thumbnail = new Thumbnail({
            //             thumbnail_id: thumbnail_id,
            //             static_thumbnail_url: result.data.delivery_url,
            //             banner_thumbnail_url: result.data.delivery_url,
            //             motion_thumbnail_url: "",
            //             thumbnail_type: "jw_player",
            //           });

            //           var savedThumbnail = await thumbnail.save();

            //           var languagesContentObj = new LanguagesContent({
            //             title_translated: title,
            //             description_translated: description,
            //             language_type: default_language,
            //             language_code: language_code,
            //           });

            //           var savedLanguagesContent =
            //             await languagesContentObj.save();

            //           var customTags = jw_tags.map(
            //             (tag) => tag + `-${category}`
            //           );
            //           var jw_tags = [...jw_tags, ...customTags];

            //           var mediaObj = new Media({
            //             title: title,
            //             description: description,
            //             duration: 0,
            //             default_language: default_language,
            //             release_year: release_year,
            //             subtitles: [],
            //             audio_tracks: [],
            //             jw_tags: jw_tags,
            //             seo_tags: seo_tags,
            //             translated_content: [savedLanguagesContent._id],
            //             rating: rating,
            //           });

            //           var savedMedia = await mediaObj.save();

            //           var generalContentObj = new GeneralContent({
            //             media: savedMedia._id,
            //             category: category,
            //             genre: genres,
            //             rating: rating,
            //             status: status,
            //             thumbnail: savedThumbnail._id,
            //           });

            //           var savedGeneralContent = await generalContentObj.save();

            //           res.json({
            //             message: "Media and general content created!",
            //             status: "200",
            //             savedGeneralContent,
            //             savedMedia,
            //           });
            //         })
            //         .catch(async (jwGetThumbnailError) => {
            //           res.json({
            //             jwGetThumbnailError,
            //           });
            //         });
            //     }, 10000);
            //   })
            //   .catch(async (jwThumbnailError) => {
            //     res.json({
            //       jwThumbnailError,
            //     });
            //   });
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
          language_type: default_language,
          language_code: language_code,
        });

        var savedLanguagesContent = await languagesContentObj.save();

        var thumbnail = new Thumbnail({
          thumbnail_id: "",
          static_thumbnail_url: "",
          banner_thumbnail_url: "",
          motion_thumbnail_url: "",
          thumbnail_type: "",
          cloudinary_public_id: "",
        });

        var savedThumbnail = await thumbnail.save();

        var customTags = req.body.jw_tags.map((tag) => tag + `-${category}`);
        var jw_tags = [...req.body.jw_tags, ...customTags];

        var tvShowTrailer = new Trailer({
          media_id: "",
          audio_tracks: [],
          subtitles: [],
          type: "trailer",
        });

        var savedTrailerTvShow = await tvShowTrailer.save();

        var tvShowObj = new TvShow({
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
          monetization: monetization,
          genre: genres,
          availability: availability,
          content_type: content_type,
          thumbnail: savedThumbnail._id,
          status: status,
          rating: rating,
          category: category,
          comments: [],
          total_likes: 0,
          crew_members: [],
          seasons: [],
          trailer: savedTrailerTvShow._id,
        });

        var savedTvShow = await tvShowObj.save();

        //   var generalContentObj = new GeneralContent({
        //     media: savedMedia._id,
        //     category: "movie",
        //     genre: genres,
        //     rating: rating,
        //     status: status,
        //     thumbnail: savedThumbnail._id,
        //     content_type: content_type,
        //     availability: availability,
        //   });

        //   var savedGeneralContent = await generalContentObj.save();

        res.json({
          message: "Tv Showcreated!",
          status: "200",
          savedTvShow,
          thumbnail: savedThumbnail,
        });

        //   var customTags = jw_tags.map((tag) => tag + `-${category}`);
        //   var jw_tags = [...jw_tags, ...customTags];

        //   var mediaObj = new Media({
        //     title: title,
        //     description: description,
        //     duration: 0,
        //     default_language: default_language,
        //     release_year: release_year,
        //     subtitles: [],
        //     audio_tracks: [],
        //     jw_tags: jw_tags,
        //     seo_tags: seo_tags,
        //     translated_content: [savedLanguagesContent._id],
        //     rating: rating,
        //     monetization: monetization,
        //   });

        //   var savedMedia = await mediaObj.save();
      }
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const geAllTvShows = async (req, res) => {
  try {
    var tvshows = await TvShow.find()
      .populate("thumbnail")
      .then(async (onFound) => {
        console.log("on tv show found: ", onFound);

        var allTvShows = onFound;

        if (allTvShows.length <= 0) {
          res.json({
            message: "No Tv Show Found!",
            status: "404",
            allTvShows: [],
          });
        } else {
          res.json({
            message: "No Tv Show Found!",
            status: "404",
            allTvShows: allTvShows,
          });
        }
      })
      .catch(async (onFoundError) => {
        console.log("on tv show found error: ", onFoundError);
        res.json({
          message: "Something went wrong while getting tv show!",
          status: "400",
          error: onFoundError,
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

const getSeasonsOfATvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;
    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var tvshow = await TvShow.findById(tv_show_id)
        .populate("seasons", {
          title: 1,
          _id: 1,
        })
        .then(async (onTvShowFound) => {
          console.log("on tv show found: ", onTvShowFound);

          res.json({
            message: "Tv show seasons found!",
            status: "200",
            seasons: onTvShowFound.seasons,
          });
        })
        .catch(async (onTvShowFoundError) => {
          console.log("on tv show found error: ", onTvShowFoundError);
          res.json({
            message: "Something went wrong while getting tv show seasons!",
            status: "400",
            error: onTvShowFoundError,
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

const createSeasonOfAtvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;
    var { title } = req.body;
    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required field are empty!",
        status: "400",
      });
    } else {
      var tv_show = await TvShow.findById(tv_show_id)
        .then(async (onTvShowFound) => {
          console.log("on tv show found: ", onTvShowFound);

          var seasonTrailer = new Trailer({
            media_id: "",
            audio_tracks: [],
            subtitles: [],
            type: "trailer",
          });

          var savedTrailerSeason = await seasonTrailer.save();

          var seasonObj = new Season({
            title: title,
            tv_show: onTvShowFound._id,
            trailer: savedTrailerSeason._id,
          });

          var savedSeason = await seasonObj
            .save()
            .then(async (onSeasonSave) => {
              console.log("on season save: ", onSeasonSave);

              var filter = {
                _id: onTvShowFound._id,
              };

              var updatedTvShow = await TvShow.findByIdAndUpdate(
                filter,
                {
                  $push: {
                    seasons: onSeasonSave._id,
                  },
                },
                {
                  new: true,
                }
              )
                .then(async (onTvShowUpdate) => {
                  console.log("on tv show update: ", onTvShowUpdate);
                  res.json({
                    message: "New season created for the tv show!",
                    status: "200",
                    savedSeason: {
                      title: onSeasonSave.title,
                      _id: onSeasonSave._id,
                    },
                  });
                })
                .catch(async (onTvShowUpdateError) => {
                  console.log("on tv show update error: ", onTvShowUpdateError);
                  res.json({
                    message: "Something went wrong while creating season!",
                    status: "400",
                    error: onTvShowUpdateError,
                  });
                });
            })
            .catch(async (onSeasonSaveError) => {
              console.log("on season save error: ", onSeasonSaveError);
              res.json({
                message: "Something went wrong while saving season!",
                status: "400",
                error: onSeasonSaveError,
              });
            });
        })
        .catch(async (onTvShowFoundError) => {
          console.log("on tv show found error: ", onTvShowFoundError);
          res.json({
            message: "Tv show not found!",
            status: "404",
            error: onTvShowFoundError,
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

// const updateTvShow = async (req, res) => {
//   try {
//     var tv_show_id = req.params.tv_show_id;

//     if (!tv_show_id || tv_show_id === "") {
//       res.json({
//         message: "Required fields are empty!",
//         status: "400",
//       });
//     } else {
//       var tv_show = await TvShow.findById(tv_show_id)
//         .then(async (onTvShowFound) => {
//           console.log("on tv show found: ", onTvShowFound);

//           // remaining code
//         })
//         .catch(async (onTvShowFoundError) => {
//           console.log("on tv show found error: ", onTvShowFoundError);
//           res.json({
//             message: "Tv Show Not Found!",
//             status: "404",
//             error: onTvShowFoundError,
//           });
//         });
//     }
//   } catch (error) {
//     res.json({
//       message: "Internal server error!",
//       status: "500",
//       error,
//     });
//   }
// };

const getTvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;

    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var tv_show = await TvShow.findById({
        _id: tv_show_id,
      })
        .populate(["genre", "trailer", "thumbnail", "seasons"])
        .then(async (onTvShowFound) => {
          var tv_show_obj = onTvShowFound;
          res.json({
            tv_show_obj,
          });
        })
        .catch((error) => {
          res.json({
            message: "General content not found!",
            status: "404",
            error,
          });
        });
    }
  } catch (error) {
    res.json({
      message: "Internal Server Error!",
      status: "400",
      error,
    });
  }
};

const updateTvShow = async (req, res) => {
  try {
    var general_content_id = req.params.tv_show_id;

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

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
      isThumbnailUpdated,
      content_type,
      availability,
      monetization,
    } = req.body;

    category = "tvshow";

    if (isThumbnailUpdated) {
      var { thumbnailImageBase64 } = req.body;

      var general_content = await TvShow.findById({
        _id: general_content_id,
      })
        .then(async (onGcFound) => {
          console.log("on gc found: ");
          var general_content_obj = onGcFound;

          var media = await TvShow.findById({
            _id: general_content_id,
          })
            .then(async (onMediaFound) => {
              console.log("media found: ");

              var mediaObj = onMediaFound;

              if (mediaObj.media_id && mediaObj.media_id !== "") {
                // yes media id

                var thumbnail = await Thumbnail.findById(
                  general_content_obj.thumbnail
                )
                  .then(async (onThumbnailFound) => {
                    var thumbnailObj = onThumbnailFound;

                    // static_thumbnail_url
                    // banner_thumbnail_url

                    if (
                      thumbnailObj.static_thumbnail_url &&
                      thumbnailObj.static_thumbnail_url !== ""
                    ) {
                      // not empty

                      if (thumbnailObj.thumbnail_type === "cloudinary") {
                        // cloudinary thumbnail

                        cloudinary.config(cloudinaryConfigObj);

                        cloudinary.uploader
                          .destroy(thumbnailObj.cloudinary_public_id)
                          .then(async (cloudinaryDeleteSuccess) => {
                            console.log(
                              "cloudinary delete success: ",
                              cloudinaryDeleteSuccess
                            );

                            cloudinary.config(cloudinaryConfigObj);

                            cloudinary.uploader
                              .upload(thumbnailImageBase64)
                              .then(async (cloudinaryUploadSuccess) => {
                                console.log(
                                  "cloudinary upload success: ",
                                  cloudinaryUploadSuccess
                                );

                                var publicId =
                                  cloudinaryUploadSuccess.public_id;

                                // var headers = {
                                //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
                                // };

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
                                    download_url: `${cloudinaryUploadSuccess.secure_url}`,
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
                                  .then(async (jwThumbnailUploadSuccess) => {
                                    console.log(
                                      "jw thumbnail upload success: ",
                                      jwThumbnailUploadSuccess.data
                                    );

                                    var { id } = jwThumbnailUploadSuccess.data;
                                    setTimeout(async () => {
                                      var apiResponse_2 = await axios
                                        .get(
                                          `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${id}/`,
                                          {
                                            headers: headers,
                                          }
                                        )
                                        .then(
                                          async (
                                            onJwThumbnailSuccessUpload
                                          ) => {
                                            console.log(
                                              "on jw thumbnail success upload: ",
                                              onJwThumbnailSuccessUpload.data
                                            );

                                            cloudinary.config(
                                              cloudinaryConfigObj
                                            );

                                            cloudinary.uploader
                                              .destroy(publicId)
                                              .then(
                                                async (deleteCloudinary) => {
                                                  console.log(
                                                    "deleted from cloudinary: ",
                                                    deleteCloudinary
                                                  );
                                                }
                                              )
                                              .catch(
                                                async (notDeleteCloudinary) => {
                                                  console.log(
                                                    "not delete cloudinary: ",
                                                    notDeleteCloudinary
                                                  );
                                                }
                                              );

                                            var filter = {
                                              _id: thumbnailObj._id,
                                            };

                                            var thumbnailDataUpdate = {
                                              thumbnail_id: id,
                                              static_thumbnail_url:
                                                onJwThumbnailSuccessUpload.data
                                                  .delivery_url,
                                              banner_thumbnail_url:
                                                onJwThumbnailSuccessUpload.data
                                                  .delivery_url,
                                              thumbnail_type: "jw_player",
                                            };

                                            var updatedThumbnail =
                                              await Thumbnail.findByIdAndUpdate(
                                                filter,
                                                thumbnailDataUpdate,
                                                {
                                                  new: true,
                                                }
                                              ).then(
                                                async (onThumbnailUpdate) => {
                                                  console.log(
                                                    "on thumbnail update: ",
                                                    onThumbnailUpdate
                                                  );
                                                  var updatedThumbnailObj =
                                                    onThumbnailUpdate;

                                                  // new general info update code here

                                                  var filter = {
                                                    _id: mediaObj._id,
                                                  };

                                                  var customTags =
                                                    req.body.jw_tags.map(
                                                      (tag) =>
                                                        tag + `-${category}`
                                                    );
                                                  var jw_tags = [
                                                    ...req.body.jw_tags,
                                                    ...customTags,
                                                  ];

                                                  var updateData = {
                                                    title,
                                                    description,
                                                    jw_tags,
                                                    category,
                                                    default_language,
                                                    release_year,
                                                    genres,
                                                    seo_tags,
                                                    rating,
                                                    monetization,
                                                  };

                                                  var updatedMedia =
                                                    await TvShow.findByIdAndUpdate(
                                                      filter,
                                                      updateData,
                                                      { new: true }
                                                    ).then(
                                                      async (onGcUpdate) => {
                                                        var gcFilter = {
                                                          _id: general_content_obj._id,
                                                        };

                                                        var gcUpdateData = {
                                                          availability,
                                                          content_type,
                                                          status,
                                                          genre: genres,
                                                        };

                                                        var updatedGc =
                                                          await TvShow.findByIdAndUpdate(
                                                            gcFilter,
                                                            gcUpdateData,
                                                            {
                                                              new: true,
                                                            }
                                                          )
                                                            .then(
                                                              async (
                                                                onNewGc
                                                              ) => {
                                                                console.log(
                                                                  "on new gc: ",
                                                                  onNewGc
                                                                );
                                                                console.log(
                                                                  "on gc update: ",
                                                                  onGcUpdate
                                                                );
                                                                res.json({
                                                                  message:
                                                                    "General info updated!",
                                                                  status: "200",
                                                                  updatedMedia:
                                                                    onGcUpdate,
                                                                  updatedThumbnail:
                                                                    updatedThumbnailObj,
                                                                });
                                                              }
                                                            )
                                                            .catch(
                                                              async (
                                                                onNewGcError
                                                              ) => {
                                                                console.log(
                                                                  "on new gc error: ",
                                                                  onNewGcError
                                                                );
                                                              }
                                                            );
                                                      }
                                                    );
                                                  // .catch(
                                                  //   async (
                                                  //     onGcUpdateError
                                                  //   ) => {
                                                  //     console.log(
                                                  //       "on gc update error: ",
                                                  //       onGcUpdateError
                                                  //     );
                                                  //     res.json({
                                                  //       message:
                                                  //         "something went wrong while updating general info!",
                                                  //       status: "400",
                                                  //       error:
                                                  //         onGcUpdateError,
                                                  //     });
                                                  //   }
                                                  // );
                                                }
                                              );
                                            // .catch(
                                            //   async (
                                            //     onThumbnailUpdateError
                                            //   ) => {
                                            //     console.log(
                                            //       "on thumbnail update error: ",
                                            //       onThumbnailUpdateError
                                            //     );
                                            //     res.json({
                                            //       message:
                                            //         "Something went wrong while updating thumbnail!",
                                            //       status: "400",
                                            //       error:
                                            //         onThumbnailUpdateError,
                                            //     });
                                            //   }
                                            // );
                                          }
                                        );
                                      // .catch(async (onJwThumbnailError) => {
                                      //   console.log(
                                      //     "on jw thumbnail error: ",
                                      //     onJwThumbnailError
                                      //   );
                                      //   res.json({
                                      //     message:
                                      //       "Something went wrong while updating thumbnail!",
                                      //     status: "400",
                                      //     error: onJwThumbnailError,
                                      //   });
                                      // });
                                    }, 10000);
                                  })
                                  .catch(async (jwThumbnailUploadError) => {
                                    console.log(
                                      "jw thumbnail upload error: ",
                                      jwThumbnailUploadError
                                    );
                                    res.json({
                                      message:
                                        "Something went wrong while updating thumbnail!",
                                      status: "400",
                                      error: jwThumbnailUploadError,
                                    });
                                  });
                              })
                              .catch(async (cloudinaryUploadError) => {
                                console.log(
                                  "cloudinary upload error: ",
                                  cloudinaryUploadError
                                );
                                res.json({
                                  message:
                                    "Something went wrong while updating the banner!",
                                  status: "400",
                                  error: cloudinaryUploadError,
                                });
                              });
                          })
                          .catch(async (cloudinaryDeleteError) => {
                            console.log(
                              "cloudinary delete error: ",
                              cloudinaryDeleteError
                            );
                          });
                      } else {
                        // jw player thumbnail

                        var thumbnail_id = thumbnailObj.thumbnail_id;
                        var site_id = process.env.SITE_ID;
                        // var headers = {
                        //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
                        // };

                        var apiResponse_3 = await axios
                          .delete(
                            `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                            {
                              headers: headers,
                            }
                          )
                          .then(async (onJwThumbnailDelete) => {
                            console.log(
                              "on jw thumbnail delete: ",
                              onJwThumbnailDelete.data
                            );

                            cloudinary.config(cloudinaryConfigObj);

                            cloudinary.uploader
                              .upload(thumbnailImageBase64, {
                                folder: "thumbnails",
                              })
                              .then(async (onCloudinaryUpload) => {
                                console.log(
                                  "on cloudinary upload: ",
                                  onCloudinaryUpload
                                );

                                var public_id_2 = onCloudinaryUpload.public_id;

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
                                    download_url: `${onCloudinaryUpload.secure_url}`,
                                  },
                                };

                                var site_id = process.env.SITE_ID;
                                var apiResponse_4 = await axios
                                  .post(
                                    `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/`,
                                    data,
                                    {
                                      headers: headers,
                                    }
                                  )
                                  .then(async (onJwThumbnailUpload) => {
                                    console.log(
                                      "on jw thumbnail upload: ",
                                      onJwThumbnailUpload
                                    );

                                    var { id } = onJwThumbnailUpload.data;
                                    var site_id = process.env.SITE_ID;

                                    setTimeout(async () => {
                                      var apiResponse_2 = await axios
                                        .get(
                                          `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${id}/`,
                                          {
                                            headers: headers,
                                          }
                                        )
                                        .then(async (onThumbnailGetSuccess) => {
                                          console.log(
                                            "on thumbnail get success: ",
                                            onThumbnailGetSuccess.data
                                          );

                                          var filter = {
                                            _id: thumbnailObj._id,
                                          };

                                          var updatedData = {
                                            thumbnail_id: id,
                                            static_thumbnail_url:
                                              onThumbnailGetSuccess.data
                                                .delivery_url,
                                            banner_thumbnail_url:
                                              onThumbnailGetSuccess.data
                                                .delivery_url,
                                            thumbnail_type: "jw_player",
                                          };
                                          var updatedThumbnail =
                                            await Thumbnail.findByIdAndUpdate(
                                              filter,
                                              updatedData,
                                              {
                                                new: true,
                                              }
                                            )
                                              .then(
                                                async (onThumbnailUpdate) => {
                                                  console.log(
                                                    "on thumbnail update: ",
                                                    onThumbnailUpdate
                                                  );

                                                  var filter = {
                                                    _id: mediaObj._id,
                                                  };

                                                  var updateData = {
                                                    title,
                                                    description,
                                                    jw_tags,
                                                    category,
                                                    default_language,
                                                    release_year,
                                                    genres,
                                                    seo_tags,
                                                    rating,
                                                    monetization,
                                                  };

                                                  var updatedMedia =
                                                    await TvShow.findByIdAndUpdate(
                                                      filter,
                                                      updateData,
                                                      { new: true }
                                                    )
                                                      .then(
                                                        async (
                                                          onMediaGcUpdate
                                                        ) => {
                                                          var gcFilter = {
                                                            _id: general_content_obj._id,
                                                          };

                                                          var gcUpdateData = {
                                                            availability,
                                                            content_type,
                                                            status,
                                                            genre: genres,
                                                          };

                                                          var updatedGc =
                                                            await TvShow.findByIdAndUpdate(
                                                              gcFilter,
                                                              gcUpdateData,
                                                              {
                                                                new: true,
                                                              }
                                                            )
                                                              .then(
                                                                async (
                                                                  onNewGc_2
                                                                ) => {
                                                                  console.log(
                                                                    "on new gc 2: ",
                                                                    onNewGc_2
                                                                  );

                                                                  console.log(
                                                                    "on media gc update: ",
                                                                    onMediaGcUpdate
                                                                  );
                                                                  res.json({
                                                                    message:
                                                                      "General info and thumbnail updated!",
                                                                    status:
                                                                      "200",
                                                                    updatedMedia:
                                                                      onMediaGcUpdate,
                                                                    updatedThumbnail:
                                                                      onThumbnailUpdate,
                                                                  });
                                                                }
                                                              )
                                                              .catch(
                                                                async (
                                                                  onNewGc_2Error
                                                                ) => {
                                                                  console.log(
                                                                    "on new gc error 2: ",
                                                                    onNewGc_2Error
                                                                  );
                                                                }
                                                              );
                                                        }
                                                      )
                                                      .catch(
                                                        async (
                                                          onMediaGcUpdateError
                                                        ) => {
                                                          console.log(
                                                            "on media gc update error: ",
                                                            onMediaGcUpdateError
                                                          );
                                                          res.json({
                                                            message:
                                                              "Something went wrong while updating general info!",
                                                            status: "400",
                                                            error:
                                                              onMediaGcUpdateError,
                                                          });
                                                        }
                                                      );
                                                }
                                              )
                                              .catch(
                                                async (
                                                  onThumbnailUpdateError2
                                                ) => {
                                                  console.log(
                                                    "on thumbnail update error 2: ",
                                                    onThumbnailUpdateError2
                                                  );
                                                  res.json({
                                                    message:
                                                      "Something went wrong while updating thumbnail!",
                                                    status: "400",
                                                    error:
                                                      onThumbnailUpdateError2,
                                                  });
                                                }
                                              );
                                        })
                                        .catch(async (onThumbnailGetError) => {
                                          console.log(
                                            "on thumbnail get error: ",
                                            onThumbnailGetError
                                          );
                                          res.json({
                                            message:
                                              "Something went wrong while updating thumbnail!",
                                            status: "400",
                                            error: onThumbnailGetError,
                                          });
                                        });
                                    }, 7000);
                                  })
                                  .catch(async (onJwThumbnailUploadError) => {
                                    console.log(
                                      "on jw thumbnail upload error: 2  ",
                                      onJwThumbnailUploadError.data.response
                                    );
                                    res.json({
                                      message:
                                        "Something went wrong while updating thumbnail!",
                                      status: "400",
                                      error: onJwThumbnailUploadError,
                                    });
                                  });
                              })
                              .catch(async (onCloudinaryUploadError) => {
                                console.log(
                                  "on cloudinary upload error: ",
                                  onCloudinaryUploadError
                                );
                                res.json({
                                  message:
                                    "Something went wrong while updating thumbnail!",
                                  status: "400",
                                  error: onCloudinaryUploadError,
                                });
                              });
                          })
                          .catch(async (onJwThumbnailDeleteError) => {
                            console.log(
                              "on jw thumbnail delete error: ",
                              onJwThumbnailDeleteError
                            );
                            res.json({
                              message:
                                "Something went wrong while updating thumbnail!",
                              status: "400",
                              error: onJwThumbnailDeleteError,
                            });
                          });
                      }
                    } else {
                      // empty
                      // new code will be added here

                      cloudinary.config(cloudinaryConfigObj);

                      cloudinary.uploader
                        .upload(thumbnailImageBase64)
                        .then(async (onCloudinaryUploadSuccess) => {
                          console.log(
                            "on cloudinary upload success: ",
                            onCloudinaryUploadSuccess
                          );
                          var public_id_3 = onCloudinaryUploadSuccess.public_id;

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
                              download_url: `${onCloudinaryUploadSuccess.secure_url}`,
                            },
                          };

                          // var headers = {
                          //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
                          // };

                          var apiResponse_5 = await axios
                            .post(
                              `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails`,
                              data,
                              {
                                headers: headers,
                              }
                            )
                            .then(async (onJwThumbnailUploadSuccess) => {
                              console.log(
                                "on jw thumbnail upload success: ",
                                onJwThumbnailUploadSuccess
                              );

                              var { id } = onJwThumbnailUploadSuccess.data;
                              var site_id = process.env.SITE_ID;

                              setTimeout(async () => {
                                // var headers = {
                                //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
                                // };

                                console.log(" headers: ", headers);

                                var apiResponse_6 = await axios
                                  .get(
                                    `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails/${id}/`,
                                    {
                                      headers: headers,
                                    }
                                  )
                                  .then(async (onThumbnailGet) => {
                                    console.log(
                                      "on thumbnail get: ",
                                      onThumbnailGet
                                    );

                                    var filter = {
                                      _id: thumbnailObj._id,
                                    };

                                    var updatedData = {
                                      thumbnail_id: id,
                                      static_thumbnail_url:
                                        onThumbnailGet.data.delivery_url,
                                      banner_thumbnail_url:
                                        onThumbnailGet.data.delivery_url,
                                      thumbnail_type: "jw_player",
                                    };

                                    var updatedThumbnail =
                                      await Thumbnail.findByIdAndUpdate(
                                        filter,
                                        updatedData,
                                        {
                                          new: true,
                                        }
                                      )
                                        .then(
                                          async (onThumbnailUpdateSuccess) => {
                                            console.log(
                                              "on thumbnail update success: ",
                                              onThumbnailUpdateSuccess
                                            );

                                            cloudinary.uploader
                                              .destroy(public_id_3)
                                              .then(async (deleteSuccess) => {
                                                console.log(
                                                  "delete success: ",
                                                  deleteSuccess
                                                );

                                                var filter = {
                                                  _id: mediaObj._id,
                                                };

                                                var updateData = {
                                                  title,
                                                  description,
                                                  jw_tags,
                                                  category,
                                                  default_language,
                                                  release_year,
                                                  genres,
                                                  seo_tags,
                                                  rating,
                                                  monetization,
                                                };

                                                var updatedMedia =
                                                  await TvShow.findByIdAndUpdate(
                                                    filter,
                                                    updateData,
                                                    { new: true }
                                                  )
                                                    .then(
                                                      async (
                                                        onGcMediaUpdateSuccess
                                                      ) => {
                                                        console.log(
                                                          "on gc media success: ",
                                                          onGcMediaUpdateSuccess
                                                        );

                                                        var gcFilter = {
                                                          _id: general_content_obj._id,
                                                        };

                                                        var gcUpdateData = {
                                                          availability,
                                                          content_type,
                                                          status,
                                                          genre: genres,
                                                        };

                                                        var updatedGc =
                                                          await TvShow.findByIdAndUpdate(
                                                            gcFilter,
                                                            gcUpdateData,
                                                            {
                                                              new: true,
                                                            }
                                                          )
                                                            .then(
                                                              async (
                                                                onNewGc_3
                                                              ) => {
                                                                console.log(
                                                                  "on new gc 3:  ",
                                                                  onNewGc_3
                                                                );
                                                                res.json({
                                                                  message:
                                                                    "General info and thumbnail updated!",
                                                                  status: "200",
                                                                  updatedMedia:
                                                                    onGcMediaUpdateSuccess,
                                                                  updatedThumbnail:
                                                                    onThumbnailUpdateSuccess,
                                                                });
                                                              }
                                                            )
                                                            .catch(
                                                              async (
                                                                onNewGc_3Error
                                                              ) => {
                                                                console.log(
                                                                  "on new gc error: ",
                                                                  onNewGc_3Error
                                                                );
                                                              }
                                                            );
                                                      }
                                                    )
                                                    .catch(
                                                      async (
                                                        onGcMediaError
                                                      ) => {
                                                        console.log(
                                                          "on gc media error: ",
                                                          onGcMediaError
                                                        );
                                                        res.json({
                                                          message:
                                                            "Something went wrong while updating general info!",
                                                          status: "400",
                                                          error: onGcMediaError,
                                                        });
                                                      }
                                                    );
                                              })
                                              .catch(async (deleteError) => {
                                                console.log(
                                                  "delete error: ",
                                                  deleteError
                                                );
                                                res.json({
                                                  message:
                                                    "Something went wrong while updating thumbnail!",
                                                  status: "400",
                                                  error: deleteError,
                                                });
                                              });
                                          }
                                        )
                                        .catch(
                                          async (onThumbnailUpdateError) => {
                                            console.log(
                                              "on thumbnail update error: 1  ",
                                              onThumbnailUpdateError
                                            );
                                            res.json({
                                              message:
                                                "Something went wrong while updating thumbnail!",
                                              status: "400",
                                              error: onThumbnailUpdateError,
                                            });
                                          }
                                        );
                                  })
                                  .catch(async (onThumbnailGetError) => {
                                    console.log(
                                      "on thumbnail get error: ",
                                      onThumbnailGetError
                                    );
                                    res.json({
                                      message:
                                        "Something went wrong while updating thumbnail!",
                                      status: "400",
                                      error: onThumbnailGetError,
                                    });
                                  });
                              }, 7000);
                            })
                            .catch(async (onJwThumbnailUploadError) => {
                              console.log(
                                "on jw thumbnail upload error: 3  ",
                                onJwThumbnailUploadError.response.data
                              );
                              res.json({
                                message:
                                  "Something went wrong while updating thumbnail!",
                                status: "400",
                                error: onJwThumbnailUploadError,
                              });
                            });
                        })
                        .catch(async (onCloudinaryUploadError) => {
                          console.log(
                            "on cloudinary upload error: ",
                            onCloudinaryUploadError
                          );
                          res.json({
                            message:
                              "Something went wrong while updating thumbnail!",
                            status: "400",
                            error: onCloudinaryUploadError,
                          });
                        });
                    }
                  })
                  .catch(async (onThumbnailNotFound) => {
                    console.log(
                      "on thumbnail not found: ",
                      onThumbnailNotFound
                    );
                    res.json({
                      message: "Thumbnail Not Found!",
                      status: "404",
                      error: onThumbnailNotFound,
                    });
                  });
              } else {
                // no media id

                var thumbnail = await Thumbnail.findById(
                  general_content_obj.thumbnail
                )
                  .then(async (onThumbnailFound) => {
                    var thumbnailObj = onThumbnailFound;

                    if (
                      thumbnailObj.static_thumbnail_url &&
                      thumbnailObj.static_thumbnail_url !== ""
                    ) {
                      // not empty

                      cloudinary.config(cloudinaryConfigObj);

                      cloudinary.uploader
                        .destroy(thumbnailObj.cloudinary_public_id)
                        .then(async (deleteCloudinarySuccess) => {
                          console.log(
                            "delete cloudinary success: ",
                            deleteCloudinarySuccess
                          );

                          cloudinary.config(cloudinaryConfigObj);
                          cloudinary.uploader
                            .upload(thumbnailImageBase64, {
                              folder: "thumbnails",
                            })
                            .then(async (onCloudinaryUploadSuccess) => {
                              console.log(
                                "on cloudinary upload success: ",
                                onCloudinaryUploadSuccess
                              );

                              var filter = {
                                _id: thumbnailObj._id,
                              };

                              var updateData = {
                                static_thumbnail_url:
                                  onCloudinaryUploadSuccess.secure_url,
                                banner_thumbnail_url:
                                  onCloudinaryUploadSuccess.secure_url,
                                cloudinary_public_id:
                                  onCloudinaryUploadSuccess.public_id,
                                thumbnail_type: "cloudinary",
                                general_content: general_content_obj._id,
                              };

                              var updatedThumbnail =
                                await Thumbnail.findByIdAndUpdate(
                                  filter,
                                  updateData,
                                  {
                                    new: true,
                                  }
                                )
                                  .then(async (onThumbnailUpdate) => {
                                    console.log(
                                      "on thumbnail update: ",
                                      onThumbnailUpdate
                                    );

                                    var filter = {
                                      _id: mediaObj._id,
                                    };

                                    var updateData = {
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
                                      monetization,
                                    };

                                    var updatedMedia =
                                      await TvShow.findByIdAndUpdate(
                                        filter,
                                        updateData,
                                        { new: true }
                                      )
                                        .then(
                                          async (onGcMediaUpdateSuccess) => {
                                            console.log(
                                              "on media update success: ",
                                              onGcMediaUpdateSuccess
                                            );

                                            var gcFilter = {
                                              _id: general_content_obj._id,
                                            };

                                            var gcUpdateData = {
                                              availability,
                                              content_type,
                                              status,
                                              genre: genres,
                                            };

                                            var updatedGc =
                                              await TvShow.findByIdAndUpdate(
                                                gcFilter,
                                                gcUpdateData,
                                                {
                                                  new: true,
                                                }
                                              )
                                                .then(async (onNewGc_4) => {
                                                  console.log(
                                                    "on new gc 4: ",
                                                    onNewGc_4
                                                  );
                                                  res.json({
                                                    message:
                                                      "General info and thumbnail updated!",
                                                    status: "200",
                                                    updatedMedia:
                                                      onGcMediaUpdateSuccess,
                                                    updatedThumbnail:
                                                      onThumbnailUpdate,
                                                  });
                                                })
                                                .catch(
                                                  async (onNewGc_4Error) => {
                                                    console.log(
                                                      "on new gc error: ",
                                                      onNewGc_4Error
                                                    );
                                                  }
                                                );
                                          }
                                        )
                                        .catch(async (onGcMediaUpdateError) => {
                                          console.log(
                                            "on gc media update error: ",
                                            onGcFound
                                          );
                                          res.json({
                                            message:
                                              "Something went wrong while updating general info!",
                                            status: "400",
                                            error: onGcMediaUpdateError,
                                          });
                                        });
                                  })
                                  .catch(async (onThumbnailUpdateError) => {
                                    console.log(
                                      "on thumbnail upload error: ",
                                      onThumbnailUpdateError
                                    );
                                    res.json({
                                      message:
                                        "Something went wrong while updating thumbnail!",
                                      status: "400",
                                      error: onThumbnailUpdateError,
                                    });
                                  });
                            })
                            .catch(async (onCloudinaryUploadError) => {
                              console.log(
                                "on cloudinary upload error: ",
                                onCloudinaryUploadError
                              );
                              res.json({
                                message:
                                  "Something went wrong while updating thumbnail!",
                                status: "400",
                                error: onCloudinaryUploadError,
                              });
                            });
                        })
                        .catch(async (deleteCloudinaryError) => {
                          console.log(
                            "delete cloudinary error: ",
                            deleteCloudinaryError
                          );
                          res.json({
                            message:
                              "Something went wrong while updating thumbnail!",
                            status: "400",
                            error: deleteCloudinaryError,
                          });
                        });
                    } else {
                      // empty

                      cloudinary.config(cloudinaryConfigObj);
                      cloudinary.uploader
                        .upload(thumbnailImageBase64)
                        .then(async (cloudinaryUploadSuccess) => {
                          console.log(
                            "cloudinary upload success: ",
                            cloudinaryUploadSuccess
                          );

                          var filter = {
                            _id: thumbnailObj._id,
                          };

                          var updateData = {
                            static_thumbnail_url:
                              cloudinaryUploadSuccess.secure_url,
                            banner_thumbnail_url:
                              cloudinaryUploadSuccess.secure_url,
                            cloudinary_public_id:
                              cloudinaryUploadSuccess.public_id,
                            thumbnail_type: "cloudinary",
                            general_content: general_content_obj._id,
                          };

                          var updatedThumbnail =
                            await Thumbnail.findByIdAndUpdate(
                              filter,
                              updateData,
                              {
                                new: true,
                              }
                            )
                              .then(async (onThumbnailUpdate) => {
                                console.log(
                                  "on thumbnail update: ",
                                  onThumbnailUpdate
                                );

                                var filter = {
                                  _id: mediaObj._id,
                                };

                                var updateData = {
                                  title,
                                  description,
                                  jw_tags,
                                  category,
                                  default_language,
                                  release_year,
                                  genres,
                                  seo_tags,
                                  rating,
                                  monetization,
                                };

                                var updatedMedia =
                                  await TvShow.findByIdAndUpdate(
                                    filter,
                                    updateData,
                                    { new: true }
                                  )
                                    .then(async (onGcMediaUpdateSuccess) => {
                                      console.log(
                                        "on gc media update success: ",
                                        onGcMediaUpdateSuccess
                                      );

                                      var gcFilter = {
                                        _id: general_content_obj._id,
                                      };

                                      var gcUpdateData = {
                                        availability,
                                        content_type,
                                        status,
                                        genre: genres,
                                      };

                                      var updatedGc =
                                        await TvShow.findByIdAndUpdate(
                                          gcFilter,
                                          gcUpdateData,
                                          {
                                            new: true,
                                          }
                                        )
                                          .then(async (onNewGc_5) => {
                                            console.log(
                                              "on new gc 5: ",
                                              onNewGc_5
                                            );
                                            res.json({
                                              message:
                                                "General info and thumbnail updated!",
                                              status: "200",
                                              updatedMedia:
                                                onGcMediaUpdateSuccess,
                                              updatedThumbnail:
                                                onThumbnailUpdate,
                                            });
                                          })
                                          .catch(async (onNewGc_5Error) => {
                                            console.log(
                                              "on new gc error 5: ",
                                              onNewGc_5Error
                                            );
                                          });
                                    })
                                    .catch(async (onGcMediaUpdateError) => {
                                      console.log(
                                        "on gc media update error: ",
                                        onGcMediaUpdateError
                                      );
                                      res.json({
                                        message:
                                          "Something went wrong while updating thumbnail!",
                                        status: "400",
                                        error: onGcMediaUpdateError,
                                      });
                                    });
                              })
                              .catch(async (onThumbnailUpdateError) => {
                                console.log(
                                  "on thumbnail update error: ",
                                  onThumbnailUpdateError
                                );
                                res.json({
                                  message:
                                    "Something went wrong while updating thumbnail!",
                                  status: "400",
                                  error: onThumbnailUpdateError,
                                });
                              });
                        })
                        .catch(async (cloudinaryUploadError) => {
                          console.log(
                            "cloudinary upload error: ",
                            cloudinaryUploadError
                          );
                          res.json({
                            message:
                              "Something went wrong while updating thumbnail!",
                            status: "400",
                            error: cloudinaryUploadError,
                          });
                        });
                    }
                  })
                  .catch(async (onThumbnailNotFound) => {
                    console.log(
                      "on thumbnail not found: ",
                      onThumbnailNotFound
                    );
                    res.json({
                      message: "Thumbnail Not Found!",
                      status: "404",
                      error: onThumbnailNotFound,
                    });
                  });
              }
            })
            .catch((onMediaNotFound) => {
              console.log("media not found: ");
              res.json({
                message: "Media not found!",
                status: "404",
                error: onMediaNotFound,
              });
            });
        })
        .catch((onNotFoundGc) => {
          console.log("gc not found: ");
          res.json({
            message: "General content not found!",
            status: "404",
            error: onNotFoundGc,
          });
        });
    } else {
      var general_content = await TvShow.findById({
        _id: general_content_id,
      })
        .then(async (onGcFound) => {
          console.log("on gc found: ");
          var general_content_obj = onGcFound;

          var media = await TvShow.findById({
            _id: general_content_id,
          })
            .then(async (onMediaFound) => {
              console.log("media found: ");

              var mediaObj = onMediaFound;

              var filter = {
                _id: mediaObj._id,
              };

              var updateData = {
                title,
                description,
                jw_tags,
                category,
                default_language,
                release_year,
                genres,
                seo_tags,
                rating,
                monetization,
              };

              var updatedMedia = await TvShow.findByIdAndUpdate(
                filter,
                updateData,
                { new: true }
              )
                .then(async (onMediaUpdate) => {
                  console.log("media update: ", onMediaUpdate);

                  var gcFilter = {
                    _id: general_content_obj._id,
                  };

                  var gcUpdateData = {
                    availability,
                    content_type,
                    status,
                    genre: genres,
                  };

                  var updatedGc = await TvShow.findByIdAndUpdate(
                    gcFilter,
                    gcUpdateData,
                    {
                      new: true,
                    }
                  )
                    .then(async (onNewGc_6) => {
                      console.log("on new gc 6: ", onNewGc_6);
                      res.json({
                        message: "General content updated!",
                        status: "200",
                        updatedMedia: onMediaUpdate,
                        updatedGc: onNewGc_6,
                      });
                    })
                    .catch(async (onNewGc_6Error) => {
                      console.log("on new gc 6 error: ", onNewGc_6Error);
                    });
                })
                .catch((onMediaNotUpdate) => {
                  console.log("media not update: ", onMediaNotUpdate);
                  res.json({
                    message:
                      "Something went wrong while updating general content!",
                    status: "400",
                    error: onMediaNotUpdate,
                  });
                });
            })
            .catch((onMediaNotFound) => {
              console.log("media not found: ");
              res.json({
                message: "Media not found!",
                status: "404",
                error: onMediaNotFound,
              });
            });
        })
        .catch((onNotFoundGc) => {
          console.log("gc not found: ");
          res.json({
            message: "General content not found!",
            status: "404",
            error: onNotFoundGc,
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

module.exports = {
  createTvShow,
  geAllTvShows,
  getSeasonsOfATvShow,
  createSeasonOfAtvShow,
  getTvShow,
  updateTvShow,
};
