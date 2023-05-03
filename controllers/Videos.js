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

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");

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
      status
    );

    category = "video";

    if (!title) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      if (isThumbnailSelected) {
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
      content_type,
      availability,
      monetization,
    } = req.body;

    category = "video";

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
                                                              await GeneralContent.findByIdAndUpdate(
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
                                                                      status:
                                                                        "200",
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
                                                            // res.json({
                                                            //   message:
                                                            //     "General info updated!",
                                                            //   status: "200",
                                                            //   updatedMedia:
                                                            //     onGcUpdate,
                                                            //   updatedThumbnail:
                                                            //     updatedThumbnailObj,
                                                            // });
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
                                                    monetization,
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
                                                            await Video.findByIdAndUpdate(
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

                                                          // res.json({
                                                          //   message:
                                                          //     "General info and thumbnail updated!",
                                                          //   status: "200",
                                                          //   updatedMedia:
                                                          //     onMediaGcUpdate,
                                                          //   updatedThumbnail:
                                                          //     onThumbnailUpdate,
                                                          // });
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
                                                  monetization,
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
                                                          await GeneralContent.findByIdAndUpdate(
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

                                                        // res.json({
                                                        //   message:
                                                        //     "General info and thumbnail updated!",
                                                        //   status: "200",
                                                        //   updatedMedia:
                                                        //     onGcMediaUpdateSuccess,
                                                        //   updatedThumbnail:
                                                        //     onThumbnailUpdateSuccess,
                                                        // });
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
                                      monetization,
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
                                              await GeneralContent.findByIdAndUpdate(
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

                                            // res.json({
                                            //   message:
                                            //     "General info and thumbnail updated!",
                                            //   status: "200",
                                            //   updatedMedia:
                                            //     onGcMediaUpdateSuccess,
                                            //   updatedThumbnail:
                                            //     onThumbnailUpdate,
                                            // });
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
                                  monetization,
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
                                        await GeneralContent.findByIdAndUpdate(
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

                                      // res.json({
                                      //   message:
                                      //     "General info and thumbnail updated!",
                                      //   status: "200",
                                      //   updatedMedia: onGcMediaUpdateSuccess,
                                      //   updatedThumbnail: onThumbnailUpdate,
                                      // });
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
              monetization,
            };

            var updatedMedia = await Media.findByIdAndUpdate(
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

                var updatedGc = await GeneralContent.findByIdAndUpdate(
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
                // res.json({
                //   message: "General content updated!",
                //   status: "200",
                //   updatedMedia: onMediaUpdate,
                // });
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

const createVideoUpdated = async (req, res) => {
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

    console.log("body req: ", req.body);

    category = "video";

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
              monetization: monetization,
            });

            var savedMedia = await mediaObj.save();

            var videoContentObj = new Video({
              media: savedMedia._id,
              category: category,
              genre: genres,
              rating: rating,
              status: status,
              thumbnail: savedThumbnail._id,
              content_type: content_type,
              availability: availability,
            });

            var savedVideoContent = await videoContentObj.save();

            res.json({
              message: "Media and Video Content Created!",
              status: "200",
              savedVideoContent,
              savedMedia,
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
          monetization: monetization,
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
          content_type: content_type,
          availability: availability,
        });

        var savedVideoContent = await generalVideoObj.save();

        res.json({
          message: "Media and Video Content Created!",
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

const getVideoList = async (req, res) => {
  try {
    var allVideos = await Video.find({
      category: "video",
    })
      .populate(["media", "genre"])
      .populate("thumbnail")
      .then(async (onMoviesFound) => {
        console.log("on videos found: ", onMoviesFound);
        if (onMoviesFound.length <= 0) {
          res.json({
            message: "No videos available!",
            status: "404",
          });
        } else {
          res.json({
            message: "All videos found!",
            status: "200",
            allVideos: onMoviesFound,
          });
        }
      })
      .catch(async (onMoviesFoundError) => {
        console.log("on videos found error: ", onMoviesFoundError);
        res.json({
          message: "Something went wrong while getting video list!",
          status: "400",
          error: onMoviesFoundError,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const deleteVideoContentByIdUpdated = async (req, res) => {
  try {
    var video_content_id = req.params.video_content_id;

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    if (!video_content_id || video_content_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var general_content = await Video.findById({
        _id: video_content_id,
      })
        .then(async (onFoundGc) => {
          var general_content_obj = onFoundGc;

          var media = await Media.findById({
            _id: general_content_obj.media,
          }).then(async (onMediaFound) => {
            var mediaObj = onMediaFound;

            var subtitles = mediaObj.subtitles;

            var audio_tracks = mediaObj.audio_tracks;

            var languages_content = mediaObj.languages_content;

            // var headers = {
            //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            // };
            var media_id = mediaObj.media_id;
            var site_id = process.env.SITE_ID;

            if (media_id && media_id !== "") {
              // if media id is available

              var apiResponse = await axios
                .delete(
                  `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/`,
                  {
                    headers: headers,
                  }
                )
                .then(async (onJwMediaDelete) => {
                  console.log("JW media deleted: ", onJwMediaDelete);

                  var subtitlesDeleted = await Subtitles.deleteMany({
                    _id: { $in: subtitles },
                  })
                    .then(async (onSubtitlesDelete) => {
                      console.log("Subtitles deleted: ", onSubtitlesDelete);

                      var audioTracksDeleted = await AudioTracks.deleteMany({
                        _id: { $in: audio_tracks },
                      })
                        .then(async (onAudioTracksDelete) => {
                          console.log(
                            "Audio tracks deleted: ",
                            onAudioTracksDelete
                          );

                          var languagesContentDeleted =
                            await LanguagesContent.deleteMany({
                              _id: { $in: languages_content },
                            })
                              .then(async (onLanguagesContentDelete) => {
                                console.log(
                                  "languages content deleted: ",
                                  onLanguagesContentDelete
                                );

                                var deletedSliderItem =
                                  await Slider.findOneAndDelete({
                                    general_content: general_content_obj._id,
                                  })
                                    .then(async (onSliderItemDelete) => {
                                      console.log(
                                        "slider item delete: ",
                                        onSliderItemDelete
                                      );

                                      var thumbnail =
                                        general_content_obj.thumbnail;

                                      var searchedThumbnail =
                                        await Thumbnail.findById(thumbnail)
                                          .then(async (onThumbnailFound) => {
                                            console.log(
                                              "on thumbnail found: >>>> ",
                                              onThumbnailFound
                                            );

                                            if (
                                              onThumbnailFound.thumbnail_type !==
                                              ""
                                            ) {
                                              if (
                                                onThumbnailFound.thumbnail_type ===
                                                "cloudinary"
                                              ) {
                                                // delete from cloudinary and continue the process
                                                cloudinary.config(
                                                  cloudinaryConfigObj
                                                );
                                                cloudinary.uploader
                                                  .destroy(
                                                    onThumbnailFound.cloudinary_public_id
                                                  )
                                                  .then(
                                                    async (
                                                      onCloudinaryDelete
                                                    ) => {
                                                      console.log(
                                                        "on cloudinary delete: ",
                                                        onCloudinaryDelete
                                                      );
                                                      var thumbnailDeleted =
                                                        await Thumbnail.findOneAndDelete(
                                                          {
                                                            general_content:
                                                              general_content_obj._id,
                                                          }
                                                        )
                                                          .then(
                                                            async (
                                                              onThumbnailDelete
                                                            ) => {
                                                              console.log(
                                                                "thumbnail delete success: ",
                                                                onThumbnailDelete
                                                              );

                                                              // var trailerAvailable =
                                                              //   await Trailer.findById(
                                                              //     general_content_obj.trailer
                                                              //   )
                                                              //     .then(
                                                              //       async (
                                                              //         onTrailerFound
                                                              //       ) => {
                                                              // console.log(
                                                              //   "on trailer found 2: ",
                                                              //   onTrailerFound
                                                              // );

                                                              // var trailerDeleted =
                                                              //   await Trailer.findByIdAndDelete(
                                                              //     {
                                                              //       _id: onTrailerFound._id,
                                                              //     }
                                                              //   )
                                                              //     .then(
                                                              //       async (
                                                              //         onTrailerDelete
                                                              //       ) => {
                                                              // console.log(
                                                              //   "trailer deleted success: ",
                                                              //   onTrailerDelete
                                                              // );

                                                              var mediaDeleted =
                                                                await Media.findByIdAndDelete(
                                                                  {
                                                                    _id: mediaObj._id,
                                                                  }
                                                                )
                                                                  .then(
                                                                    async (
                                                                      onMediaDelete
                                                                    ) => {
                                                                      console.log(
                                                                        "media delete success: ",
                                                                        onMediaDelete
                                                                      );

                                                                      var deletedGeneralContent =
                                                                        await Video.findByIdAndDelete(
                                                                          {
                                                                            _id: general_content_obj._id,
                                                                          }
                                                                        )
                                                                          .then(
                                                                            async (
                                                                              onGcDelete
                                                                            ) => {
                                                                              console.log(
                                                                                "gc deleted: ",
                                                                                onGcDelete
                                                                              );
                                                                              res.json(
                                                                                {
                                                                                  message:
                                                                                    "Video content deleted!",
                                                                                  status:
                                                                                    "200",
                                                                                }
                                                                              );
                                                                            }
                                                                          )
                                                                          .catch(
                                                                            (
                                                                              onGcDeleteError
                                                                            ) => {
                                                                              console.log(
                                                                                "gc delete error: ",
                                                                                onGcDeleteError
                                                                              );
                                                                            }
                                                                          );
                                                                    }
                                                                  )
                                                                  .catch(
                                                                    (
                                                                      onMediaDeleteError
                                                                    ) => {
                                                                      console.log(
                                                                        "media delete error: ",
                                                                        onMediaDeleteError
                                                                      );
                                                                    }
                                                                  );
                                                              //   }
                                                              // )
                                                              // .catch(
                                                              //   (
                                                              //     onTrailerDeleteError
                                                              //   ) => {
                                                              //     console.log(
                                                              //       "trailer delete error: ",
                                                              //       onTrailerDeleteError
                                                              //     );
                                                              //   }
                                                              // );
                                                              //   }
                                                              // )
                                                              // .catch(
                                                              //   async (
                                                              //     onTrailerFoundError
                                                              //   ) => {
                                                              //     console.log(
                                                              //       "on trailer found error 4: ",
                                                              //       onTrailerFoundError
                                                              //     );
                                                              //     res.json({
                                                              //       message:
                                                              //         "Trailer found error 4!",
                                                              //       error:
                                                              //         onTrailerFoundError,
                                                              //     });
                                                              //   }
                                                              // );
                                                            }
                                                          )
                                                          .catch(
                                                            (
                                                              onThumbnailDeleteError
                                                            ) => {
                                                              console.log(
                                                                "On thumbnail delete error: ",
                                                                onThumbnailDeleteError
                                                              );
                                                            }
                                                          );
                                                    }
                                                  );
                                              } else {
                                                // delete from

                                                var site_id =
                                                  process.env.SITE_ID;
                                                var thumbnail_id =
                                                  onThumbnailFound.thumbnail_id;

                                                var apiResponse_7 = await axios
                                                  .delete(
                                                    `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                                                    {
                                                      headers: headers,
                                                    }
                                                  )
                                                  .then(
                                                    async (
                                                      onThumbnailDeleteJw
                                                    ) => {
                                                      console.log(
                                                        "on thumbnail delete jw: ",
                                                        onThumbnailDeleteJw
                                                      );
                                                      var thumbnailDeleted =
                                                        await Thumbnail.findOneAndDelete(
                                                          {
                                                            general_content:
                                                              general_content_obj._id,
                                                          }
                                                        )
                                                          .then(
                                                            async (
                                                              onThumbnailDelete
                                                            ) => {
                                                              console.log(
                                                                "thumbnail delete success: ",
                                                                onThumbnailDelete
                                                              );

                                                              var mediaDeleted =
                                                                await Media.findByIdAndDelete(
                                                                  {
                                                                    _id: mediaObj._id,
                                                                  }
                                                                )
                                                                  .then(
                                                                    async (
                                                                      onMediaDelete
                                                                    ) => {
                                                                      console.log(
                                                                        "media delete success: ",
                                                                        onMediaDelete
                                                                      );

                                                                      var deletedGeneralContent =
                                                                        await Video.findByIdAndDelete(
                                                                          {
                                                                            _id: general_content_obj._id,
                                                                          }
                                                                        )
                                                                          .then(
                                                                            async (
                                                                              onGcDelete
                                                                            ) => {
                                                                              console.log(
                                                                                "gc deleted: ",
                                                                                onGcDelete
                                                                              );
                                                                              res.json(
                                                                                {
                                                                                  message:
                                                                                    "Video content deleted!",
                                                                                  status:
                                                                                    "200",
                                                                                }
                                                                              );
                                                                            }
                                                                          )
                                                                          .catch(
                                                                            (
                                                                              onGcDeleteError
                                                                            ) => {
                                                                              console.log(
                                                                                "gc delete error: ",
                                                                                onGcDeleteError
                                                                              );
                                                                            }
                                                                          );
                                                                    }
                                                                  )
                                                                  .catch(
                                                                    (
                                                                      onMediaDeleteError
                                                                    ) => {
                                                                      console.log(
                                                                        "media delete error: ",
                                                                        onMediaDeleteError
                                                                      );
                                                                    }
                                                                  );
                                                            }
                                                          )
                                                          .catch(
                                                            (
                                                              onThumbnailDeleteError
                                                            ) => {
                                                              console.log(
                                                                "On thumbnail delete error: ",
                                                                onThumbnailDeleteError
                                                              );
                                                            }
                                                          );
                                                    }
                                                  )
                                                  .catch(
                                                    async (
                                                      onThumbnailDeleteJwError
                                                    ) => {
                                                      console.log(
                                                        "on thumbnail delete jw error: ",
                                                        onThumbnailDeleteJwError
                                                      );
                                                    }
                                                  );
                                              }
                                            } else {
                                              // empty thumbnail type means no thumbnail then continue the other delete process

                                              var mediaDeleted =
                                                await Media.findByIdAndDelete({
                                                  _id: mediaObj._id,
                                                })
                                                  .then(
                                                    async (onMediaDelete) => {
                                                      console.log(
                                                        "media delete success: ",
                                                        onMediaDelete
                                                      );

                                                      var deletedGeneralContent =
                                                        await Video.findByIdAndDelete(
                                                          {
                                                            _id: general_content_obj._id,
                                                          }
                                                        )
                                                          .then(
                                                            async (
                                                              onGcDelete
                                                            ) => {
                                                              console.log(
                                                                "gc deleted: ",
                                                                onGcDelete
                                                              );
                                                              res.json({
                                                                message:
                                                                  "Video content deleted!",
                                                                status: "200",
                                                              });
                                                            }
                                                          )
                                                          .catch(
                                                            (
                                                              onGcDeleteError
                                                            ) => {
                                                              console.log(
                                                                "gc delete error: ",
                                                                onGcDeleteError
                                                              );
                                                            }
                                                          );
                                                    }
                                                  )
                                                  .catch(
                                                    (onMediaDeleteError) => {
                                                      console.log(
                                                        "media delete error: ",
                                                        onMediaDeleteError
                                                      );
                                                    }
                                                  );
                                            }
                                          })
                                          .catch(
                                            async (onThumbnailFoundError) => {
                                              console.log(
                                                "on thumbnail found error: ",
                                                onThumbnailFoundError
                                              );
                                              res.json({
                                                message: "Thumbnail not found!",
                                                status: "400",
                                                error: onThumbnailFoundError,
                                              });
                                            }
                                          );
                                    })
                                    .catch((onSliderItemDeleteError) => {
                                      console.log(onSliderItemDeleteError);
                                    });
                              })
                              .catch((onNoLanguagesContentDelete) => {
                                console.log(
                                  "no languages content deleted: ",
                                  onNoLanguagesContentDelete
                                );
                              });
                        })
                        .catch((onNoAudioTracksDelete) => {
                          console.log(
                            "no audio tracks deleted: ",
                            onNoAudioTracksDelete
                          );
                        });
                    })
                    .catch((onNoSubtitlesDelete) => {
                      console.log(onNoSubtitlesDelete);
                    });
                })
                .catch((onJwMediaDeleteError) => {
                  console.log(onJwMediaDeleteError);
                  res.json({
                    message:
                      "Something went wrong while deleting media from JW Player!",
                    status: "400",
                    onJwMediaDeleteError,
                  });
                });
            } else {
              // no media id
              var subtitlesDeleted = await Subtitles.deleteMany({
                _id: { $in: subtitles },
              }).then(async (onSubtitlesDelete) => {
                console.log("Subtitles deleted: ", onSubtitlesDelete);

                var audioTracksDeleted = await AudioTracks.deleteMany({
                  _id: { $in: audio_tracks },
                })
                  .then(async (onAudioTracksDelete) => {
                    console.log("Audio tracks deleted: ", onAudioTracksDelete);

                    var languagesContentDeleted =
                      await LanguagesContent.deleteMany({
                        _id: { $in: languages_content },
                      })
                        .then(async (onLanguagesContentDelete) => {
                          console.log(
                            "languages content deleted: ",
                            onLanguagesContentDelete
                          );

                          var deletedSliderItem = await Slider.findOneAndDelete(
                            {
                              general_content: general_content_obj._id,
                            }
                          )
                            .then(async (onSliderItemDelete) => {
                              console.log(
                                "slider item delete: ",
                                onSliderItemDelete
                              );

                              var thumbnail = general_content_obj.thumbnail;

                              var searchedThumbnail = await Thumbnail.findById(
                                thumbnail
                              )
                                .then(async (onThumbnailFound) => {
                                  console.log(
                                    "on thumbnail found: >>>> ",
                                    onThumbnailFound
                                  );

                                  if (onThumbnailFound.thumbnail_type !== "") {
                                    if (
                                      onThumbnailFound.thumbnail_type ===
                                      "cloudinary"
                                    ) {
                                      // delete from cloudinary and continue the process
                                      cloudinary.config(cloudinaryConfigObj);
                                      cloudinary.uploader
                                        .destroy(
                                          onThumbnailFound.cloudinary_public_id
                                        )
                                        .then(async (onCloudinaryDelete) => {
                                          console.log(
                                            "on cloudinary delete: ",
                                            onCloudinaryDelete
                                          );
                                          var thumbnailDeleted =
                                            await Thumbnail.findOneAndDelete({
                                              general_content:
                                                general_content_obj._id,
                                            })
                                              .then(
                                                async (onThumbnailDelete) => {
                                                  console.log(
                                                    "thumbnail delete success: ",
                                                    onThumbnailDelete
                                                  );

                                                  // var trailerAvailable =
                                                  //   await Trailer.findById(
                                                  //     general_content_obj?.trailer
                                                  //   )
                                                  //     .then(
                                                  //       async (
                                                  //         onTrailerFound
                                                  //       ) => {
                                                  // console.log(
                                                  //   "on trailer found: ",
                                                  //   onThumbnailFound
                                                  // );
                                                  // var trailerDeleted =
                                                  //   await Trailer.findByIdAndDelete(
                                                  //     {
                                                  //       _id: onTrailerFound._id,
                                                  //     }
                                                  //   )
                                                  //     .then(
                                                  //       async (
                                                  //         onTrailerDelete
                                                  //       ) => {
                                                  //         console.log(
                                                  //           "trailer deleted success: ",
                                                  //           onTrailerDelete
                                                  //         );

                                                  var mediaDeleted =
                                                    await Media.findByIdAndDelete(
                                                      {
                                                        _id: mediaObj._id,
                                                      }
                                                    )
                                                      .then(
                                                        async (
                                                          onMediaDelete
                                                        ) => {
                                                          console.log(
                                                            "media delete success: ",
                                                            onMediaDelete
                                                          );

                                                          var deletedGeneralContent =
                                                            await Video.findByIdAndDelete(
                                                              {
                                                                _id: general_content_obj._id,
                                                              }
                                                            )
                                                              .then(
                                                                async (
                                                                  onGcDelete
                                                                ) => {
                                                                  console.log(
                                                                    "gc deleted: ",
                                                                    onGcDelete
                                                                  );
                                                                  res.json({
                                                                    message:
                                                                      "General content deleted!",
                                                                    status:
                                                                      "200",
                                                                  });
                                                                }
                                                              )
                                                              .catch(
                                                                (
                                                                  onGcDeleteError
                                                                ) => {
                                                                  console.log(
                                                                    "gc delete error: ",
                                                                    onGcDeleteError
                                                                  );
                                                                }
                                                              );
                                                        }
                                                      )
                                                      .catch(
                                                        (
                                                          onMediaDeleteError
                                                        ) => {
                                                          console.log(
                                                            "media delete error: ",
                                                            onMediaDeleteError
                                                          );
                                                        }
                                                      );
                                                  //   }
                                                  // )
                                                  // .catch(
                                                  //   (
                                                  //     onTrailerDeleteError
                                                  //   ) => {
                                                  //     console.log(
                                                  //       "trailer delete error: ",
                                                  //       onTrailerDeleteError
                                                  //     );

                                                  //     res.json({
                                                  //       message:
                                                  //         "Trailer Not Available!",
                                                  //       error:
                                                  //         onTrailerDeleteError,
                                                  //     });
                                                  //   }
                                                  // );
                                                  //   }
                                                  // )
                                                  // .catch(
                                                  //   async (
                                                  //     onThumbnailFoundError
                                                  //   ) => {
                                                  //     console.log(
                                                  //       "on trailer found error: ",
                                                  //       onThumbnailFoundError
                                                  //     );
                                                  //     res.json({
                                                  //       message:
                                                  //         "Thumbnail Not Available!",
                                                  //       error:
                                                  //         onThumbnailFoundError,
                                                  //     });
                                                  //   }
                                                  // );
                                                }
                                              )
                                              .catch(
                                                (onThumbnailDeleteError) => {
                                                  console.log(
                                                    "On thumbnail delete error: ",
                                                    onThumbnailDeleteError
                                                  );
                                                }
                                              );
                                        });
                                    } else {
                                      // delete from

                                      // var trailerAvailable =
                                      //   await Trailer.findById(
                                      //     general_content_obj.trailer
                                      //   )
                                      //     .then(async (onTrailerFound) => {
                                      //       console.log(
                                      //         "on trailer found 2: ",
                                      //         onTrailerFound
                                      //       );

                                      // var trailerDeleted =
                                      //   await Trailer.findByIdAndDelete({
                                      //     _id: onTrailerFound._id,
                                      //   })
                                      //     .then(
                                      //       async (onTrailerDelete) => {
                                      //         console.log(
                                      //           "trailer deleted success: ",
                                      //           onTrailerDelete
                                      //         );

                                      var mediaDeleted =
                                        await Media.findByIdAndDelete({
                                          _id: mediaObj._id,
                                        })
                                          .then(async (onMediaDelete) => {
                                            console.log(
                                              "media delete success: ",
                                              onMediaDelete
                                            );

                                            var deletedGeneralContent =
                                              await Video.findByIdAndDelete({
                                                _id: general_content_obj._id,
                                              })
                                                .then(async (onGcDelete) => {
                                                  console.log(
                                                    "gc deleted: ",
                                                    onGcDelete
                                                  );
                                                  res.json({
                                                    message:
                                                      "General content deleted!",
                                                    status: "200",
                                                  });
                                                })
                                                .catch((onGcDeleteError) => {
                                                  console.log(
                                                    "gc delete error: ",
                                                    onGcDeleteError
                                                  );
                                                });
                                          })
                                          .catch((onMediaDeleteError) => {
                                            console.log(
                                              "media delete error: ",
                                              onMediaDeleteError
                                            );
                                          });
                                      //   }
                                      // )
                                      // .catch(
                                      //   (onTrailerDeleteError) => {
                                      //     console.log(
                                      //       "trailer delete error: ",
                                      //       onTrailerDeleteError
                                      //     );
                                      //   }
                                      // );
                                      // })
                                      // .catch(
                                      //   async (onTrailerFoundError) => {
                                      //     console.log(
                                      //       "on trailer found error 2: ",
                                      //       onTrailerFoundError
                                      //     );
                                      //     res.json({
                                      //       message: "Trailer not found: ",
                                      //       error: onTrailerFoundError,
                                      //     });
                                      //   }
                                      // );

                                      // var site_id = process.env.SITE_ID;
                                      // var thumbnail_id =
                                      //   onThumbnailFound.thumbnail_id;

                                      // var apiResponse_7 = await axios
                                      //   .delete(
                                      //     `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                                      //     {
                                      //       headers: headers,
                                      //     }
                                      //   )
                                      //   .then(async (onThumbnailDeleteJw) => {
                                      //     console.log(
                                      //       "on thumbnail delete jw: ",
                                      //       onThumbnailDeleteJw
                                      //     );
                                      //     var thumbnailDeleted =
                                      //       await Thumbnail.findOneAndDelete({
                                      //         general_content:
                                      //           general_content_obj._id,
                                      //       })
                                      //         .then(
                                      //           async (onThumbnailDelete) => {
                                      //             console.log(
                                      //               "thumbnail delete success: ",
                                      //               onThumbnailDelete
                                      //             );

                                      //             var trailerDeleted =
                                      //               await Trailer.findByIdAndDelete(
                                      //                 {
                                      //                   _id: general_content_obj.trailer,
                                      //                 }
                                      //               )
                                      //                 .then(
                                      //                   async (
                                      //                     onTrailerDelete
                                      //                   ) => {
                                      //                     console.log(
                                      //                       "trailer deleted success: ",
                                      //                       onTrailerDelete
                                      //                     );

                                      //                     var mediaDeleted =
                                      //                       await Media.findByIdAndDelete(
                                      //                         {
                                      //                           _id: mediaObj._id,
                                      //                         }
                                      //                       )
                                      //                         .then(
                                      //                           async (
                                      //                             onMediaDelete
                                      //                           ) => {
                                      //                             console.log(
                                      //                               "media delete success: ",
                                      //                               onMediaDelete
                                      //                             );

                                      //                             var deletedGeneralContent =
                                      //                               await GeneralContent.findByIdAndDelete(
                                      //                                 {
                                      //                                   _id: general_content_obj._id,
                                      //                                 }
                                      //                               )
                                      //                                 .then(
                                      //                                   async (
                                      //                                     onGcDelete
                                      //                                   ) => {
                                      //                                     console.log(
                                      //                                       "gc deleted: ",
                                      //                                       onGcDelete
                                      //                                     );
                                      //                                     res.json(
                                      //                                       {
                                      //                                         message:
                                      //                                           "General content deleted!",
                                      //                                         status:
                                      //                                           "200",
                                      //                                       }
                                      //                                     );
                                      //                                   }
                                      //                                 )
                                      //                                 .catch(
                                      //                                   (
                                      //                                     onGcDeleteError
                                      //                                   ) => {
                                      //                                     console.log(
                                      //                                       "gc delete error: ",
                                      //                                       onGcDeleteError
                                      //                                     );
                                      //                                   }
                                      //                                 );
                                      //                           }
                                      //                         )
                                      //                         .catch(
                                      //                           (
                                      //                             onMediaDeleteError
                                      //                           ) => {
                                      //                             console.log(
                                      //                               "media delete error: ",
                                      //                               onMediaDeleteError
                                      //                             );
                                      //                           }
                                      //                         );
                                      //                   }
                                      //                 )
                                      //                 .catch(
                                      //                   (
                                      //                     onTrailerDeleteError
                                      //                   ) => {
                                      //                     console.log(
                                      //                       "trailer delete error: ",
                                      //                       onTrailerDeleteError
                                      //                     );
                                      //                   }
                                      //                 );
                                      //           }
                                      //         )
                                      //         .catch(
                                      //           (onThumbnailDeleteError) => {
                                      //             console.log(
                                      //               "On thumbnail delete error: ",
                                      //               onThumbnailDeleteError
                                      //             );
                                      //           }
                                      //         );
                                      //   })
                                      //   .catch(
                                      //     async (onThumbnailDeleteJwError) => {
                                      //       console.log(
                                      //         "on thumbnail delete jw error: ",
                                      //         onThumbnailDeleteJwError
                                      //       );
                                      //     }
                                      //   );
                                    }
                                  } else {
                                    // empty thumbnail type means no thumbnail then continue the other delete process

                                    // var trailerAvailable =
                                    //   await Trailer.findById(
                                    //     general_content_obj.trailer
                                    //   )
                                    //     .then(async (onTrailerFound) => {
                                    //       console.log(
                                    //         "on trailer found 7: ",
                                    //         onTrailerFound
                                    //       );

                                    // var trailerDeleted =
                                    //   await Trailer.findByIdAndDelete({
                                    //     _id: onTrailerFound._id,
                                    //   })
                                    //     .then(async (onTrailerDelete) => {
                                    //       console.log(
                                    //         "trailer deleted success: ",
                                    //         onTrailerDelete
                                    //       );

                                    var mediaDeleted =
                                      await Media.findByIdAndDelete({
                                        _id: mediaObj._id,
                                      })
                                        .then(async (onMediaDelete) => {
                                          console.log(
                                            "media delete success: ",
                                            onMediaDelete
                                          );

                                          var deletedGeneralContent =
                                            await Video.findByIdAndDelete({
                                              _id: general_content_obj._id,
                                            })
                                              .then(async (onGcDelete) => {
                                                console.log(
                                                  "gc deleted: ",
                                                  onGcDelete
                                                );
                                                res.json({
                                                  message:
                                                    "General content deleted!",
                                                  status: "200",
                                                });
                                              })
                                              .catch((onGcDeleteError) => {
                                                console.log(
                                                  "gc delete error: ",
                                                  onGcDeleteError
                                                );
                                              });
                                        })
                                        .catch((onMediaDeleteError) => {
                                          console.log(
                                            "media delete error: ",
                                            onMediaDeleteError
                                          );
                                        });
                                    // })
                                    // .catch((onTrailerDeleteError) => {
                                    //   console.log(
                                    //     "trailer delete error: ",
                                    //     onTrailerDeleteError
                                    //   );
                                    // });
                                    // })
                                    // .catch(async (onTrailerFoundError) => {
                                    //   console.log(
                                    //     "on trailer found error 3: ",
                                    //     onTrailerFoundError
                                    //   );
                                    //   res.json({
                                    //     message: "Trailer not found 3!",
                                    //     error: onTrailerFoundError,
                                    //   });
                                    // });
                                  }
                                })
                                .catch(async (onThumbnailFoundError) => {
                                  console.log(
                                    "on thumbnail found error: ",
                                    onThumbnailFoundError
                                  );
                                  res.json({
                                    message: "Thumbnail not found!",
                                    status: "400",
                                    error: onThumbnailFoundError,
                                  });
                                });
                            })
                            .catch((onSliderItemDeleteError) => {
                              console.log(onSliderItemDeleteError);
                            });
                        })
                        .catch((onNoLanguagesContentDelete) => {
                          console.log(
                            "no languages content deleted: ",
                            onNoLanguagesContentDelete
                          );
                        });
                  })
                  .catch((onNoAudioTracksDelete) => {
                    console.log(
                      "no audio tracks deleted: ",
                      onNoAudioTracksDelete
                    );
                  });
              });
            }
          });
          // .catch(onMediaNotFound=>{
          //   console.log(onMediaNotFound);
          // })
        })
        .catch((onNotFoundGc) => {
          res.json({
            message: "General content not found for provided id!",
            status: "404",
            onNotFoundGc,
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

const uploadMediaId = async (req, res) => {
  try {
    var mediaObjId = req.params.media_Obj_Id;

    var { media_id, duration } = req.body;

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
          duration: duration,
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

                var general_content = await Video.findOne({
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
  createVideo,
  deleteVideoById,
  getVideoContent,
  createVideoUpdated,
  getVideoList,
  deleteVideoContentByIdUpdated,
  uploadMediaId,
  updateVideoContent,
};
