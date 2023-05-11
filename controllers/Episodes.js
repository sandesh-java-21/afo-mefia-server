const Season = require("../models/Season");
const Episode = require("../models/Episode");
const TvShow = require("../models/TvShow");
const LanguagesContent = require("../models/LanguagesContent");
const Thumbnail = require("../models/Thumbnail");
const AudioTracks = require("../models/AudioTracks");
const Subtitles = require("../models/Subtitles");

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");
const { default: axios } = require("axios");
const { mongo, default: mongoose } = require("mongoose");

const createEpisodeOfASeason = async (req, res) => {
  try {
    var season_id = req.params.season_id;

    var {
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      seo_tags,
      rating,
      isThumbnailSelected,
      monetization,
      imageBase64,
      language_code,
      duration,
      tv_show_id,
    } = req.body;

    if (!season_id || season_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var season = await Season.findById(season_id)
        .then(async (onSeasonFound) => {
          console.log("on season found: ", onSeasonFound);

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

                var episodeObj = new Episode({
                  title: title,
                  description: description,
                  duration: duration,
                  default_language: default_language,
                  release_year: release_year,
                  media_id: "",
                  subtitles: [],
                  audio_tracks: [],
                  jw_tags: jw_tags,
                  seo_tags: seo_tags,
                  translated_content: [savedLanguagesContent._id],
                  rating: rating,
                  thumbnail: savedThumbnail._id,
                  rating: rating,
                  comments: [],
                  likes: 0,
                  monetization: monetization,
                  tv_show: tv_show_id,
                  season: season_id,
                });

                var savedEpisode = await episodeObj.save();

                var season = await Season.findByIdAndUpdate(
                  {
                    _id: onSeasonFound._id,
                  },
                  {
                    $push: {
                      episodes: savedEpisode._id,
                    },
                  },
                  {
                    new: true,
                  }
                )
                  .then(async (onSeasonUpdate) => {
                    console.log("on season update: ", onSeasonUpdate);
                    res.json({
                      message: "New Episode Created!",
                      status: "200",
                      savedEpisode,
                      thumbnail: savedThumbnail,
                      onSeasonUpdate,
                    });
                  })
                  .catch(async (onSeasonUpdateError) => {
                    console.log(
                      "on season update error: ",
                      onSeasonUpdateError
                    );
                    res.json({
                      message:
                        "Something went wrong while creating episode for a season!",
                      status: "400",
                      error: onSeasonUpdateError,
                    });
                  });
              })
              .catch((cloudinaryError) => {
                console.log("cloudinary error: ", cloudinaryError);
                res.json({
                  cloudinaryError,
                });
              });
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

            var customTags = req.body.jw_tags.map(
              (tag) => tag + `-${category}`
            );
            var jw_tags = [...req.body.jw_tags, ...customTags];

            var episodeObj = new Episode({
              title: title,
              description: description,
              duration: duration,
              default_language: default_language,
              release_year: release_year,
              media_id: "",
              subtitles: [],
              audio_tracks: [],
              jw_tags: jw_tags,
              seo_tags: seo_tags,
              translated_content: [savedLanguagesContent._id],
              rating: rating,
              thumbnail: savedThumbnail._id,
              rating: rating,
              comments: [],
              likes: 0,
              monetization: monetization,
              tv_show: tv_show_id,
              season: season_id,
            });

            var savedEpisode = await episodeObj.save();

            var season = await Season.findByIdAndUpdate(
              {
                _id: onSeasonFound._id,
              },
              {
                $push: {
                  episodes: savedEpisode._id,
                },
              },
              {
                new: true,
              }
            )
              .then(async (onSeasonUpdate) => {
                console.log("on season update: ", onSeasonUpdate);
                res.json({
                  message: "New Episode Created!",
                  status: "200",
                  savedEpisode,
                  thumbnail: savedThumbnail,
                  onSeasonUpdate,
                });
              })
              .catch(async (onSeasonUpdateError) => {
                console.log("on season update error: ", onSeasonUpdateError);
                res.json({
                  message:
                    "Something went wrong while creating episode for a season!",
                  status: "400",
                  error: onSeasonUpdateError,
                });
              });

            // res.json({
            //   message: "Episode created!",
            //   status: "200",
            //   savedEpisode,
            //   thumbnail: savedThumbnail,
            // });

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
        })
        .catch(async (onSeasonFoundError) => {
          console.log("on season found error: ", onSeasonFoundError);
          res.json({
            message: "Season not found!",
            status: "404",
            error: onSeasonFoundError,
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

const deleteEpisode = async (req, res) => {
  try {
    var episode_id = req.params.episode_id;
    var season_id = req.params.season_id;

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var site_id = process.env.SITE_ID;

    if (!episode_id || episode_id === "" || !season_id || season_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var episode = await Episode.findById(episode_id)
        .then(async (onEpisodeFound) => {
          console.log("on episode found: ", onEpisodeFound);

          var episode_obj = onEpisodeFound;

          var subtitles = onEpisodeFound.subtitles;

          var audio_tracks = onEpisodeFound.audio_tracks;

          var languages_content = onEpisodeFound.languages_content;

          if (onEpisodeFound.media_id && onEpisodeFound.media_id !== "") {
            // yes episode media id

            var apiResponse = await axios
              .delete(
                `https://api.jwplayer.com/v2/sites/${site_id}/media/${onEpisodeFound.media_id}/`,
                {
                  headers: headers,
                }
              )
              .then(async (onJwMediaDelete) => {
                console.log("on jw media delete: ", onJwMediaDelete.data);

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

                              var thumbnail = episode_obj.thumbnail;

                              var searchedThumbnail = await Thumbnail.findById(
                                thumbnail
                              )
                                .then(async (onThumbnailFound) => {
                                  console.log(
                                    "on thumbnail found: >>>> ",
                                    onThumbnailFound
                                  );

                                  if (onThumbnailFound.thumbnail_type !== "") {
                                    // not empty thumbnail type

                                    if (
                                      onThumbnailFound.thumbnail_type ===
                                      "cloudinary"
                                    ) {
                                      // delete from cloudinary

                                      cloudinary.config(cloudinaryConfigObj);
                                      cloudinary.uploader
                                        .destroy(
                                          onThumbnailFound.cloudinary_public_id
                                        )
                                        .then(
                                          async (
                                            onThumbnailDeleteCloudinary
                                          ) => {
                                            console.log(
                                              "on thumbnail delete cloudinary: ",
                                              onThumbnailDeleteCloudinary
                                            );
                                            var thumbnailDeleted =
                                              await Thumbnail.findOneAndDelete({
                                                _id: onThumbnailFound._id,
                                              })
                                                .then(
                                                  async (onThumbnailDelete) => {
                                                    console.log(
                                                      "thumbnail delete success: ",
                                                      onThumbnailDelete
                                                    );

                                                    var updatedSeason =
                                                      await Season.findByIdAndUpdate(
                                                        {
                                                          _id: episode_obj.season,
                                                        },
                                                        {
                                                          $pull: {
                                                            episodes:
                                                              episode_id,
                                                          },
                                                        },
                                                        {
                                                          new: true,
                                                        }
                                                      )
                                                        .then(
                                                          async (
                                                            onSeasonUpdate
                                                          ) => {
                                                            console.log(
                                                              "on season update: ",
                                                              onSeasonUpdate
                                                            );

                                                            var updatedTvShow =
                                                              await TvShow.findByIdAndUpdate(
                                                                {
                                                                  _id: episode_obj.tv_show,
                                                                },
                                                                {
                                                                  $pull: {
                                                                    episodes:
                                                                      episode_id,
                                                                  },
                                                                }
                                                              )
                                                                .then(
                                                                  async (
                                                                    onEpisodeDelete
                                                                  ) => {
                                                                    console.log(
                                                                      "on episode delete: ",
                                                                      onEpisodeDelete
                                                                    );

                                                                    var deletedEpisode =
                                                                      await Episode.findByIdAndDelete(
                                                                        {
                                                                          _id: episode_obj._id,
                                                                        }
                                                                      )
                                                                        .then(
                                                                          async (
                                                                            onEpisodeDeleteSuccess
                                                                          ) => {
                                                                            console.log(
                                                                              "on episode delete success: ",
                                                                              onEpisodeDeleteSuccess
                                                                            );
                                                                            res.json(
                                                                              {
                                                                                message:
                                                                                  "Episode Deleted!",
                                                                                status:
                                                                                  "200",
                                                                              }
                                                                            );
                                                                          }
                                                                        )
                                                                        .catch(
                                                                          async (
                                                                            onEpisodeDeleteSuccessError
                                                                          ) => {
                                                                            console.log(
                                                                              "on episode delete success error: ",
                                                                              onEpisodeDeleteSuccessError
                                                                            );
                                                                            res.json(
                                                                              {
                                                                                message:
                                                                                  "Something went wrong while deleting episode from database!",
                                                                                status:
                                                                                  "400",
                                                                                error:
                                                                                  onEpisodeDeleteSuccessError,
                                                                              }
                                                                            );
                                                                          }
                                                                        );
                                                                    // res.json({
                                                                    //   message:
                                                                    //     "Episode Deleted!",
                                                                    //   status:
                                                                    //     "200",
                                                                    // });
                                                                  }
                                                                )
                                                                .catch(
                                                                  async (
                                                                    onEpisodeDeleteError
                                                                  ) => {
                                                                    console.log(
                                                                      "on episode delete error: ",
                                                                      onEpisodeDeleteError
                                                                    );
                                                                    res.json({
                                                                      message:
                                                                        "Something went wrong while pulling from episodes in tv show!",
                                                                      status:
                                                                        "400",
                                                                      error:
                                                                        onEpisodeDeleteError,
                                                                    });
                                                                  }
                                                                );
                                                          }
                                                        )
                                                        .catch(
                                                          async (
                                                            onSeasonUpdateError
                                                          ) => {
                                                            console.log(
                                                              "on season update error: ",
                                                              onSeasonUpdateError
                                                            );
                                                            res.json({
                                                              message:
                                                                "Something went wrong while pulling from episodes array in season!",
                                                              status: "400",
                                                              onSeasonUpdateError,
                                                            });
                                                          }
                                                        );
                                                  }
                                                )
                                                .catch(
                                                  async (
                                                    onThumbnailDeleteError
                                                  ) => {
                                                    console.log(
                                                      "on thumbnail delete error: ",
                                                      onThumbnailDeleteError
                                                    );
                                                    res.json({
                                                      message:
                                                        "Something went wrong while deleting thumbnail from ",
                                                    });
                                                  }
                                                );
                                          }
                                        )
                                        .catch(
                                          async (
                                            onThumbnailDeleteCloudinaryError
                                          ) => {
                                            console.log(
                                              "on thumbnail delete cloudinary error: ",
                                              onThumbnailDeleteCloudinaryError
                                            );
                                            res.json({
                                              message:
                                                "Something went wrong while deleting from cloudinary!",
                                              status: "400",
                                              error:
                                                onThumbnailDeleteCloudinaryError,
                                            });
                                          }
                                        );
                                    } else {
                                      // delete from jw player
                                      var thumbnail_id =
                                        onThumbnailFound.thumbnail_id;

                                      var apiResponse_7 = await axios
                                        .delete(
                                          `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                                          {
                                            headers: headers,
                                          }
                                        )
                                        .then(async (onThumbnailDeleteJw) => {
                                          console.log(
                                            "on thumbnail delete jw: ",
                                            onThumbnailDeleteJw.data
                                          );

                                          var thumbnailDeleted =
                                            await Thumbnail.findOneAndDelete({
                                              _id: onThumbnailFound._id,
                                            })
                                              .then(
                                                async (onThumbnailDelete) => {
                                                  console.log(
                                                    "thumbnail delete success: ",
                                                    onThumbnailDelete
                                                  );

                                                  var updatedSeason =
                                                    await Season.findByIdAndUpdate(
                                                      {
                                                        _id: episode_obj.season,
                                                      },
                                                      {
                                                        $pull: {
                                                          episodes: episode_id,
                                                        },
                                                      },
                                                      {
                                                        new: true,
                                                      }
                                                    )
                                                      .then(
                                                        async (
                                                          onSeasonUpdate
                                                        ) => {
                                                          console.log(
                                                            "on season update: ",
                                                            onSeasonUpdate
                                                          );

                                                          var updatedTvShow =
                                                            await TvShow.findByIdAndUpdate(
                                                              {
                                                                _id: episode_obj.tv_show,
                                                              },
                                                              {
                                                                $pull: {
                                                                  episodes:
                                                                    episode_id,
                                                                },
                                                              }
                                                            )
                                                              .then(
                                                                async (
                                                                  onEpisodeDelete
                                                                ) => {
                                                                  console.log(
                                                                    "on episode delete: ",
                                                                    onEpisodeDelete
                                                                  );

                                                                  var deletedEpisode =
                                                                    await Episode.findByIdAndDelete(
                                                                      {
                                                                        _id: episode_obj._id,
                                                                      }
                                                                    )
                                                                      .then(
                                                                        async (
                                                                          onEpisodeDeleteSuccess
                                                                        ) => {
                                                                          console.log(
                                                                            "on episode delete success: ",
                                                                            onEpisodeDeleteSuccess
                                                                          );
                                                                          res.json(
                                                                            {
                                                                              message:
                                                                                "Episode Deleted!",
                                                                              status:
                                                                                "200",
                                                                            }
                                                                          );
                                                                        }
                                                                      )
                                                                      .catch(
                                                                        async (
                                                                          onEpisodeDeleteSuccessError
                                                                        ) => {
                                                                          console.log(
                                                                            "on episode delete success error: ",
                                                                            onEpisodeDeleteSuccessError
                                                                          );
                                                                          res.json(
                                                                            {
                                                                              message:
                                                                                "Something went wrong while deleting episode from database!",
                                                                              status:
                                                                                "400",
                                                                              error:
                                                                                onEpisodeDeleteSuccessError,
                                                                            }
                                                                          );
                                                                        }
                                                                      );
                                                                  // res.json({
                                                                  //   message:
                                                                  //     "Episode Deleted!",
                                                                  //   status:
                                                                  //     "200",
                                                                  // });
                                                                }
                                                              )
                                                              .catch(
                                                                async (
                                                                  onEpisodeDeleteError
                                                                ) => {
                                                                  console.log(
                                                                    "on episode delete error: ",
                                                                    onEpisodeDeleteError
                                                                  );
                                                                  res.json({
                                                                    message:
                                                                      "Something went wrong while pulling from episodes in tv show!",
                                                                    status:
                                                                      "400",
                                                                    error:
                                                                      onEpisodeDeleteError,
                                                                  });
                                                                }
                                                              );
                                                        }
                                                      )
                                                      .catch(
                                                        async (
                                                          onSeasonUpdateError
                                                        ) => {
                                                          console.log(
                                                            "on season update error: ",
                                                            onSeasonUpdateError
                                                          );
                                                          res.json({
                                                            message:
                                                              "Something went wrong while pulling from episodes array in season!",
                                                            status: "400",
                                                            onSeasonUpdateError,
                                                          });
                                                        }
                                                      );
                                                }
                                              )
                                              .catch(
                                                async (
                                                  onThumbnailDeleteError
                                                ) => {
                                                  console.log(
                                                    "on thumbnail delete error: ",
                                                    onThumbnailDeleteError
                                                  );
                                                  res.json({
                                                    message:
                                                      "Something went wrong while deleting thumbnail from ",
                                                  });
                                                }
                                              );
                                        })
                                        .catch(
                                          async (onThumbnailDeleteJwError) => {
                                            console.log(
                                              "on thumbnail delete jw error: ",
                                              onThumbnailDeleteJwError.response
                                                .data
                                            );
                                            res.json({
                                              message:
                                                "Something went wrong while deleting thumbnail from jw player!",
                                              status: "400",
                                              error: onThumbnailDeleteJwError,
                                            });
                                          }
                                        );
                                    }
                                  } else {
                                    // empty thumbnail type

                                    var thumbnailDeleted =
                                      await Thumbnail.findOneAndDelete({
                                        _id: onThumbnailFound._id,
                                      })
                                        .then(async (onThumbnailDelete) => {
                                          console.log(
                                            "thumbnail delete success: ",
                                            onThumbnailDelete
                                          );

                                          var updatedSeason =
                                            await Season.findByIdAndUpdate(
                                              {
                                                _id: episode_obj.season,
                                              },
                                              {
                                                $pull: {
                                                  episodes: episode_id,
                                                },
                                              },
                                              {
                                                new: true,
                                              }
                                            )
                                              .then(async (onSeasonUpdate) => {
                                                console.log(
                                                  "on season update: ",
                                                  onSeasonUpdate
                                                );

                                                var updatedTvShow =
                                                  await TvShow.findByIdAndUpdate(
                                                    {
                                                      _id: episode_obj.tv_show,
                                                    },
                                                    {
                                                      $pull: {
                                                        episodes: episode_id,
                                                      },
                                                    }
                                                  )
                                                    .then(
                                                      async (
                                                        onEpisodeDelete
                                                      ) => {
                                                        console.log(
                                                          "on episode delete: ",
                                                          onEpisodeDelete
                                                        );

                                                        var deletedEpisode =
                                                          await Episode.findByIdAndDelete(
                                                            {
                                                              _id: episode_obj._id,
                                                            }
                                                          )
                                                            .then(
                                                              async (
                                                                onEpisodeDeleteSuccess
                                                              ) => {
                                                                console.log(
                                                                  "on episode delete success: ",
                                                                  onEpisodeDeleteSuccess
                                                                );
                                                                res.json({
                                                                  message:
                                                                    "Episode Deleted!",
                                                                  status: "200",
                                                                });
                                                              }
                                                            )
                                                            .catch(
                                                              async (
                                                                onEpisodeDeleteSuccessError
                                                              ) => {
                                                                console.log(
                                                                  "on episode delete success error: ",
                                                                  onEpisodeDeleteSuccessError
                                                                );
                                                                res.json({
                                                                  message:
                                                                    "Something went wrong while deleting episode from database!",
                                                                  status: "400",
                                                                  error:
                                                                    onEpisodeDeleteSuccessError,
                                                                });
                                                              }
                                                            );
                                                      }
                                                    )
                                                    .catch(
                                                      async (
                                                        onEpisodeDeleteError
                                                      ) => {
                                                        console.log(
                                                          "on episode delete error: ",
                                                          onEpisodeDeleteError
                                                        );
                                                        res.json({
                                                          message:
                                                            "Something went wrong while pulling from episodes in tv show!",
                                                          status: "400",
                                                          error:
                                                            onEpisodeDeleteError,
                                                        });
                                                      }
                                                    );
                                              })
                                              .catch(
                                                async (onSeasonUpdateError) => {
                                                  console.log(
                                                    "on season update error: ",
                                                    onSeasonUpdateError
                                                  );
                                                  res.json({
                                                    message:
                                                      "Something went wrong while pulling from episodes array in season!",
                                                    status: "400",
                                                    onSeasonUpdateError,
                                                  });
                                                }
                                              );
                                        })
                                        .catch(
                                          async (onThumbnailDeleteError) => {
                                            console.log(
                                              "on thumbnail delete error: ",
                                              onThumbnailDeleteError
                                            );
                                            res.json({
                                              message:
                                                "Something went wrong while deleting thumbnail from ",
                                            });
                                          }
                                        );
                                  }
                                })
                                .catch(async (onThumbnailFoundError) => {
                                  console.log(
                                    "on thumbnail found error: ",
                                    onThumbnailFoundError
                                  );
                                  res.json({
                                    message:
                                      "Something went wrong while deleting thumbnail!",
                                    status: "400",
                                    error: onThumbnailFoundError,
                                  });
                                });
                            })
                            .catch(async (onLanguagesContentDeleteError) => {
                              console.log(
                                "on languages content delete error: ",
                                onLanguagesContentDeleteError
                              );
                              res.json({
                                message:
                                  "Something went wrong while deleting languages content!",
                                status: "400",
                                error: onLanguagesContentDeleteError,
                              });
                            });
                      })
                      .catch(async (onAudioTracksDeleteError) => {
                        console.log(
                          "on audio tracks delete error: ",
                          onAudioTracksDeleteError
                        );
                        res.json({
                          message:
                            "Something went wrong while deleting audio tracks!",
                          status: "400",
                          error: onAudioTracksDeleteError,
                        });
                      });
                  })
                  .catch(async (onSubtitlesDeleteError) => {
                    console.log(
                      "on subtitles delete error: ",
                      onSubtitlesDeleteError
                    );
                    res.json({
                      message: "Something went wrong while deleting subtitles!",
                      status: "400",
                      error: onSubtitlesDeleteError,
                    });
                  });
              });
            // .catch(async (onJwMediaDeleteError) => {
            //   console.log("on jw media delete error: ", onJwMediaDeleteError);
            //   res.json({
            //     message:
            //       "Something went wrong while deleting from jw player!",
            //     status: "400",
            //     error: onJwMediaDeleteError.response.data,
            //   });
            // });
          } else {
            // not episode media id

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
                      "on audio tracks delete 2: ",
                      onAudioTracksDelete
                    );

                    var languagesContentDeleted =
                      await LanguagesContent.deleteMany({
                        _id: { $in: languages_content },
                      })
                        .then(async (onLanguagesContentDelete) => {
                          console.log(
                            "on languages content delete: ",
                            onLanguagesContentDelete
                          );

                          var thumbnail = onEpisodeFound.thumbnail;

                          var searchedThumbnail = await Thumbnail.findById(
                            thumbnail
                          )
                            .then(async (onThumbnailFound) => {
                              console.log(
                                "on thumbnail found: >>>> ",
                                onThumbnailFound
                              );

                              if (onThumbnailFound.thumbnail_type !== "") {
                                // not empty thumbnail type

                                if (
                                  onThumbnailFound.thumbnail_type ===
                                  "cloudinary"
                                ) {
                                  // delete from cloudinary

                                  cloudinary.config(cloudinaryConfigObj);
                                  cloudinary.uploader
                                    .destroy(
                                      onThumbnailFound.cloudinary_public_id
                                    )
                                    .then(
                                      async (onThumbnailDeleteCloudinary) => {
                                        console.log(
                                          "on thumbnail delete cloudinary: ",
                                          onThumbnailDeleteCloudinary
                                        );
                                        var thumbnailDeleted =
                                          await Thumbnail.findOneAndDelete({
                                            _id: onThumbnailFound._id,
                                          })
                                            .then(async (onThumbnailDelete) => {
                                              console.log(
                                                "thumbnail delete success: ",
                                                onThumbnailDelete
                                              );

                                              var updatedSeason =
                                                await Season.findByIdAndUpdate(
                                                  {
                                                    _id: episode_obj.season,
                                                  },
                                                  {
                                                    $pull: {
                                                      episodes: episode_id,
                                                    },
                                                  },
                                                  {
                                                    new: true,
                                                  }
                                                )
                                                  .then(
                                                    async (onSeasonUpdate) => {
                                                      console.log(
                                                        "on season update: ",
                                                        onSeasonUpdate
                                                      );

                                                      var updatedTvShow =
                                                        await TvShow.findByIdAndUpdate(
                                                          {
                                                            _id: episode_obj.tv_show,
                                                          },
                                                          {
                                                            $pull: {
                                                              episodes:
                                                                episode_id,
                                                            },
                                                          }
                                                        )
                                                          .then(
                                                            async (
                                                              onEpisodeDelete
                                                            ) => {
                                                              console.log(
                                                                "on episode delete: ",
                                                                onEpisodeDelete
                                                              );

                                                              var deletedEpisode =
                                                                await Episode.findByIdAndDelete(
                                                                  {
                                                                    _id: episode_obj._id,
                                                                  }
                                                                )
                                                                  .then(
                                                                    async (
                                                                      onEpisodeDeleteSuccess
                                                                    ) => {
                                                                      console.log(
                                                                        "on episode delete success: ",
                                                                        onEpisodeDeleteSuccess
                                                                      );
                                                                      res.json({
                                                                        message:
                                                                          "Episode Deleted!",
                                                                        status:
                                                                          "200",
                                                                      });
                                                                    }
                                                                  )
                                                                  .catch(
                                                                    async (
                                                                      onEpisodeDeleteSuccessError
                                                                    ) => {
                                                                      console.log(
                                                                        "on episode delete success error: ",
                                                                        onEpisodeDeleteSuccessError
                                                                      );
                                                                      res.json({
                                                                        message:
                                                                          "Something went wrong while deleting episode from database!",
                                                                        status:
                                                                          "400",
                                                                        error:
                                                                          onEpisodeDeleteSuccessError,
                                                                      });
                                                                    }
                                                                  );
                                                              // res.json({
                                                              //   message:
                                                              //     "Episode Deleted!",
                                                              //   status: "200",
                                                              // });
                                                            }
                                                          )
                                                          .catch(
                                                            async (
                                                              onEpisodeDeleteError
                                                            ) => {
                                                              console.log(
                                                                "on episode delete error: ",
                                                                onEpisodeDeleteError
                                                              );
                                                              res.json({
                                                                message:
                                                                  "Something went wrong while pulling from episodes in tv show!",
                                                                status: "400",
                                                                error:
                                                                  onEpisodeDeleteError,
                                                              });
                                                            }
                                                          );
                                                    }
                                                  )
                                                  .catch(
                                                    async (
                                                      onSeasonUpdateError
                                                    ) => {
                                                      console.log(
                                                        "on season update error: ",
                                                        onSeasonUpdateError
                                                      );
                                                      res.json({
                                                        message:
                                                          "Something went wrong while pulling from episodes array in season!",
                                                        status: "400",
                                                        onSeasonUpdateError,
                                                      });
                                                    }
                                                  );
                                            })
                                            .catch(
                                              async (
                                                onThumbnailDeleteError
                                              ) => {
                                                console.log(
                                                  "on thumbnail delete error: ",
                                                  onThumbnailDeleteError
                                                );
                                                res.json({
                                                  message:
                                                    "Something went wrong while deleting thumbnail from ",
                                                });
                                              }
                                            );
                                      }
                                    )
                                    .catch(
                                      async (
                                        onThumbnailDeleteCloudinaryError
                                      ) => {
                                        console.log(
                                          "on thumbnail delete cloudinary error: ",
                                          onThumbnailDeleteCloudinaryError
                                        );
                                        res.json({
                                          message:
                                            "Something went wrong while deleting from cloudinary!",
                                          status: "400",
                                          error:
                                            onThumbnailDeleteCloudinaryError,
                                        });
                                      }
                                    );
                                } else {
                                  // delete from jw player
                                  var thumbnail_id =
                                    onThumbnailFound.thumbnail_id;

                                  var apiResponse_7 = await axios
                                    .delete(
                                      `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                                      {
                                        headers: headers,
                                      }
                                    )
                                    .then(async (onThumbnailDeleteJw) => {
                                      console.log(
                                        "on thumbnail delete jw: ",
                                        onThumbnailDeleteJw.data
                                      );

                                      var thumbnailDeleted =
                                        await Thumbnail.findOneAndDelete({
                                          _id: onThumbnailFound._id,
                                        })
                                          .then(async (onThumbnailDelete) => {
                                            console.log(
                                              "thumbnail delete success: ",
                                              onThumbnailDelete
                                            );

                                            var updatedSeason =
                                              await Season.findByIdAndUpdate(
                                                {
                                                  _id: episode_obj.season,
                                                },
                                                {
                                                  $pull: {
                                                    episodes: episode_id,
                                                  },
                                                },
                                                {
                                                  new: true,
                                                }
                                              )
                                                .then(
                                                  async (onSeasonUpdate) => {
                                                    console.log(
                                                      "on season update: ",
                                                      onSeasonUpdate
                                                    );

                                                    var updatedTvShow =
                                                      await TvShow.findByIdAndUpdate(
                                                        {
                                                          _id: episode_obj.tv_show,
                                                        },
                                                        {
                                                          $pull: {
                                                            episodes:
                                                              episode_id,
                                                          },
                                                        }
                                                      )
                                                        .then(
                                                          async (
                                                            onEpisodeDelete
                                                          ) => {
                                                            console.log(
                                                              "on episode delete: ",
                                                              onEpisodeDelete
                                                            );

                                                            var deletedEpisode =
                                                              await Episode.findByIdAndDelete(
                                                                {
                                                                  _id: episode_obj._id,
                                                                }
                                                              )
                                                                .then(
                                                                  async (
                                                                    onEpisodeDeleteSuccess
                                                                  ) => {
                                                                    console.log(
                                                                      "on episode delete success: ",
                                                                      onEpisodeDeleteSuccess
                                                                    );
                                                                    res.json({
                                                                      message:
                                                                        "Episode Deleted!",
                                                                      status:
                                                                        "200",
                                                                    });
                                                                  }
                                                                )
                                                                .catch(
                                                                  async (
                                                                    onEpisodeDeleteSuccessError
                                                                  ) => {
                                                                    console.log(
                                                                      "on episode delete success error: ",
                                                                      onEpisodeDeleteSuccessError
                                                                    );
                                                                    res.json({
                                                                      message:
                                                                        "Something went wrong while deleting episode from database!",
                                                                      status:
                                                                        "400",
                                                                      error:
                                                                        onEpisodeDeleteSuccessError,
                                                                    });
                                                                  }
                                                                );

                                                            // res.json({
                                                            //   message:
                                                            //     "Episode Deleted!",
                                                            //   status: "200",
                                                            // });
                                                          }
                                                        )
                                                        .catch(
                                                          async (
                                                            onEpisodeDeleteError
                                                          ) => {
                                                            console.log(
                                                              "on episode delete error: ",
                                                              onEpisodeDeleteError
                                                            );
                                                            res.json({
                                                              message:
                                                                "Something went wrong while pulling from episodes in tv show!",
                                                              status: "400",
                                                              error:
                                                                onEpisodeDeleteError,
                                                            });
                                                          }
                                                        );
                                                  }
                                                )
                                                .catch(
                                                  async (
                                                    onSeasonUpdateError
                                                  ) => {
                                                    console.log(
                                                      "on season update error: ",
                                                      onSeasonUpdateError
                                                    );
                                                    res.json({
                                                      message:
                                                        "Something went wrong while pulling from episodes array in season!",
                                                      status: "400",
                                                      onSeasonUpdateError,
                                                    });
                                                  }
                                                );
                                          })
                                          .catch(
                                            async (onThumbnailDeleteError) => {
                                              console.log(
                                                "on thumbnail delete error: ",
                                                onThumbnailDeleteError
                                              );
                                              res.json({
                                                message:
                                                  "Something went wrong while deleting thumbnail from ",
                                              });
                                            }
                                          );
                                    })
                                    .catch(async (onThumbnailDeleteJwError) => {
                                      console.log(
                                        "on thumbnail delete jw error: ",
                                        onThumbnailDeleteJwError.response.data
                                      );
                                      res.json({
                                        message:
                                          "Something went wrong while deleting thumbnail from jw player!",
                                        status: "400",
                                        error: onThumbnailDeleteJwError,
                                      });
                                    });
                                }
                              } else {
                                // empty thumbnail type

                                var thumbnailDeleted =
                                  await Thumbnail.findOneAndDelete({
                                    _id: onThumbnailFound._id,
                                  })
                                    .then(async (onThumbnailDelete) => {
                                      console.log(
                                        "thumbnail delete success: ",
                                        onThumbnailDelete
                                      );

                                      var updatedSeason =
                                        await Season.findByIdAndUpdate(
                                          {
                                            _id: episode_obj.season,
                                          },
                                          {
                                            $pull: {
                                              episodes: episode_id,
                                            },
                                          },
                                          {
                                            new: true,
                                          }
                                        )
                                          .then(async (onSeasonUpdate) => {
                                            console.log(
                                              "on season update: ",
                                              onSeasonUpdate
                                            );

                                            var updatedTvShow =
                                              await TvShow.findByIdAndUpdate(
                                                {
                                                  _id: episode_obj.tv_show,
                                                },
                                                {
                                                  $pull: {
                                                    episodes: episode_id,
                                                  },
                                                }
                                              )
                                                .then(
                                                  async (onEpisodeDelete) => {
                                                    console.log(
                                                      "on episode delete: ",
                                                      onEpisodeDelete
                                                    );

                                                    var deletedEpisode =
                                                      await Episode.findByIdAndDelete(
                                                        {
                                                          _id: episode_obj._id,
                                                        }
                                                      )
                                                        .then(
                                                          async (
                                                            onEpisodeDeleteSuccess
                                                          ) => {
                                                            console.log(
                                                              "on episode delete success: ",
                                                              onEpisodeDeleteSuccess
                                                            );
                                                            res.json({
                                                              message:
                                                                "Episode Deleted!",
                                                              status: "200",
                                                            });
                                                          }
                                                        )
                                                        .catch(
                                                          async (
                                                            onEpisodeDeleteSuccessError
                                                          ) => {
                                                            console.log(
                                                              "on episode delete success error: ",
                                                              onEpisodeDeleteSuccessError
                                                            );
                                                            res.json({
                                                              message:
                                                                "Something went wrong while deleting episode from database!",
                                                              status: "400",
                                                              error:
                                                                onEpisodeDeleteSuccessError,
                                                            });
                                                          }
                                                        );

                                                    // res.json({
                                                    //   message:
                                                    //     "Episode Deleted!",
                                                    //   status: "200",
                                                    // });
                                                  }
                                                )
                                                .catch(
                                                  async (
                                                    onEpisodeDeleteError
                                                  ) => {
                                                    console.log(
                                                      "on episode delete error: ",
                                                      onEpisodeDeleteError
                                                    );
                                                    res.json({
                                                      message:
                                                        "Something went wrong while pulling from episodes in tv show!",
                                                      status: "400",
                                                      error:
                                                        onEpisodeDeleteError,
                                                    });
                                                  }
                                                );
                                          })
                                          .catch(
                                            async (onSeasonUpdateError) => {
                                              console.log(
                                                "on season update error: ",
                                                onSeasonUpdateError
                                              );
                                              res.json({
                                                message:
                                                  "Something went wrong while pulling from episodes array in season!",
                                                status: "400",
                                                onSeasonUpdateError,
                                              });
                                            }
                                          );
                                    })
                                    .catch(async (onThumbnailDeleteError) => {
                                      console.log(
                                        "on thumbnail delete error: ",
                                        onThumbnailDeleteError
                                      );
                                      res.json({
                                        message:
                                          "Something went wrong while deleting thumbnail from ",
                                      });
                                    });
                              }
                            })
                            .catch(async (onThumbnailFoundError) => {
                              console.log(
                                "on thumbnail found error: ",
                                onThumbnailFoundError
                              );
                              res.json({
                                message:
                                  "Something went wrong while deleting thumbnail!",
                                status: "400",
                                error: onThumbnailFoundError,
                              });
                            });
                        })
                        .catch(async (onLanguagesContentDeleteError) => {
                          console.log(
                            "on languages content delete error: ",
                            onLanguagesContentDeleteError
                          );
                          res.json({
                            message:
                              "Something went wrong while deleting languages content 2!",
                            status: "400",
                            error: onLanguagesContentDeleteError,
                          });
                        });
                  })
                  .catch(async (onAudioTracksDeleteError) => {
                    console.log(
                      "on audio tracks delete error: ",
                      onAudioTracksDeleteError
                    );
                    res.json({
                      message:
                        "Something went wrong while deleting audio tracks 2!",
                      status: "400",
                      error: onAudioTracksDeleteError,
                    });
                  });
              })
              .catch(async (onSubtitlesDeleteError) => {
                console.log(
                  "on subtitles delete error 2:  ",
                  onSubtitlesDeleteError
                );
                res.json({
                  message: "Something went wrong while deleting subtitles 2!",
                  status: "400",
                  error: onSubtitlesDeleteError,
                });
              });
          }
        })
        .catch(async (onEpisodeFoundError) => {
          console.log("on episode found error: ", onEpisodeFoundError);
          res.json({
            message: "Episode not found!",
            status: "404",
            error: onEpisodeFoundError,
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
    var episode_id = req.params.episode_id;

    var { media_id, duration } = req.body;

    console.log(">>>>>>>>>  ", media_id, episode_id);

    var episode = await Episode.findById({
      _id: episode_id,
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

        var updatedMedia = await Episode.findByIdAndUpdate(filter, updateData, {
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

                var episode_content = await Episode.findOne({
                  _id: onMediaFound._id,
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
                          message: "Media Id Uploaded!",
                          status: "200",
                          updatedEpisode: onMediaUpdate,
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

const getEpisodeById = async (req, res) => {
  try {
    var episode_id = req.params.episode_id;
    if (!episode_id || episode_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var episode = await Episode.findById(episode_id)
        .populate([
          "thumbnail",
          "translated_content",
          "audio_tracks",
          "subtitles",
        ])
        .then(async (onEpisodeFound) => {
          console.log("on episode found: ", onEpisodeFound);
          res.json({
            message: "Episode found!",
            status: "200",
            episodeObj: onEpisodeFound,
          });
        })
        .catch(async (onEpisodeFoundError) => {
          console.log("on episode found error: ", onEpisodeFoundError);
          res.json({
            message: "Episode not found!",
            status: "404",
            error: onEpisodeFoundError,
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

const getEpisodesListByTvShowId = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;

    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var episodes = await Episode.find({
        tv_show: tv_show_id,
      })
        .populate("thumbnail")
        .then(async (onEpisodesFound) => {
          console.log("on episodes found: ", onEpisodesFound);
          res.json({
            message: "Episodes found for tv show!",
            status: "200",
            episodes: onEpisodesFound,
          });
        })
        .catch(async (onEpisodesFoundError) => {
          console.log("on episode found error: ", onEpisodesFoundError);
          res.json({
            message:
              "Something went wrong while finding episodes for a tv show!",
            status: "400",
            error: onEpisodesFoundError,
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

const updatedEpisode = async (req, res) => {
  try {
    var general_content_id = req.params.episode_id;

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
      isThumbnailSelected,
      // imageBase64
    } = req.body;

    category = "episode";

    if (isThumbnailSelected) {
      var { imageBase64 } = req.body;

      var general_content = await Episode.findById({
        _id: general_content_id,
      })
        .then(async (onGcFound) => {
          console.log("on gc found: ");
          var general_content_obj = onGcFound;

          var media = await Episode.findById({
            _id: general_content_id,
          })
            .then(async (onMediaFound) => {
              console.log("media found: ");

              var mediaObj = onMediaFound;

              if (mediaObj._id && mediaObj.media_id !== "") {
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
                              .upload(imageBase64)
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
                                                    // genres,
                                                    seo_tags,
                                                    rating,
                                                    monetization,
                                                  };

                                                  var updatedMedia =
                                                    await Episode.findByIdAndUpdate(
                                                      filter,
                                                      updateData,
                                                      { new: true }
                                                    ).then(
                                                      async (onGcUpdate) => {
                                                        var gcFilter = {
                                                          _id: general_content_obj._id,
                                                        };

                                                        var gcUpdateData = {
                                                          // availability,
                                                          // content_type,
                                                          status,
                                                          // genre: genres,
                                                        };

                                                        var updatedGc =
                                                          await Episode.findByIdAndUpdate(
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
                                      jwThumbnailUploadError.response.data
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
                              .upload(imageBase64, {
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
                                                    await Episode.findByIdAndUpdate(
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
                                                            // availability,
                                                            // content_type,
                                                            status,
                                                            // genre: genres,
                                                          };

                                                          var updatedGc =
                                                            await Episode.findByIdAndUpdate(
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
                        .upload(imageBase64)
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
                                                  await Episode.findByIdAndUpdate(
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
                                                          // availability,
                                                          // content_type,
                                                          status,
                                                          // genre: genres,
                                                        };

                                                        var updatedGc =
                                                          await Episode.findByIdAndUpdate(
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
                            .upload(imageBase64, {
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
                                      await Episode.findByIdAndUpdate(
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
                                              // availability,
                                              // content_type,
                                              status,
                                              // genre: genres,
                                            };

                                            var updatedGc =
                                              await Episode.findByIdAndUpdate(
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
                        .upload(imageBase64)
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
                                  await Episode.findByIdAndUpdate(
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
                                        // availability,
                                        // content_type,
                                        status,
                                        // genre: genres,
                                      };

                                      var updatedGc =
                                        await Episode.findByIdAndUpdate(
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
      var general_content = await Episode.findById({
        _id: general_content_id,
      })
        .then(async (onGcFound) => {
          console.log("on gc found: ");
          var general_content_obj = onGcFound;

          var media = await Episode.findById({
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
                    // availability,
                    // content_type,
                    status,
                    // genre: genres,
                  };

                  var updatedGc = await Episode.findByIdAndUpdate(
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
  createEpisodeOfASeason,
  deleteEpisode,
  uploadMediaId,
  getEpisodeById,
  getEpisodesListByTvShowId,
  updatedEpisode,
};
