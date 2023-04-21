const GeneralContent = require("../models/GeneralContent");
const Media = require("../models/Media");
const History = require("../models/History");
const User = require("../models/User");

const axios = require("axios");

const getMixContentByGenreId = async (req, res) => {
  try {
    var genre_id = req.params.genre_id;
    var language_code = req.params.language_code;
    var limit = 12;

    var { category } = req.body;

    if (!genre_id || genre_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var mixContent = await GeneralContent.find({
        genre: { $in: [genre_id] },
      })
        .populate([
          {
            path: "media",
            populate: {
              path: "translated_content",
              match: { language_code: language_code },
            },
          },
        ])
        .populate("thumbnail")
        .limit(limit)
        .then(async (onGcFound) => {
          console.log("on gc found: ", onGcFound);

          const filteredContent = onGcFound.filter((content) => {
            return content.media.translated_content.length > 0;
          });

          for (let i = filteredContent.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredContent[i], filteredContent[j]] = [
              filteredContent[j],
              filteredContent[i],
            ];
          }

          console.log("general content after shuffle: ", filteredContent);

          res.json({
            message: "General content found!",
            status: "200",
            general_content: filteredContent,
          });
        })
        .catch(async (onGcNotFound) => {
          console.log("on gc not found: ", onGcNotFound);
          res.json({
            message: "Something went wrong!",
            status: "400",
            error: onGcNotFound,
          });
        });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

const getSuggestedContentBasedOnHistoryTags = async (req, res) => {
  try {
    var { userTags } = req.body;

    var language_code = req.params.language_code;

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var jwAnalyticsData = {
      dimensions: ["media_id"],
      filter: [
        {
          value: userTags,
          field: "tag",
          operator: "LIKE",
        },
      ],
      metrics: [
        {
          field: "plays",
          operation: "sum",
        },
      ],
      sort: [
        {
          field: "plays",
          operation: "sum",
          order: "DESCENDING",
        },
      ],
      relative_timeframe: "90 Days",
    };

    var site_id = process.env.SITE_ID;

    var apiResponse = await axios
      .post(
        `https://api.jwplayer.com/v2/sites/${site_id}/analytics/queries/`,
        jwAnalyticsData,
        {
          headers: headers,
        }
      )
      .then(async (onJwAnalysisReceived) => {
        console.log("on jw analysis received : ", onJwAnalysisReceived);

        const media_ids_jw_player = onJwAnalysisReceived.data.data.rows.map(
          (item) => item[0]
        );

        console.log("jw player media ids: ", media_ids_jw_player);
        var media = await Media.find({
          media_id: {
            $in: media_ids_jw_player,
          },
        })
          .then(async (onMediaFound) => {
            console.log("on media found: ", onMediaFound);

            var idsForGc = onMediaFound.map((media) => media._id);
            console.log("ids for gc: ", idsForGc);

            var general_content = await GeneralContent.find({
              media: {
                $in: idsForGc,
              },
            })
              .populate([
                {
                  path: "media",
                  populate: {
                    path: "translated_content",
                    match: { language_code: language_code },
                  },
                },
              ])
              .populate("thumbnail")
              .then(async (onGcFound) => {
                console.log("on gc found: ", onGcFound);

                const filteredContent = onGcFound.filter((content) => {
                  return content.media.translated_content.length > 0;
                });

                res.json({
                  message: "Your suggested content found!",
                  status: "200",
                  general_contents: filteredContent,
                });
              })
              .catch(async (onGcFoundError) => {
                console.log("on gc found error: ", onGcFoundError);
                res.json({
                  message:
                    "Something went wrong while suggesting content for you!",
                  status: "400",
                  error: onGcFoundError,
                });
              });
          })
          .catch(async (onMediaFoundError) => {
            console.log("on media found error: ", onMediaFoundError);
            res.json({
              message: "Something went wrong while suggesting content for you!",
              status: "400",
              error: onMediaFoundError,
            });
          });
      })
      .catch(async (onJwAnalysisReceivedError) => {
        console.log(
          "on jw analysis received error: ",
          onJwAnalysisReceivedError
        );
        res.json({
          message: "Something went wrong while suggesting content for you!",
          status: "400",
          error: onJwAnalysisReceivedError,
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

const getUpcomingGeneralContent = async (req, res) => {
  try {
    const language_code = req.params.language_code;

    var limit = 12;

    const upcomingContent = await GeneralContent.find({
      availability: "upcoming",
    })
      .populate([
        {
          path: "media",
          populate: {
            path: "translated_content",
            match: { language_code: language_code },
          },
        },
        { path: "genre" },
        { path: "trailer" },
        { path: "thumbnail" },
        { path: "comments" },
      ])
      .exec()
      .limit(limit);

    console.log("jdhfsgsfdh:   : ", upcomingContent);

    const filteredContent = upcomingContent.filter((content) => {
      return content.media.translated_content.length > 0;
    });

    res.json({
      message: "Upcoming general content found!",
      status: "200",
      upcomingContent: filteredContent,
    });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getLatestGeneralContent = async (req, res) => {
  try {
    const language_code = req.params.language_code;
    var limit = 12;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const generalContent = await GeneralContent.find({
      "translated_content.language_code": language_code,
    })
      .populate("media")
      .exec()
      .limit(limit);

    const filteredGeneralContent = generalContent.filter((content) => {
      const releaseYear = content.media.release_year.getFullYear();
      const releaseMonth = content.media.release_year.getMonth() + 1;
      return releaseYear === currentYear && releaseMonth === currentMonth;
    });

    console.log("upcoming content: ", filteredGeneralContent);
    res.send(filteredGeneralContent);

    // const filteredContent = upcomingContent.filter((content) => {
    //   return content.media.translated_content.length > 0;
    // });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getListOfGeneralContentByGenre = async (req, res) => {
  try {
    const genres = await Genre.find({});
    var limit = 12;

    // Create an array to store the list of lists
    const generalContentList = [];

    // Loop through each genre
    for (const genre of genres) {
      // Find all general contents for this genre
      const generalContents = await GeneralContent.find({
        genre: genre._id,
      })
        .populate("genre")
        .populate("media")
        .populate("thumbnail");

      // Add the list of general contents to the list of lists
      generalContentList.push(generalContents);
    }

    // Return the list of lists
    res.json(generalContentList);
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const activateGeneralContent = async (req, res) => {
  try {
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var limit = 12;
    console.log("headers: ", headers);

    var site_id = process.env.SITE_ID;

    var language_code = req.params.language_code;

    var bodyData = {
      dimensions: ["media_id"],
      metrics: [
        {
          field: "plays",
          operation: "sum",
        },
      ],
      sort: [
        {
          field: "plays",
          operation: "sum",
          order: "DESCENDING",
        },
      ],
      relative_timeframe: "90 Days",
    };

    var apiResponse = await axios
      .post(
        `https://api.jwplayer.com/v2/sites/${site_id}/analytics/queries/`,
        bodyData,
        {
          headers: headers,
        }
      )
      .then(async (onSuccess) => {
        console.log("on success: ", onSuccess);

        var rows = onSuccess.data.data.rows;
        console.log("rows: ", rows);

        var media_ids = [];

        for (let i = 0; i < rows.length; i++) {
          console.log("media id: ", rows[i][0]);

          media_ids.push(rows[i][0]);
        }

        console.log("media ids: ", media_ids);

        var medias = await Media.find(
          {
            media_id: {
              $in: media_ids,
            },
          },
          {
            _id: 1,
          }
        )
          .then(async (onMediaIdsFound) => {
            console.log("on media ids found: ", onMediaIdsFound);

            var general_contents = await GeneralContent.find({
              media: {
                $in: onMediaIdsFound,
              },
            })
              .populate([
                {
                  path: "media",
                  populate: {
                    path: "translated_content",
                    match: { language_code: language_code },
                  },
                },
              ])
              .limit(limit)
              .then(async (onGcsFound) => {
                console.log("on general contents found: ", onGcsFound);

                const filteredContent = onGcsFound.filter((content) => {
                  return content.media.translated_content.length > 0;
                });
                res.json({
                  message: "Top rated content found!",
                  status: "200",
                  rows: rows,
                  media_ids: media_ids,
                  general_contents: filteredContent,
                });
              })
              .catch(async (onGcsNotFound) => {
                console.log("on general contents not found: ", onGcsNotFound);
                res.json({
                  message:
                    "Something went wrong while getting top rated content!",
                  status: "400",
                  error: onGcsNotFound,
                });
              });
          })
          .catch(async (onMediaIdsNotFound) => {
            console.log("on media ids not found: ", onMediaIdsNotFound);
            res.json({
              message: "Something went wrong while getting top rated content!",
              status: "400",
              error: onMediaIdsNotFound,
            });
          });
      })
      .catch(async (onFail) => {
        console.log("on fail: ", onFail);
        res.json({
          message: "Something went wrong while getting top rated content!",
          status: "400",
          error: onFail.data.response,
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

const getSuggestedContent = async (req, res) => {
  try {
    console.log("fkhsfksdfhfisdh");
    var limit = 12;

    var user_id = req.params.user_id;
    var language_code = req.params.language_code;

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    if (!user_id || user_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var user = await User.findById(user_id)
        .then(async (onUserFound) => {
          console.log("on user found: ", onUserFound);

          console.log(" history ids: ", onUserFound.history);

          var historyMedias = await History.find(
            {
              _id: {
                $in: onUserFound.history,
              },
            },
            {
              media: 1,
              _id: 0,
            }
          )
            .then(async (onMediasFound) => {
              console.log("on medias found: ", onMediasFound);

              const newArr = onMediasFound.map((obj) => {
                const { media } = obj;
                return { _id: media };
              });
              console.log("new arr: ", newArr);
              // res.json({
              //   medias: onMediasFound[0].media,
              // });

              var mediaObjs = await Media.find({
                _id: {
                  $in: newArr,
                },
              })

                .then(async (onMediaObjsFound) => {
                  console.log("on medias objs found: ", onMediaObjsFound);

                  const userJwTags = [
                    ...new Set(
                      onMediaObjsFound.map((obj) => obj.jw_tags).flat()
                    ),
                  ];

                  var jwAnalyticsData = {
                    dimensions: ["media_id"],
                    filter: [
                      {
                        value: userJwTags,
                        field: "tag",
                        operator: "LIKE",
                      },
                    ],
                    metrics: [
                      {
                        field: "plays",
                        operation: "sum",
                      },
                    ],
                    sort: [
                      {
                        field: "plays",
                        operation: "sum",
                        order: "DESCENDING",
                      },
                    ],
                    relative_timeframe: "90 Days",
                  };

                  var site_id = process.env.SITE_ID;

                  var apiResponse = await axios
                    .post(
                      `https://api.jwplayer.com/v2/sites/${site_id}/analytics/queries/`,
                      jwAnalyticsData,
                      {
                        headers: headers,
                      }
                    )
                    .then(async (onJwAnalysisReceived) => {
                      console.log(
                        "on jw analysis received: ",
                        JSON.stringify(onJwAnalysisReceived.data)
                      );

                      const media_ids_jw_player =
                        onJwAnalysisReceived.data.data.rows.map(
                          (item) => item[0]
                        );

                      console.log("jw player media ids: ", media_ids_jw_player);
                      var media = await Media.find({
                        media_id: {
                          $in: media_ids_jw_player,
                        },
                      })
                        .then(async (onMediaFound) => {
                          console.log("on media found: ", onMediaFound);

                          var idsForGc = onMediaFound.map((media) => media._id);
                          console.log("ids for gc: ", idsForGc);

                          var general_content = await GeneralContent.find({
                            media: {
                              $in: idsForGc,
                            },
                          })
                            .populate([
                              {
                                path: "media",
                                populate: {
                                  path: "translated_content",
                                  match: { language_code: language_code },
                                },
                              },
                            ])
                            .populate("thumbnail")
                            .limit(limit)
                            .then(async (onGcFound) => {
                              console.log(
                                "on general content found: ",
                                onGcFound
                              );

                              const filteredContent = onGcFound.filter(
                                (content) => {
                                  return (
                                    content.media.translated_content.length > 0
                                  );
                                }
                              );

                              res.json({
                                message: "Your suggested content found!",
                                status: "200",
                                general_contents: filteredContent,
                              });
                            })
                            .catch(async (onGcsNotFound) => {
                              console.log(
                                "on general content not found: ",
                                onGcsNotFound
                              );
                              res.json({
                                message:
                                  "Something went wrong while getting suggested content for you!",
                                status: "400",
                                error: onGcsNotFound,
                              });
                            });
                        })
                        .catch(async (onMediaNotFound) => {
                          console.log("on media not found: ", onMediaNotFound);
                          res.json({
                            message:
                              "Something went wrong while getting suggested content for you!",
                            status: "400",
                            error: onMediaNotFound,
                          });
                        });
                    })
                    .catch(async (onJwAnalysisReceivedError) => {
                      console.log(
                        "on jw analysis received error: ",
                        onJwAnalysisReceivedError
                      );
                      res.json({
                        message:
                          "Something went wrong while getting suggested content for you!",
                        status: "400",
                        error: onJwAnalysisReceivedError,
                      });
                    });
                })
                .catch(async (onMediaObjsNotFound) => {
                  console.log("on media objs not found: ", onMediaObjsNotFound);
                  res.json({
                    message:
                      "Something went wrong while getting suggested content for you!",
                    status: "400",
                    error: onMediaObjsNotFound,
                  });
                });
            })
            .catch(async (onMediasNotFound) => {
              console.log("on medias not found: ", onMediasNotFound);
              res.json({
                message:
                  "Something went wrong while getting suggested content for you!",
                status: "400",
                error: onMediasNotFound,
              });
            });
        })
        .catch(async (onUserNotFound) => {
          console.log("on user not found: ", onUserNotFound);
          res.json({
            message: "User not found with provided id!",
            status: "404",
            error: onUserNotFound,
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
  getMixContentByGenreId,
  getSuggestedContentBasedOnHistoryTags,
  getUpcomingGeneralContent,
  getLatestGeneralContent,
  getListOfGeneralContentByGenre,
  getTopRatedMovies,
  getSuggestedContent,
};
