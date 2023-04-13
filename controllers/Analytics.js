const { default: axios } = require("axios");

const Genre = require("../models/Genre");

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
    var { start_date, end_date, type } = req.body;

    var allGenres = await Genre.find();

    const newArray = allGenres.map((obj) => {
      return { ...obj, name: `${obj.name}-${type}` };
    });

    const genreNamesArray = allGenres.map((obj) => obj.name);

    console.log(genreNamesArray);

    // date format is yyyy-mm-dd

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var site_id = process.env.SITE_ID;
    var bodyData = {
      dimensions: ["tag"],
      filter: [
        {
          value: genreNamesArray,
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
      end_date: `${end_date}`,
      start_date: `${start_date}`,
      // relative_timeframe: "30 Days",
    };

    var apiResponse = await axios.post(
      `https://api.jwplayer.com/v2/sites/yP9ghzCy/analytics/queries/?format=json`,
      bodyData,
      {
        headers: headers,
      }
    );

    var rows = apiResponse.data.data.rows;
    console.log(apiResponse.data.data);

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
      message: "Top 6 genres based on total number of plays!",
      status: "200",
      analysis: responseData,
      start_date: start_date,
      end_date: end_date,
      jw_data: apiResponse.data.data,
    });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getAnalysisForTagsThisAndLastMonth = async (req, res) => {
  try {
    var { type } = req.body;
    var currentDate = new Date();

    const lastMonthStartDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    )
      .toISOString()
      .slice(0, 10);
    const lastMonthEndDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    )
      .toISOString()
      .slice(0, 10);

    var thisMonthStartDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )
      .toISOString()
      .substring(0, 10);

    var thisMonthEndDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    )
      .toISOString()
      .substring(0, 10);

    var allGenres = await Genre.find();

    const newArray = allGenres.map((obj) => {
      return { ...obj, name: `${obj.name}-${type}` };
    });

    const genreNamesArray = newArray.map((obj) => obj.name);

    console.log("genre names array: ", genreNamesArray);

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var bodyDataLastMonth = {
      dimensions: ["tag"],
      filter: [
        {
          value: genreNamesArray,
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
      end_date: lastMonthEndDate,
      start_date: lastMonthStartDate,
    };

    var bodyDataThisMonth = {
      dimensions: ["tag"],
      filter: [
        {
          value: genreNamesArray,
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
      end_date: thisMonthEndDate,
      start_date: thisMonthStartDate,
    };

    var lastMonthApiResponse = await axios.post(
      `https://api.jwplayer.com/v2/sites/${process.env.SITE_ID}/analytics/queries/?format=json`,
      bodyDataLastMonth,
      {
        headers: headers,
      }
    );

    var thisMonthApiResponse = await axios.post(
      `https://api.jwplayer.com/v2/sites/${process.env.SITE_ID}/analytics/queries/?format=json`,
      bodyDataThisMonth,
      {
        headers: headers,
      }
    );

    var lastMonthRows = lastMonthApiResponse.data.data.rows;
    var thisMonthRows = thisMonthApiResponse.data.data.rows;

    var lastMonthTagTotals = {};
    var thisMonthTagTotals = {};

    // calculate total number of plays for each tag in last month
    lastMonthRows.forEach((row) => {
      var tagName = row[0];
      var totalPlays = row[1];
      lastMonthTagTotals[tagName] = totalPlays;
    });

    // calculate total number of plays for each tag in this month
    thisMonthRows.forEach((row) => {
      var tagName = row[0];
      var totalPlays = row[1];
      thisMonthTagTotals[tagName] = totalPlays;
    });

    const thisMonthGenresWithTotals = thisMonthRows.map((row) => ({
      genre: row[0],
      count: row[1],
    }));

    const lastMonthGenresWithTotals = lastMonthRows.map((row) => ({
      genre: row[0],
      count: row[1],
    }));

    // get top 6 tags
    // var sortedTags = Object.keys(lastMonthTagTotals)
    //   .concat(Object.keys(thisMonthTagTotals))
    //   .reduce(function (acc, curr) {
    //     if (acc.indexOf(curr) === -1) acc.push(curr);
    //     return acc;
    //   }, [])
    //   .sort((a, b) => {
    //     const lastMonthTagTotalA = lastMonthTagTotals[a] || 0;
    //     return { x: obj.name, y: obj.total };
    //   });

    var sortedTags = Object.keys(lastMonthTagTotals)
      .concat(Object.keys(thisMonthTagTotals))
      .reduce(function (acc, curr) {
        if (acc.indexOf(curr) === -1) acc.push(curr);
        return acc;
      }, [])
      .map((tag) => {
        const lastMonthTagTotal = lastMonthTagTotals[tag] || 0;
        const thisMonthTagTotal = thisMonthTagTotals[tag] || 0;
        return { name: tag, total: lastMonthTagTotal + thisMonthTagTotal };
      })
      .sort((a, b) => b.total - a.total);

    console.log("sorted tags: ", sortedTags);

    const dataPoints = sortedTags.slice(0, 6).map((tagName) => {
      const lastMonthTotal = lastMonthTagTotals[tagName] || 0;
      const thisMonthTotal = thisMonthTagTotals[tagName] || 0;
      const total = lastMonthTotal + thisMonthTotal;
      return { x: tagName, y: total };
    });

    dataPoints.sort((a, b) => b.y - a.y);

    console.log("data points: ", dataPoints);

    // Sort by total in descending order
    // dataPoints.sort((a, b) => b.y - a.y);

    // Create an array of only the top tags to use as labels for the chart
    const topTags = dataPoints.slice(0, 6).map((obj) => obj.x);

    console.log("top tags: ", topTags);

    // Filter the newArray to only include the top tags and create a new array with their totals
    const topTagsWithTotals = newArray
      .filter((obj) => topTags.includes(obj.name))
      .map((obj) => {
        const lastMonthTotal = lastMonthTagTotals[obj.name.split("-")[0]] || 0;
        const thisMonthTotal = thisMonthTagTotals[obj.name.split("-")[0]] || 0;
        return {
          tag: obj.name.split("-")[0],
          lastMonthTotal,
          thisMonthTotal,
          difference: thisMonthTotal - lastMonthTotal,
        };
      });

    console.log("top tags with total before sort: ", topTagsWithTotals);

    // Sort the top tags by difference in descending order
    topTagsWithTotals.sort((a, b) => b.difference - a.difference);
    console.log("top tags with total after sort: ", topTagsWithTotals);

    // Create an object to hold the data for the chart
    const chartData = {
      lastMonthRows: lastMonthRows,
      thisMonthRows: thisMonthRows,
      thisMonthGenresWithTotals: thisMonthGenresWithTotals,
      lastMonthGenresWithTotals: lastMonthGenresWithTotals,
    };

    // Send the chart data as the response
    res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getAnalysisForMediaIds,
  getAnalysisForTags,
  getAnalysisForTagsUpdated_V2,
  getAnalysisForTagsThisAndLastMonth,
};
