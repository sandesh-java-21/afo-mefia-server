const Season = require("../models/Season");
const Episode = require("../models/Episode");
const TvShow = require("../models/TvShow");

const getAllEpisodesOfASeason = async (req, res) => {
  try {
    var season_id = req.params.season_id;

    if (!season_id || season_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var season = await Season.findById(season_id)
        .populate("episodes")
        .then(async (onSeasonFound) => {
          console.log("on season found: ", onSeasonFound);

          res.json({
            message: "Episodes found!",
            status: "200",
            episodes: onSeasonFound.episodes,
            season: onSeasonFound,
          });
        })
        .catch(async (onSeasonFoundError) => {
          console.log("on season found error: ", onSeasonFoundError);
          res.json({
            message: "Something went wrong while getting episodes of a season!",
            status: "400",
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

const getSeasonsOfAtvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;

    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var tv_show = await TvShow.findById(tv_show_id)
        .populate("seasons", {
          title: 1,
          _id: 1,
        })

        .then(async (onTvShowFound) => {
          console.log("on tv show found: ", onTvShowFound);

          res.json({
            message: "Seasons found!",
            status: "200",
            seasons: onTvShowFound.seasons,
          });
        })
        .catch(async (onTvShowFoundError) => {
          console.log("on tv show found error: ", onTvShowFoundError);
          res.json({
            message: "Something went wrong while getting seasons of a tv show!",
            status: "400",
            error: onTvShowFoundError,
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
  getAllEpisodesOfASeason,
  getSeasonsOfAtvShow,
};
