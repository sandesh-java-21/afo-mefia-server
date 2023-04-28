const Media = require("../models/Media");
const Trailer = require("../models/Trailer");
const GeneralContent = require("../models/GeneralContent");
const Thumbnail = require("../models/Thumbnail");

const axios = require("axios");
const { getVideoDurationInSeconds } = require("get-video-duration");

const uploadTrailerOfGeneralContent = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var { download_url, type } = req.body;

    var generalContent = await GeneralContent.findById({
      _id: general_content_id,
    })

      .then(async (foundGC) => {
        var generalContentObj = foundGC;
        console.log("Media id:", generalContentObj.media);

        var media = await Media.findById({
          _id: generalContentObj.media,
        })
          .then(async (foundMedia) => {
            console.log("found media!");
            var mediaObj = foundMedia;

            var video_duration = getVideoDurationInSeconds(
              `${download_url}`
            ).then(async (duration) => {
              var data = {
                upload: {
                  method: "fetch",
                  download_url: `${download_url}`,
                },
                metadata: {
                  custom_params: {
                    category: `${generalContentObj.category}`,
                  },
                  title: `${mediaObj.title} Trailer`,
                  description: mediaObj.description,
                  // author: author,
                  duration: duration * 1000,
                  // category: `${category}`,
                  tags: mediaObj.jw_tags,
                  language: mediaObj.default_language,
                },
              };

              var headers = {
                Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
              };

              var apiResponse = await axios
                .post(
                  "https://api.jwplayer.com/v2/sites/yP9ghzCy/media",
                  data,
                  {
                    headers: headers,
                  }
                )
                .then(async (result) => {
                  var { duration, id } = result.data;

                  var trailerObj = new Trailer({
                    media_id: id,
                    subtitles: [],
                    audio_tracks: [],
                    type: type,
                  });

                  var savedTrailer = await trailerObj.save();

                  var filter = {
                    _id: generalContentObj._id,
                  };
                  var updateGcData = {
                    trailer: savedTrailer._id,
                  };

                  var updatedGc = await GeneralContent.findByIdAndUpdate(
                    filter,
                    updateGcData,
                    {
                      new: true,
                    }
                  )
                    .then((result2) => {
                      res.json({
                        message: "Trailer uploaded!",
                        status: "200",
                        savedTrailer,
                        updatedGc: result2,
                      });
                    })
                    .catch((error) => {
                      console.log("Database update error: ", error);
                      res.json({
                        message:
                          "Something went wrong while saving trailet to database!",
                        status: "400",
                        error,
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
            });
          })
          .catch((error) => {
            console.log("media not found!");
            res.json({
              message: "Media not found!",
              status: "404",
              error,
            });
          });
      })

      .catch((error) => {
        console.log("not found gc");

        res.json({
          message: "No general content found with provided id!",
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

const uploadTrailerOfGeneralContentUpdated = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    var { trailer_media_id, type } = req.body;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (onGcFound) => {
        var generalContentObj = onGcFound;

        var media = await Media.findById(generalContentObj.media)
          .then(async (onMediaFound) => {
            console.log("on media found: ", onMediaFound);

            var mediaObj2 = onMediaFound;

            var headers = {
              Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            };

            setTimeout(async () => {
              var apiResponse = await axios
                .get(
                  `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails/?q=media_id:${trailer_media_id}`,
                  {
                    headers: headers,
                  }
                )
                .then(async (thumbnailResult) => {
                  var { thumbnails } = thumbnailResult.data;

                  var thumbnail = await Thumbnail.findById(
                    generalContentObj.thumbnail
                  ).then(async (onThumbnailFound) => {
                    var thumbnailFilter = {
                      _id: onThumbnailFound._id,
                    };

                    var thumbnailUpdate = {
                      trailer_motion_url:
                        thumbnailResult.data.thumbnails[0].delivery_url,
                    };

                    var updatedThumbnail = await Thumbnail.findByIdAndUpdate(
                      thumbnailFilter,
                      thumbnailUpdate,
                      {
                        new: true,
                      }
                    )
                      .then(async (onThumbnailUpdate) => {
                        console.log("on thumbnail update: ", onThumbnailUpdate);

                        var foundTrailer = await Trailer.findById(
                          generalContentObj.trailer
                        )
                          .then(async (onTrailerFound) => {
                            console.log("on trailer found: ", onTrailerFound);

                            var trailerFilter = {
                              _id: onTrailerFound._id,
                            };

                            var trailerUpdate = {
                              media_id: trailer_media_id,
                              subtitles: [],
                              audio_tracks: [],
                              type: "Trailer",
                            };

                            var updatedTraile = await Trailer.findByIdAndUpdate(
                              thumbnailFilter,
                              trailerUpdate,
                              {
                                new: true,
                              }
                            )
                              .then(async (onTrailerUpdate) => {
                                console.log(
                                  "on trailer update: ",
                                  onTrailerUpdate
                                );

                                var filter = {
                                  _id: generalContentObj._id,
                                };
                                var updateGcData = {
                                  trailer: onTrailerUpdate._id,
                                };

                                var updatedGc =
                                  await GeneralContent.findByIdAndUpdate(
                                    filter,
                                    updateGcData,
                                    {
                                      new: true,
                                    }
                                  )
                                    .then((result2) => {
                                      res.json({
                                        message: "Trailer uploaded!",
                                        status: "200",
                                        savedTrailer: onTrailerUpdate,
                                        updatedGc: result2,
                                        trailer_motion_url:
                                          thumbnailResult.data.thumbnails[0]
                                            .delivery_url,
                                      });
                                    })
                                    .catch((error) => {
                                      console.log(
                                        "Database update error: ",
                                        error
                                      );
                                      res.json({
                                        message:
                                          "Something went wrong while saving trailet to database!",
                                        status: "400",
                                        error,
                                      });
                                    });
                              })
                              .catch(async (onTrailerUpdateError) => {
                                console.log(
                                  "on trailer update error: ",
                                  onTrailerUpdateError
                                );
                                res.json({
                                  message: "Trailer update error!",
                                  status: "400",
                                  error: onTrailerUpdateError,
                                });
                              });
                          })
                          .catch(async (onTrailerFoundError) => {
                            console.log(
                              "on trailer found error: ",
                              onTrailerFoundError
                            );
                            res.json({
                              message: "Trailer not found!",
                              status: "404",
                              error: onTrailerFoundError,
                            });
                          });

                        // var trailerObj = new Trailer({
                        //   media_id: trailer_media_id,
                        //   subtitles: [],
                        //   audio_tracks: [],
                        //   type: "Trailer",
                        // });

                        // var savedTrailer = await trailerObj.save();

                        // var filter = {
                        //   _id: generalContentObj._id,
                        // };
                        // var updateGcData = {
                        //   trailer: savedTrailer._id,
                        // };

                        // var updatedGc = await GeneralContent.findByIdAndUpdate(
                        //   filter,
                        //   updateGcData,
                        //   {
                        //     new: true,
                        //   }
                        // )
                        //   .then((result2) => {
                        //     res.json({
                        //       message: "Trailer uploaded!",
                        //       status: "200",
                        //       savedTrailer,
                        //       updatedGc: result2,
                        //       trailer_motion_url:
                        //         thumbnailResult.data.thumbnails[0].delivery_url,
                        //     });
                        //   })
                        //   .catch((error) => {
                        //     console.log("Database update error: ", error);
                        //     res.json({
                        //       message:
                        //         "Something went wrong while saving trailet to database!",
                        //       status: "400",
                        //       error,
                        //     });
                        //   });
                      })
                      .catch(async (onThumbnailUpdateError) => {
                        console.log(
                          "on thumbnail update error: ",
                          onThumbnailUpdateError
                        );
                        res.json({
                          message:
                            "Something went wrong while updating trailer thumbnail!",
                          status: "400",
                          error: onThumbnailUpdateError,
                        });
                      });
                  });

                  // var thumbnailObj = new Thumbnail({
                  //   general_content: generalContentObj._id,
                  //   trailer_motion_url:
                  //     thumbnailResult.data.thumbnails[0].delivery_url,
                  // });

                  // var savedThumbnail = await thumbnailObj.save();

                  // var trailerObj = new Trailer({
                  //   media_id: trailer_media_id,
                  //   subtitles: [],
                  //   audio_tracks: [],
                  //   type: "Trailer",
                  // });

                  // var savedTrailer = await trailerObj.save();

                  // var filter = {
                  //   _id: generalContentObj._id,
                  // };
                  // var updateGcData = {
                  //   trailer: savedTrailer._id,
                  // };

                  // var updatedGc = await GeneralContent.findByIdAndUpdate(
                  //   filter,
                  //   updateGcData,
                  //   {
                  //     new: true,
                  //   }
                  // )
                  //   .then((result2) => {
                  //     res.json({
                  //       message: "Trailer uploaded!",
                  //       status: "200",
                  //       savedTrailer,
                  //       updatedGc: result2,
                  //       trailer_motion_url: thumbnails[1].delivery_url,
                  //     });
                  //   })
                  //   .catch((error) => {
                  //     console.log("Database update error: ", error);
                  //     res.json({
                  //       message:
                  //         "Something went wrong while saving trailet to database!",
                  //       status: "400",
                  //       error,
                  //     });
                  //   });
                })

                // var apiResponse = await axios
                //   .get(
                //     `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails/?q=media_id:${trailer_media_id}`,
                //     {
                //       headers: headers,
                //     }
                //   )
                //   .then(async (thumbnailResult) => {
                //     var { thumbnails } = thumbnailResult.data;

                //     console.log("url: ", thumbnailResult.data);

                //     var thumbnailObj = new Thumbnail({
                //       general_content: generalContentObj._id,
                //       trailer_motion_url:
                //         thumbnailResult.data.thumbnails[0].delivery_url,
                //     });

                //     var savedThumbnail = await thumbnailObj.save();

                //     var trailerObj = new Trailer({
                //       media_id: trailer_media_id,
                //       subtitles: [],
                //       audio_tracks: [],
                //       type: "Trailer",
                //     });

                //     var savedTrailer = await trailerObj.save();

                //     var filter = {
                //       _id: generalContentObj._id,
                //     };
                //     var updateGcData = {
                //       trailer: savedTrailer._id,
                //     };

                //     var updatedGc = await GeneralContent.findByIdAndUpdate(
                //       filter,
                //       updateGcData,
                //       {
                //         new: true,
                //       }
                //     )
                //       .then((result2) => {
                //         res.json({
                //           message: "Trailer uploaded!",
                //           status: "200",
                //           savedTrailer,
                //           updatedGc: result2,
                //           trailer_motion_url: thumbnails[1].delivery_url,
                //         });
                //       })
                //       .catch((error) => {
                //         console.log("Database update error: ", error);
                //         res.json({
                //           message:
                //             "Something went wrong while saving trailet to database!",
                //           status: "400",
                //           error,
                //         });
                //       });
                //   })
                .catch(async (jwUploadError) => {
                  console.log("jw upload error: ", jwUploadError);
                  res.json({
                    message:
                      "Something went wrong while generating motion video!",
                    status: "400",
                    error: jwUploadError,
                  });
                });
            }, 10000);
          })
          .catch(async (onMediaNotFound) => {
            console.log("on media not found: ", onMediaNotFound);
            res.json({
              message: "Media not found!",
              status: "404",
            });
          });

        // var trailerObj = new Trailer({
        //   media_id: trailer_media_id,
        //   subtitles: [],
        //   audio_tracks: [],
        //   type: "Trailer",
        // });

        // var savedTrailer = await trailerObj.save();

        // var filter = {
        //   _id: generalContentObj._id,
        // };
        // var updateGcData = {
        //   trailer: savedTrailer._id,
        // };

        // var updatedGc = await GeneralContent.findByIdAndUpdate(
        //   filter,
        //   updateGcData,
        //   {
        //     new: true,
        //   }
        // )
        //   .then((result2) => {
        //     res.json({
        //       message: "Trailer uploaded!",
        //       status: "200",
        //       savedTrailer,
        //       updatedGc: result2,
        //     });
        //   })
        //   .catch((error) => {
        //     console.log("Database update error: ", error);
        //     res.json({
        //       message: "Something went wrong while saving trailet to database!",
        //       status: "400",
        //       error,
        //     });
        //   });
      })
      .catch((onGcNotFound) => {
        console.log("gc not found: ", onGcNotFound);
        res.json({
          message: "General content not found!",
          status: "404",
        });
      });
  } catch (error) {
    res.json({
      message: "internal server error!",
      status: "500",
      error,
    });
  }
};

const uploadTrailerMediaIdToMediaObject = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var { trailer_media_id } = req.body;

    if (!general_content_id || general_content_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var general_content = await GeneralContent.findById(general_content_id)
        .then(async (onGcFound) => {
          console.log("gc found: ", onGcFound);

          mediaObjId = onGcFound.media;

          var mediaObj = await Media.findById(mediaObjId)
            .then(async (onMediaFound) => {
              console.log("on media found: ", onMediaFound);

              var media_Obj_Id = onMediaFound._id;

              var filter = {
                _id: media_Obj_Id,
              };

              var mediaUpdateData = {
                media_id: trailer_media_id,
              };

              var updatedMedia = await Media.findByIdAndUpdate(
                filter,
                mediaUpdateData,
                {
                  new: true,
                }
              )
                .then(async (onMediaUpdate) => {
                  console.log("on media update: ", onMediaUpdate);

                  res.json({
                    message: "Trailer media updated!",
                    status: "200",
                    updatedMedia: onMediaUpdate,
                  });
                })
                .catch(async (onMediaNotUpdate) => {
                  console.log("on media not update: ", onMediaNotUpdate);
                  res.json({
                    message: "Something went wrong while updating media!",
                    status: "400",
                    error: onMediaNotUpdate,
                  });
                });
            })
            .catch(async (onMediaNotFound) => {
              console.log("on media not found: ", onMediaNotFound);
              res.json({
                message: "Media not found!",
                status: "404",
                error: onMediaNotFound,
              });
            });
        })
        .catch(async (onGcNotFound) => {
          console.log("on gc not found: ", onGcNotFound);
          res.json({
            message: "General content not found!",
            status: "404",
            error: onGcNotFound,
          });
        });
    }
  } catch (error) {
    res.json({
      message: "internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  uploadTrailerOfGeneralContent,
  uploadTrailerOfGeneralContentUpdated,
  uploadTrailerMediaIdToMediaObject,
};
