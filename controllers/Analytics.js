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
  try {
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

module.exports = {
  getAnalysisForMediaIds,
  getAnalysisForTags,
};
