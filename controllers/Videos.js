const GeneralContent = require("../models/GeneralContent");
const Media = require("../models/Media");
const Thumbnail = require("../models/Thumbnail");
const Video = require("../models/Video");
const LanguagesContent = require("../models/LanguagesContent");
const axios = require("axios");
const Subtitles = require("../models/Subtitles");
const AudioTracks = require("../models/AudioTracks");
const Slider = require("../models/Slider");
const Trailer = require("../models/Trailer");
const createVideo = async (req, res) => {
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
      isThumbanilSelected,
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
      status
    );

    category = "video";

    if (!title) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      if (isThumbanilSelected) {
        cloudinary.config(cloudinaryConfigObj);

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

                      var videoContentObj = new Video({
                        media: savedMedia._id,
                        category: category,
                        genre: genres,
                        rating: rating,
                        status: status,
                        thumbnail: savedThumbnail._id,
                      });

                      var savedVideoContent = await videoContentObj.save();

                      res.json({
                        message: "Media and general content created!",
                        status: "200",
                        savedVideoContent,
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
                  error: jwThumbnailError,
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

        var generalVideoObj = new Video({
          media: savedMedia._id,
          category: category,
          genre: genres,
          rating: rating,
          status: status,
          thumbnail: savedThumbnail._id,
        });

        var savedVideoContent = await generalVideoObj.save();

        res.json({
          message: "Media and general content created!",
          status: "200",
          savedVideoContent,
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

const deleteVideoById = async (req, res) => {
  // try {
  var video_content_id = req.params.video_content_id;
  console.log("video id: ", video_content_id);
  if (!video_content_id || video_content_id === "") {
    res.json({
      message: "Required fields are empty!",
      status: "400",
    });
  } else {
    var video_content = await Video.findById(video_content_id).then(
      async (onFoundVc) => {
        var video_content_obj = onFoundVc;
        console.log("video content found: ", onFoundVc);

        var media = await Media.findById({
          _id: video_content_obj.media,
        }).then(async (onMediaFound) => {
          var mediaObj = onMediaFound;

          var subtitles = mediaObj.subtitles;

          var audio_tracks = mediaObj.audio_tracks;

          var languages_content = mediaObj.languages_content;

          var headers = {
            Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
          };
          var media_id = mediaObj.media_id;
          var site_id = process.env.SITE_ID;

          var apiResponse = await axios
            .delete(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}`,
              {
                headers: headers,
              }
            )
            .then(async (onJwMediaDelete) => {
              console.log("JW media deleted: ", onJwMediaDelete);

              var subtitlesDeleted = await Subtitles.deleteMany({
                _id: { $in: subtitles },
              }).then(async (onSubtitlesDelete) => {
                console.log("Subtitles deleted: ", onSubtitlesDelete);

                var audioTracksDeleted = await AudioTracks.deleteMany({
                  _id: { $in: audio_tracks },
                }).then(async (onAudioTracksDelete) => {
                  console.log("Audio tracks deleted: ", onAudioTracksDelete);

                  var languagesContentDeleted =
                    await LanguagesContent.deleteMany({
                      _id: { $in: languages_content },
                    }).then(async (onLanguagesContentDelete) => {
                      console.log(
                        "languages content deleted: ",
                        onLanguagesContentDelete
                      );

                      var deletedSliderItem = await Slider.findOneAndDelete({
                        general_content: video_content_obj._id,
                      }).then(async (onSliderItemDelete) => {
                        console.log("slider item delete: ", onSliderItemDelete);

                        var thumbnailDeleted = await Thumbnail.findOneAndDelete(
                          {
                            general_content: video_content_obj._id,
                          }
                        ).then(async (onThumbnailDelete) => {
                          console.log(
                            "thumbnail delete success: ",
                            onThumbnailDelete
                          );

                          // var trailerDeleted = await Trailer.findByIdAndDelete({
                          //   _id: video_content_obj.trailer,
                          // }).then(async (onTrailerDelete) => {
                          // console.log(
                          //   "trailer deleted success: ",
                          //   onTrailerDelete
                          // );

                          var mediaDeleted = await Media.findByIdAndDelete({
                            _id: mediaObj._id,
                          }).then(async (onMediaDelete) => {
                            console.log(
                              "media delete success: ",
                              onMediaDelete
                            );

                            var deletedGeneralContent =
                              await Video.findByIdAndDelete({
                                _id: video_content_obj._id,
                              }).then(async (onGcDelete) => {
                                console.log("gc deleted: ", onGcDelete);
                                res.json({
                                  message: "Video content deleted!",
                                  status: "200",
                                });
                              });
                            // .catch(onGcDeleteError=>{
                            //   console.log("gc delete error: ", onGcDeleteError);
                            // })
                          });
                          // .catch(onMediaDeleteError=>{
                          //   console.log("media delete error: ", onMediaDeleteError);
                          // })
                          // });
                          // .catch(onTrailerDeleteError=>{
                          //   console.log("trailer delete error: ", onTrailerDeleteError);
                          // })
                        });
                        // .catch(onThumbnailDeleteError=>{
                        //   console.log("On thumbnail delete error: ", onThumbnailDeleteError);
                        // })
                      });
                      // .catch(onSliderItemDeleteError=>{
                      //   console.log(onSliderItemDeleteError);

                      // })
                    });
                  // .catch(onNoLanguagesContentDelete=>{
                  //   console.log("no languages content deleted: ", onNoLanguagesContentDelete);
                  // })
                });
                // .catch(onNoAudioTracksDelete=>{
                //   console.log("no audio tracks deleted: ", onNoAudioTracksDelete);
                // })
              });
              // .catch(onNoSubtitlesDelete=>{
              //   console.log(onNoSubtitlesDelete);
              // })
            })
            .catch((onJwMediaDeleteError) => {
              console.log(onJwMediaDeleteError);
              res.json({
                message:
                  "Something went wrong while deleting media from JW Player!",
                status: "400",
                error: onJwMediaDeleteError,
              });
            });
        });
        // .catch(onMediaNotFound=>{
        //   console.log(onMediaNotFound);
        // })
      }
    );
    // .catch((onNotFoundGc) => {
    //   res.json({
    //     message: "General content not found for provided id!",
    //     status: "404",
    //     onNotFoundGc,
    //   });
    // });
  }
  // } catch (error) {
  //   res.json({
  //     message: "Internal server error!",
  //     status: "500",
  //     error,
  //   });
  // }
};

const getVideoContent = async (req, res) => {
  try {
    var video_content_id = req.params.video_content_id;
    console.log(" video id: ", video_content_id);

    if (!video_content_id || video_content_id === "") {
      res.json({
        message: "Please provide a video content id!",
        status: "400",
      });
    } else {
      var video_content = await Video.findById({
        _id: video_content_id,
      })
        .populate(["media", "genre", "thumbnail"])
        .populate({
          path: "media",
          populate: [
            {
              path: "audio_tracks",
            },
            {
              path: "subtitles",
            },
            {
              path: "translated_content",
            },
          ],
        })
        .then(async (onVcFound) => {
          var videoContentObj = onVcFound;
          console.log("video content: ", onVcFound);
          res.json({
            videoContentObj,
          });
        })
        .catch((error) => {
          res.json({
            message: "Video content not found!",
            status: "404",
            error,
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

const updateVideoContent = async (req, res) => {
  try {
    var video_content_id = req.params.video_content_id;

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
    } = req.body;

    if (isThumbnailUpdated) {
      var { thumbnailImageBase64 } = req.body;

      var video_content = await Video.findById({
        _id: video_content_id,
      })
        .then(async (onGcFound) => {
          console.log("on gc found: ");
          var general_content_obj = onGcFound;

          var media = await Media.findById({
            _id: general_content_obj.media,
          })
            .then(async (onMediaFound) => {
              console.log("media found: ");

              var mediaObj = onMediaFound;

              if (mediaObj._id || mediaObj.media_id !== "") {
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
                                          `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
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
                                              )
                                                .then(
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
                                                    };

                                                    var updatedMedia =
                                                      await Media.findByIdAndUpdate(
                                                        filter,
                                                        updateData,
                                                        { new: true }
                                                      )
                                                        .then(
                                                          async (
                                                            onGcUpdate
                                                          ) => {
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
                                                            onGcUpdateError
                                                          ) => {
                                                            console.log(
                                                              "on gc update error: ",
                                                              onGcUpdateError
                                                            );
                                                            res.json({
                                                              message:
                                                                "something went wrong while updating general info!",
                                                              status: "400",
                                                              error:
                                                                onGcUpdateError,
                                                            });
                                                          }
                                                        );
                                                  }
                                                )
                                                .catch(
                                                  async (
                                                    onThumbnailUpdateError
                                                  ) => {
                                                    console.log(
                                                      "on thumbnail update error: ",
                                                      onThumbnailUpdateError
                                                    );
                                                    res.json({
                                                      message:
                                                        "Something went wrong while updating thumbnail!",
                                                      status: "400",
                                                      error:
                                                        onThumbnailUpdateError,
                                                    });
                                                  }
                                                );
                                          }
                                        )
                                        .catch(async (onJwThumbnailError) => {
                                          console.log(
                                            "on jw thumbnail error: ",
                                            onJwThumbnailError
                                          );
                                          res.json({
                                            message:
                                              "Something went wrong while updating thumbnail!",
                                            status: "400",
                                            error: onJwThumbnailError,
                                          });
                                        });
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
                        var headers = {
                          Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
                        };

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
                                                    status,
                                                  };

                                                  var updatedMedia =
                                                    await Media.findByIdAndUpdate(
                                                      filter,
                                                      updateData,
                                                      { new: true }
                                                    )
                                                      .then(
                                                        async (
                                                          onMediaGcUpdate
                                                        ) => {
                                                          console.log(
                                                            "on media gc update: ",
                                                            onMediaGcUpdate
                                                          );
                                                          res.json({
                                                            message:
                                                              "General info and thumbnail updated!",
                                                            status: "200",
                                                            updatedMedia:
                                                              onMediaGcUpdate,
                                                            updatedThumbnail:
                                                              onThumbnailUpdate,
                                                          });
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
                                      "on jw thumbnail upload error: ",
                                      onJwThumbnailUploadError
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
                          var public_id_3 = onCloudinaryUpload.public_id;

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

                          var apiResponse_5 = await axios
                            .post(
                              `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/`,
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

                              setTimeout(async () => {
                                var apiResponse_6 = await axios
                                  .get(
                                    `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${id}/`,
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
                                                  status,
                                                };

                                                var updatedMedia =
                                                  await Media.findByIdAndUpdate(
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
                                              "on thumbnail update error: ",
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
                                "on jw thumbnail upload error: ",
                                onJwThumbnailUploadError
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
                        .upload(thumbnailObj.public_id)
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
                                    };

                                    var updatedMedia =
                                      await Media.findByIdAndUpdate(
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

                                            res.json({
                                              message:
                                                "General info and thumbnail updated!",
                                              status: "200",
                                              updatedMedia:
                                                onGcMediaUpdateSuccess,
                                              updatedThumbnail:
                                                onThumbnailUpdate,
                                            });
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
                                  status,
                                };

                                var updatedMedia =
                                  await Media.findByIdAndUpdate(
                                    filter,
                                    updateData,
                                    { new: true }
                                  )
                                    .then(async (onGcMediaUpdateSuccess) => {
                                      console.log(
                                        "on gc media update success: ",
                                        onGcMediaUpdateSuccess
                                      );

                                      res.json({
                                        message:
                                          "General info and thumbnail updated!",
                                        status: "200",
                                        updatedMedia: onGcMediaUpdateSuccess,
                                        updatedThumbnail: onThumbnailUpdate,
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
    }

    var general_content = await Video.findById({
      _id: video_content_id,
    })
      .then(async (onGcFound) => {
        console.log("on gc found: ");
        var general_content_obj = onGcFound;

        var media = await Media.findById({
          _id: general_content_obj.media,
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
              status,
            };

            var updatedMedia = await Media.findByIdAndUpdate(
              filter,
              updateData,
              { new: true }
            )
              .then(async (onMediaUpdate) => {
                console.log("media update: ", onMediaUpdate);

                res.json({
                  message: "General content updated!",
                  status: "200",
                  updatedMedia: onMediaUpdate,
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
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  createVideo,
  deleteVideoById,
  getVideoContent,
};
