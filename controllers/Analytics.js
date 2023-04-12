const { default: axios } = require("axios");

const getAnalysisForMediaIds = async (req, res) => {
  try {
    var { media_ids, start_date, end_date } = req.body;

    // date format is yyyy-mm-dd

    if (!media_ids || media_ids.length <= 0) {
      res.json({
        message: "Please provide a media id!",
        status: "400",
      });
    } else {
      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var site_id = process.env.SITE_ID;
      var bodyData = {
        dimensions: ["media_id"],
        filter: [
          {
            value: media_ids,
            field: "media_id",
            operator: "=",
          },
        ],

        metrics: [
          {
            field: "plays",
            operation: "sum",
          },
          {
            field: "time_watched_per_viewer",
            operation: "sum",
          },

          {
            field: "unique_viewers",
            operation: "sum",
          },

          {
            field: "completes",
            operation: "sum",
          },

          {
            field: "complete_rate",
            operation: "sum",
          },

          {
            field: "plays_per_viewer",
            operation: "sum",
          },

          {
            field: "time_watched",
            operation: "sum",
          },
        ],

        end_date: `${end_date}`,
        start_date: `${start_date}`,
      };

      var apiResponse = await axios
        .post(
          `https://api.jwplayer.com/v2/sites/yP9ghzCy/analytics/queries/?format=json`,
          bodyData,
          {
            headers: headers,
          }
        )

        .then(async (onSuccess) => {
          res.json({
            message: "Analysis are here!",
            status: "200",
            analysis: onSuccess.data,
          });
        })
        .catch((onError) => {
          res.json({
            message: "Something went wrong while getting analysis for media!",
            status: "400",
            onError,
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

const getAnalysisForTags = async (req, res) => {
  // try {
  var { tags, start_date, end_date } = req.body;

  // date format is yyyy-mm-dd

  if (!tags || tags.length <= 0) {
    res.json({
      message: "Please provide a tag!",
      status: "400",
    });
  } else {
    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var site_id = process.env.SITE_ID;
    var bodyData = {
      dimensions: ["tag"],
      filter: [
        {
          value: tags,
          field: "tag",
          operator: "LIKE",
        },
      ],

      metrics: [
        {
          field: "plays",
          operation: "sum",
        },
        {
          field: "time_watched_per_viewer",
          operation: "sum",
        },

        {
          field: "unique_viewers",
          operation: "sum",
        },

        {
          field: "completes",
          operation: "sum",
        },

        {
          field: "complete_rate",
          operation: "sum",
        },

        {
          field: "plays_per_viewer",
          operation: "sum",
        },

        {
          field: "time_watched",
          operation: "sum",
        },
        {
          field: "ad_impressions",
          operation: "sum",
        },
        {
          field: "ads_per_viewer",
          operation: "sum",
        },
      ],

      end_date: `${end_date}`,
      start_date: `${start_date}`,
    };

    var apiResponse = await axios
      .post(
        `https://api.jwplayer.com/v2/sites/yP9ghzCy/analytics/queries/?format=json`,
        bodyData,
        {
          headers: headers,
        }
      )

      .then(async (onSuccess) => {
        // var metrics = onSuccess.data.data.metadata;

        var { end_date, start_date, column_headers } = onSuccess.data.metadata;

        var rows = onSuccess.data.data.rows[0];
        var tagName = rows[0];
        // console.log("Rows: ", rows);
        // console.log("start and end date: ", start_date, end_date);
        // console.log("Metrics: ", column_headers);
        // console.log("tag name: ", tagName);

        var responseData = {
          tagName: tagName,
          totalPlays: rows[1],
          totalTimeWatchedPerViewer: rows[2],
          totalUniqueViewers: rows[3],
          totalCompleted: rows[4],
          totalCompleteRate: rows[5],
          totalPlaysPerViewer: rows[6],
          totalTimeWatched: rows[7],
          totalAdImpressions: rows[8],
          totalAdsPerViewer: rows[9],
        };

        res.json({
          message: "Analysis are here!",
          status: "200",
          analysis: responseData,
          start_date: start_date,
          end_date: end_date,
        });
      });
    // .catch((onError) => {
    //   res.json({
    //     message: "Something went wrong while getting analysis for media!",
    //     status: "400",
    //     onError,
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

const getAnalysisForTagsUpdated_V2 = async (req, res) => {
  try {
    var { start_date, end_date } = req.body;

    // date format is yyyy-mm-dd

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var site_id = process.env.SITE_ID;
    var bodyData = {
      dimensions: ["tag"],
      metrics: [
        {
          field: "plays",
          operation: "sum",
        },
      ],
      end_date: `${end_date}`,
      start_date: `${start_date}`,
    };

    var apiResponse = await axios.post(
      `https://api.jwplayer.com/v2/sites/yP9ghzCy/analytics/queries/?format=json`,
      bodyData,
      {
        headers: headers,
      }
    );

    var rows = apiResponse.data.data.rows;
    var tagTotals = {};

    // calculate total number of plays for each tag
    rows.forEach((row) => {
      var tagName = row[0];
      var totalPlays = row[1];
      tagTotals[tagName] = totalPlays;
    });

    // sort tags based on total number of plays
    var sortedTags = Object.keys(tagTotals).sort(
      (a, b) => tagTotals[b] - tagTotals[a]
    );

    // get top 6 tags
    var topTags = sortedTags.slice(0, 6);

    var responseData = topTags.map((tagName) => {
      return {
        tagName: tagName,
        totalPlays: tagTotals[tagName],
      };
    });

    res.json({
      message: "Top 6 tags based on total number of plays!",
      status: "200",
      analysis: responseData,
      start_date: start_date,
      end_date: end_date,
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
  getAnalysisForMediaIds,
  getAnalysisForTags,
  getAnalysisForTagsUpdated_V2,
};
