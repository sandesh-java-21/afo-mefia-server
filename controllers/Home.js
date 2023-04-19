const GeneralContent = require("../models/GeneralContent");
const Media = require("../models/Media");
const axios = require("axios");

const getMixContentByGenreId = async (req, res) => {
  try {
    var genre_id = req.params.genre_id;
    var language_code = req.params.language_code;

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
        .limit(12)
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

module.exports = {
  getMixContentByGenreId,
  getSuggestedContentBasedOnHistoryTags,
};
