const AudioTracks = require("../models/AudioTracks");
const Media = require("../models/Media");
const GeneralContent = require("../models/GeneralContent");
const LanguagesContent = require("../models/LanguagesContent");
const Video = require("../models/Video");
const Episode = require("../models/Episode");

const { translate } = require("free-translate");

const axios = require("axios");

const addAudioTrack = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var { download_url, name, type, language, language_code } = req.body;

    var mediaObj = await Media.findById({
      _id: media_object_id,
    });

    if (!media_object_id || media_object_id === "") {
      res.json({
        message: "Required fields are empty, Please provide media id!",
        status: "404",
      });
    } else if (!mediaObj) {
      res.json({
        message: "No media found with provided id!",
        status: "404",
      });
    } else {
      var media_id = mediaObj.media_id;
      var site_id = process.env.SITE_ID;

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        upload: {
          method: "fetch",
          download_url: `${download_url}`,
        },
        metadata: {
          name: `${name}`,
          type: `${type}`,
          language: `${language}`,
          language_code: `${language_code}`,
        },
      };

      var apiResponse = await axios
        .post(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          console.log("JW API Success: ", result.data);
          var { id } = result.data;
          var { name, type, language, language_code } = result.data.metadata;

          var audioTrack = new AudioTracks({
            original_id: id,
            name,
            type,
            language,
            language_code,
            media: mediaObj._id,
          });

          var savedAudioTrack = await audioTrack.save();
          var filter = {
            _id: mediaObj._id,
          };

          var updatedMedia = await Media.findByIdAndUpdate(
            filter,
            {
              $push: { audio_tracks: savedAudioTrack._id },
            },
            {
              new: true,
            }
          )
            .then((result) => {
              res.json({
                message: "Audio track added!",
                status: "200",
                savedAudioTrack,
                updatedMedia: result,
              });
            })
            .catch((error) => {
              console.log("Database Error: ", error);
              res.json({
                message: "Error Occurred while updating the database!",
                status: "400",
                error,
              });
            });
        })

        .catch((error) => {
          console.log("JW API Error: ", error);
          res.json({
            message: "Something went wrong!",
            status: "400",
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

const deletedAudioTrack = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var audio_track_id = req.params.audio_track_id;

    if (!media_object_id || media_object_id === "") {
      res.json({
        message: "Required fields are empty, please provide a movie id!",
        status: "400",
      });
    } else {
      var mediaObj = await Media.findById({
        _id: media_object_id,
      });

      if (!mediaObj) {
        res.json({
          message: "No media found with provided media id!",
          status: "404",
        });
      } else {
        var site_id = process.env.SITE_ID;
        var media_id = mediaObj.media_id;

        var audioTrack = await AudioTracks.findOne({
          _id: audio_track_id,
        });
        if (!audioTrack) {
          res.json({
            message: "No audio track found with provided media id!",
            status: "404",
          });
        } else {
          var original_id = audioTrack.original_id;
          var headers = {
            Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
          };
          var apiResponse = await axios
            .delete(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/${original_id}/`,
              {
                headers: headers,
              }
            )
            .then(async (result) => {
              console.log("JW API Success: ", result.data);

              var updatedMedia = Media.updateOne(
                {
                  _id: mediaObj._id,
                },
                {
                  $pull: {
                    audio_tracks: audioTrack._id,
                  },
                },
                {
                  new: true,
                }
              )

                .then(async (result) => {
                  var deletedAudioTrack = await AudioTracks.findByIdAndDelete({
                    _id: audioTrack._id,
                  })

                    .then((result) => {
                      console.log("Database success: ", result);
                      res.json({
                        message: "Audio track deleted!",
                        status: "200",
                      });
                    })
                    .catch((error) => {
                      console.log("Database error delete audio: ", error);
                      res.json({
                        message: "Something went wrong!",
                        status: "400",
                      });
                    });
                })
                .catch((error) => {
                  console.log("Database error: ", error);
                  res.json({
                    message: "Something went wrong!",
                    status: "503",
                  });
                });
            })
            .catch((error) => {
              console.log("JW API Error: ", error);
              res.json({
                message: "Something went wrong!",
                status: "503",
              });
            });
        }
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

const updateAudioTrack_V2 = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var audio_track_id = req.params.audio_track_id;

    var { original_id_body, name, type, language, language_code } = req.body;

    if (!media_object_id || media_object_id === "") {
      res.json({
        message: "Required fields are empty, please provide a movie id!",
        status: "400",
      });
    } else {
      var mediaObj = await Media.findById({
        _id: media_object_id,
      });

      if (!mediaObj) {
        res.json({
          message: "No media found with provided media id!",
          status: "404",
        });
      } else {
        var site_id = process.env.SITE_ID;
        var media_id = mediaObj.media_id;

        var audioTrack = await AudioTracks.findOne({
          _id: audio_track_id,
        });
        if (!audioTrack) {
          res.json({
            message: "No audio track found with provided media id!",
            status: "404",
          });
        } else {
          var original_id = audioTrack.original_id;
          var headers = {
            Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
          };
          var apiResponse = await axios
            .delete(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/${original_id}/`,
              {
                headers: headers,
              }
            )
            .then(async (result) => {
              console.log("JW API Success: ", result.data);

              var filter = {
                _id: audio_track_id,
              };

              var updateData = {
                original_id: original_id_body,
                name: name,
                type: type,
                language: language,
                language_code: language_code,
                media: mediaObj._id,
              };

              var updatedAudioTrack = await AudioTracks.findByIdAndUpdate(
                filter,
                updateData,
                { new: true }
              )
                .then(async (onAudioTrackUpdateSuccess) => {
                  console.log(
                    "on audio update success: ",
                    onAudioTrackUpdateSuccess
                  );
                  res.json({
                    message: "Audio track updated!",
                    status: "200",
                    updatedAudioTrack: onAudioTrackUpdateSuccess,
                  });
                })
                .catch(async (onAudioTrackUpdateError) => {
                  console.log(
                    "on audio track update error: ",
                    onAudioTrackUpdateError
                  );
                  res.json({
                    message:
                      "Something went wrong while updating the audio track!",
                    status: "400",
                    error: onAudioTrackUpdateError,
                  });
                });
            })
            .catch((error) => {
              console.log("JW API Error: ", error);
              res.json({
                message: "Something went wrong!",
                status: "503",
              });
            });
        }
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

const getAudioTracksByGeneralMediaId = async (req, res) => {
  try {
    var media_id = req.params.media_id;

    if (!media_id || media_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var media = await Media.findById({
        _id: media_id,
      }).populate("audio_tracks");

      if (media) {
        res.json({
          message: "Audio tracks found!",
          status: "200",
          audio_tracks: media.audio_tracks,
        });
      } else {
        res.json({
          message: "No audio tracks found!",
          status: "404",
          audio_tracks: [],
        });
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

const getAudioTracksByGeneralContentId = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    if (!general_content_id || general_content_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var general_content = await GeneralContent.findById({
        _id: general_content_id,
      }).populate("media");

      if (!general_content) {
        res.json({
          message: "No general content found for provided general content id!",
          status: "404",
          general_content: null,
        });
      } else {
        console.log("general content: ", general_content);
        var media = general_content.media;

        var populatedMedia = await Media.findById({
          _id: media._id,
        }).populate("audio_tracks");

        if (populatedMedia) {
          res.json({
            message: "Subtitles found!",
            status: "200",
            audio_tracks: populatedMedia.audio_tracks,
          });
        } else {
          res.json({
            message: "No audio tracks found!",
            status: "404",
            audio_tracks: [],
          });
        }
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

const getAudioTracksByVideoContentId = async (req, res) => {
  try {
    var video_content_id = req.params.video_content_id;
    if (!video_content_id || video_content_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var video_content = await Video.findById({
        _id: video_content_id,
      }).populate("media");

      if (!video_content) {
        res.json({
          message: "No video content found for provided general content id!",
          status: "404",
          video_content: null,
        });
      } else {
        console.log("video content: ", video_content);
        var media = video_content.media;

        var populatedMedia = await Media.findById({
          _id: media._id,
        }).populate("audio_tracks");

        if (populatedMedia) {
          res.json({
            message: "Subtitles found!",
            status: "200",
            audio_tracks: populatedMedia.audio_tracks,
          });
        } else {
          res.json({
            message: "No audio tracks found!",
            status: "404",
            audio_tracks: [],
          });
        }
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

const addAudioTrackUpdated = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var { original_id, name, type, language, language_code } = req.body;

    var mediaObj = await Media.findById({
      _id: media_object_id,
    });

    if (!media_object_id || media_object_id === "") {
      res.json({
        message: "Required fields are empty, Please provide media id!",
        status: "400",
      });
    } else if (!mediaObj) {
      res.json({
        message: "No media found with provided id!",
        status: "404",
      });
    } else {
      var audioTrack = new AudioTracks({
        original_id: original_id,
        name,
        type,
        language,
        language_code,
        media: mediaObj._id,
      });

      var savedAudioTrack = await audioTrack.save();
      var filter = {
        _id: mediaObj._id,
      };

      var updatedMedia = await Media.findByIdAndUpdate(
        filter,
        {
          $push: { audio_tracks: savedAudioTrack._id },
        },
        {
          new: true,
        }
      )
        .then((result) => {
          res.json({
            message: "Audio track added!",
            status: "200",
            savedAudioTrack,
            updatedMedia: result,
          });
        })
        .catch((error) => {
          console.log("Database Error: ", error);
          res.json({
            message: "Error Occurred while updating the database!",
            status: "400",
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

const addAudioTrackUpdated_V2 = async (req, res) => {
  // try {
  var media_object_id = req.params.media_object_id;
  var { original_id, name, type, language, language_code } = req.body;

  var mediaObj = await Media.findById({
    _id: media_object_id,
  }).populate(["audio_tracks", "translated_content"]);

  if (!mediaObj) {
    res.json({
      message: "No media found!",
      status: "404",
    });
  } else {
    var translated_contents = mediaObj.translated_content;

    var isTranslationAvailable = translated_contents.some(
      (obj) => obj.language_type === language
    );

    console.log(isTranslationAvailable);

    if (isTranslationAvailable) {
      var audioTrack = new AudioTracks({
        original_id: original_id,
        name,
        type,
        language,
        language_code,
        media: mediaObj._id,
      });

      var savedAudioTrack = await audioTrack.save();

      var filter = {
        _id: mediaObj._id,
      };

      var updatedMedia = await Media.findByIdAndUpdate(
        filter,
        {
          $push: { audio_tracks: savedAudioTrack._id },
        },
        {
          new: true,
        }
      )
        .then((updatedMediaResult) => {
          console.log("Saved audio tracks: ", savedAudioTrack);
          res.json({
            message: "Audio track Created!",
            status: "200",
            savedAudioTrack,
            updatedMediaResult,
          });
        })
        .catch((error) => {
          res.json({
            error,
          });
        });
    } else {
      // var translated_title = await translate(mediaObj.title, {
      //   to: language_code,
      // });
      // var translated_description = await translate(mediaObj.description, {
      //   to: language_code,
      // });

      var translated_content_obj = new LanguagesContent({
        title_translated: mediaObj.title,
        description_translated: mediaObj.description,
        // title_translated: translated_title,
        // description_translated: translated_description,
        language_type: language,
        language_code: language_code,
      });

      var savedTranslation = translated_content_obj
        .save()
        .then(async (onSaveTranslation) => {
          var audioTrackObj = new AudioTracks({
            original_id: original_id,
            name,
            type,
            language,
            language_code,
            media: mediaObj._id,
          });

          var savedAudioTrackObj = await audioTrackObj
            .save()
            .then(async (onSaveAudioTrack) => {
              var filter = {
                _id: mediaObj._id,
              };
              console.log(
                "subtitles and content:  ",
                onSaveAudioTrack._id,
                onSaveTranslation._id
              );

              var updatedMedia = await Media.findByIdAndUpdate(
                filter,
                {
                  $push: {
                    audio_tracks: onSaveAudioTrack._id,
                    translated_content: onSaveTranslation._id,
                  },
                },
                {
                  new: true,
                }
              )
                .then((updatedMediaResult) => {
                  console.log("Saved Subtitles: ", onSaveAudioTrack);
                  res.json({
                    message: "Subtitles Created!",
                    status: "200",
                    updatedMediaResult,
                    onSaveAudioTrack,
                    onSaveTranslation,
                  });
                })
                .catch((error) => {
                  res.json({
                    error,
                  });
                });
            });
        })
        .catch((onSaveTranslationError) => {
          res.json({
            onSaveTranslationError,
          });
        });
    }

    // var subtitlesObj = new Subtitles({
    //   track_id: track_id,
    //   delivery_url: delivery_url,
    //   track_kind: track_kind,
    //   language: language,
    //   media: media_obj_id,
    // });

    // var savedSubtitles = subtitlesObj.save();

    // var filter = {
    //   _id: mediaObj._id,
    // };

    // var updatedMedia = await Media.findByIdAndUpdate(
    //   filter,
    //   {
    //     $push: { subtitles: subtitlesObj._id },
    //   },
    //   {
    //     new: true,
    //   }
    // )
    //   .then((updatedMediaResult) => {
    //     console.log("Saved Subtitles: ", savedSubtitles);
    //     res.json({
    //       message: "Subtitles Created!",
    //       status: "200",
    //       savedSubtitles,
    //       updatedMediaResult,
    //     });
    //   })
    //   .catch((error) => {
    //     res.json({
    //       error,
    //     });
    //   });
  }
  // } catch (error) {
  //   res.json({
  //     message: "Internal server error!",
  //     status: "500",
  //     error,
  //   });
  // }
};

const updateAudioTrack = async (req, res) => {
  try {
    var audio_track_id = req.params.audio_track_id;

    var { original_id, name, type, language, language_code } = req.body;

    var filter = {
      _id: audio_track_id,
    };

    var updateData = {
      original_id: original_id,
      name: name,
      type: type,
      language: language,
      language_code: language_code,
    };

    var updatedAudioTrack = await AudioTracks.findByIdAndUpdate(
      filter,
      updateData,
      { new: true }
    )
      .then(async (onAudioUpdate) => {
        console.log("audio track updated: ", onAudioUpdate);
        res.json({
          message: "Audio track updated!",
          status: "200",
          updatedAudioTrack: onAudioUpdate,
        });
      })

      .catch((onAudioNotFound) => {
        console.log("audio track not found!", onAudioNotFound);
        res.json({
          message: "Audio track not found!",
          status: "404",
          error: onAudioNotFound,
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

const addAudioTrackForEpisode = async (req, res) => {
  // try {
  var episode_id = req.params.episode_id;
  var { original_id, name, type, language, language_code } = req.body;

  var mediaObj = await Episode.findById({
    _id: episode_id,
  }).populate(["audio_tracks", "translated_content"]);

  if (!mediaObj) {
    res.json({
      message: "No media found!",
      status: "404",
    });
  } else {
    var translated_contents = mediaObj.translated_content;

    var isTranslationAvailable = translated_contents.some(
      (obj) => obj.language_type === language
    );

    console.log(isTranslationAvailable);

    if (isTranslationAvailable) {
      var audioTrack = new AudioTracks({
        original_id: original_id,
        name,
        type,
        language,
        language_code,
        media: mediaObj._id,
      });

      var savedAudioTrack = await audioTrack.save();

      var filter = {
        _id: mediaObj._id,
      };

      var updatedMedia = await Episode.findByIdAndUpdate(
        filter,
        {
          $push: { audio_tracks: savedAudioTrack._id },
        },
        {
          new: true,
        }
      )
        .then((updatedMediaResult) => {
          console.log("Saved audio tracks: ", savedAudioTrack);
          res.json({
            message: "Audio track Created!",
            status: "200",
            savedAudioTrack,
            updatedMediaResult,
          });
        })
        .catch((error) => {
          res.json({
            error,
          });
        });
    } else {
      // var translated_title = await translate(mediaObj.title, {
      //   to: language_code,
      // });
      // var translated_description = await translate(mediaObj.description, {
      //   to: language_code,
      // });

      var translated_content_obj = new LanguagesContent({
        title_translated: mediaObj.title,
        description_translated: mediaObj.description,
        // title_translated: translated_title,
        // description_translated: translated_description,
        language_type: language,
        language_code: language_code,
      });

      var savedTranslation = translated_content_obj
        .save()
        .then(async (onSaveTranslation) => {
          var audioTrackObj = new AudioTracks({
            original_id: original_id,
            name,
            type,
            language,
            language_code,
            media: mediaObj._id,
          });

          var savedAudioTrackObj = await audioTrackObj
            .save()
            .then(async (onSaveAudioTrack) => {
              var filter = {
                _id: mediaObj._id,
              };
              console.log(
                "subtitles and content:  ",
                onSaveAudioTrack._id,
                onSaveTranslation._id
              );

              var updatedMedia = await Episode.findByIdAndUpdate(
                filter,
                {
                  $push: {
                    audio_tracks: onSaveAudioTrack._id,
                    translated_content: onSaveTranslation._id,
                  },
                },
                {
                  new: true,
                }
              )
                .then((updatedMediaResult) => {
                  console.log("Saved Subtitles: ", onSaveAudioTrack);
                  res.json({
                    message: "Subtitles Created!",
                    status: "200",
                    updatedMediaResult,
                    onSaveAudioTrack,
                    onSaveTranslation,
                  });
                })
                .catch((error) => {
                  res.json({
                    error,
                  });
                });
            });
        })
        .catch((onSaveTranslationError) => {
          res.json({
            onSaveTranslationError,
          });
        });
    }

    // var subtitlesObj = new Subtitles({
    //   track_id: track_id,
    //   delivery_url: delivery_url,
    //   track_kind: track_kind,
    //   language: language,
    //   media: media_obj_id,
    // });

    // var savedSubtitles = subtitlesObj.save();

    // var filter = {
    //   _id: mediaObj._id,
    // };

    // var updatedMedia = await Media.findByIdAndUpdate(
    //   filter,
    //   {
    //     $push: { subtitles: subtitlesObj._id },
    //   },
    //   {
    //     new: true,
    //   }
    // )
    //   .then((updatedMediaResult) => {
    //     console.log("Saved Subtitles: ", savedSubtitles);
    //     res.json({
    //       message: "Subtitles Created!",
    //       status: "200",
    //       savedSubtitles,
    //       updatedMediaResult,
    //     });
    //   })
    //   .catch((error) => {
    //     res.json({
    //       error,
    //     });
    //   });
  }
  // } catch (error) {
  //   res.json({
  //     message: "Internal server error!",
  //     status: "500",
  //     error,
  //   });
  // }
};

const deleteAudioTrackOfEpisode = async (req, res) => {
  try {
    var episode_id = req.params.episode_id;
    var audio_track_id = req.params.audio_track_id;

    if (!episode_id || episode_id === "") {
      res.json({
        message: "Required fields are empty, please provide a movie id!",
        status: "400",
      });
    } else {
      var mediaObj = await Episode.findById({
        _id: episode_id,
      });

      if (!mediaObj) {
        res.json({
          message: "No media found with provided media id!",
          status: "404",
        });
      } else {
        var site_id = process.env.SITE_ID;
        var media_id = mediaObj.media_id;

        var audioTrack = await AudioTracks.findOne({
          _id: audio_track_id,
        });
        if (!audioTrack) {
          res.json({
            message: "No audio track found with provided media id!",
            status: "404",
          });
        } else {
          var original_id = audioTrack.original_id;
          var headers = {
            Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
          };
          var apiResponse = await axios
            .delete(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/${original_id}/`,
              {
                headers: headers,
              }
            )
            .then(async (result) => {
              console.log("JW API Success: ", result.data);

              var updatedMedia = Episode.updateOne(
                {
                  _id: mediaObj._id,
                },
                {
                  $pull: {
                    audio_tracks: audioTrack._id,
                  },
                },
                {
                  new: true,
                }
              )

                .then(async (result) => {
                  var deletedAudioTrack = await AudioTracks.findByIdAndDelete({
                    _id: audioTrack._id,
                  })

                    .then((result) => {
                      console.log("Database success: ", result);
                      res.json({
                        message: "Audio track deleted!",
                        status: "200",
                      });
                    })
                    .catch((error) => {
                      console.log("Database error delete audio: ", error);
                      res.json({
                        message: "Something went wrong!",
                        status: "400",
                      });
                    });
                })
                .catch((error) => {
                  console.log("Database error: ", error);
                  res.json({
                    message: "Something went wrong!",
                    status: "503",
                  });
                });
            })
            .catch((error) => {
              console.log("JW API Error: ", error);
              res.json({
                message: "Something went wrong!",
                status: "503",
              });
            });
        }
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

const getAudioTracksByEpisodeId = async (req, res) => {
  try {
    var episode_id = req.params.episode_id;

    if (!episode_id || episode_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var media = await Episode.findById({
        _id: episode_id,
      }).populate("audio_tracks");

      if (media) {
        res.json({
          message: "Audio tracks found!",
          status: "200",
          audio_tracks: media.audio_tracks,
        });
      } else {
        res.json({
          message: "No audio tracks found!",
          status: "404",
          audio_tracks: [],
        });
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

module.exports = {
  addAudioTrack,
  deletedAudioTrack,
  getAudioTracksByGeneralMediaId,
  getAudioTracksByGeneralContentId,
  addAudioTrackUpdated,
  updateAudioTrack,
  addAudioTrackUpdated_V2,
  updateAudioTrack_V2,
  getAudioTracksByVideoContentId,
  addAudioTrackForEpisode,
  deleteAudioTrackOfEpisode,
  getAudioTracksByEpisodeId,
};
