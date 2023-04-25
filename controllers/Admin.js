const GeneralContent = require("../models/GeneralContent");

const getMovieList = async (req, res) => {
  try {
    var allMovies = await GeneralContent.find({
      category: "movie",
    })
      .populate(["media", "genre"])
      //   .populate("genre")
      .populate("thumbnail")
      .then(async (onMoviesFound) => {
        console.log("on movies found: ", onMoviesFound);
        if (onMoviesFound.length <= 0) {
          res.json({
            message: "No movies available!",
            status: "404",
          });
        } else {
          res.json({
            message: "All movies found!",
            status: "200",
            allMovies: onMoviesFound,
          });
        }
      })
      .catch(async (onMoviesFoundError) => {
        console.log("on movies found error: ", onMoviesFoundError);
        res.json({
          message: "Something went wrong while getting movie list!",
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

module.exports = { getMovieList };
