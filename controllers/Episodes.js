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
                console.log("on jw media delete: ", onJwMediaDelete);

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
                                                general_content:
                                                  general_content_obj._id,
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
                                              general_content:
                                                general_content_obj._id,
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
                                        general_content:
                                          general_content_obj._id,
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
                                                        res.json({
                                                          message:
                                                            "Episode Deleted!",
                                                          status: "200",
                                                        });
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
              })
              .catch(async (onJwMediaDeleteError) => {
                console.log("on jw media delete error: ", onJwMediaDeleteError);
                res.json({
                  message:
                    "Something went wrong while deleting from jw player!",
                  status: "400",
                  error: onJwMediaDeleteError.response.data,
                });
              });
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
                                            general_content:
                                              general_content_obj._id,
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
                                                              res.json({
                                                                message:
                                                                  "Episode Deleted!",
                                                                status: "200",
                                                              });
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
                                          general_content:
                                            general_content_obj._id,
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
                                                            res.json({
                                                              message:
                                                                "Episode Deleted!",
                                                              status: "200",
                                                            });
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
                                    general_content: general_content_obj._id,
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
                                                    res.json({
                                                      message:
                                                        "Episode Deleted!",
                                                      status: "200",
                                                    });
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

module.exports = {
  createEpisodeOfASeason,
  deleteEpisode,
  uploadMediaId,
};
