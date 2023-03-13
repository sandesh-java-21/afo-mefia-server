const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const { getVideoDurationInSeconds } = require("get-video-duration");
const { findByIdAndDelete } = require("../models/Movie");
const Movie = require("../models/Movie");

router.post("/upload-movie-via-url", async (req, res) => {
  try {
    var {
      title,
      description,
      thumbnail_url,
      banner_url,
      tags,
      category,
      default_language,
      release_year,
      subtitles,
      audio_tracks,
      download_url,
      author,
    } = req.body;

    console.log(
      "Data body: ",
      title,
      description,
      thumbnail_url,
      banner_url,
      tags,
      category,
      default_language,
      release_year,
      subtitles,
      audio_tracks,
      download_url,
      author
    );
    console.log("API Key: ", process.env.JW_PLAYER_API_KEY);

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var video_duration = getVideoDurationInSeconds(`${download_url}`).then(
      async (duration) => {
        var data = {
          upload: {
            method: "fetch",
            download_url: `${download_url}`,
          },
          metadata: {
            custom_params: {
              thumbnail_url: `${thumbnail_url}`,
              banner_url: `${banner_url}`,
              category: "sfhgs",
              sub_category: "kjfgf",
            },
            title: title,
            description: description,
            author: author,
            duration: duration * 1000,
            category: `${category}`,
            tags: tags,
            language: default_language,
          },
        };

        var apiResponse = await axios
          .post("https://api.jwplayer.com/v2/sites/yP9ghzCy/media", data, {
            headers: headers,
          })
          .then(async (result) => {
            var { author, category, description, language, tags, title } =
              result.data.metadata;
            var { duration, id } = result.data;

            var movieObj = new Movie({
              title,
              description,
              duration,
              banner_url,
              category,
              default_language: language,
              release_year: release_year,
              media_id: id,
            });

            var savedMovie = await movieObj.save();

            res.json({
              status: "200",
              message: "New movie uploaded!",
              movie: savedMovie,
              success: true,
              result: result.data,
            });
          })
          .catch((error) => {
            console.log("Error: ", error.data);
            res.json({
              error,
              message: "Error occurred while uploading movie",
              status: "400",
            });
          });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
});

router.delete("/delete-movie/:movie_id", async (req, res) => {
  try {
    var movie_id = req.params.movie_id;

    if (!movie_id) {
      res.json({
        message: "Please provide a movie id!",
        status: "400",
      });
    } else {
      var movie = await Movie.findById({
        _id: movie_id,
      });

      var site_id = process.env.SITE_ID;
      var media_id = movie.media_id;

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var apiResponse = await axios
        .delete(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/`,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          console.log("JW Delete Response: ", result.data);
          var deletedMovie = await Movie.findByIdAndDelete({
            _id: movie_id,
          })
            .then((result) => {
              console.log("Database Result Delete: ", result.data);
              res.json({
                message: "Movie deleted successfully!",
                status: "200",
              });
            })
            .catch((error) => {
              console.log("Database Error Delete: ", error);
              res.json({
                message: "No movie found with provided id!",
                status: "404",
                error,
              });
            });
        })

        .catch((error) => {
          console.log("JW Delete Error: ", error);
          res.json({
            message: "Something went wrong!",
            error,
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
});

router.put("/update-movie/:movie_id", async (req, res) => {
  // try {
  var movie_id = req.params.movie_id;
  var { title, description, category, default_language, release_year, tags } =
    req.body;

  if (!movie_id) {
    res.json({
      message: "Please provide a movie id!",
      status: "400",
    });
  } else if (
    title === "" ||
    description === "" ||
    category === "" ||
    default_language === "" ||
    release_year === ""
  ) {
    res.json({
      message: "Required field are empty!",
      status: "400",
    });
  } else {
    var movie = await Movie.findById({
      _id: movie_id,
    });

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var data = {
      metadata: {
        custom_params: {
          category: `${category}`,
        },
        title: title,
        description: description,
        category: `${category}`,
        tags: tags,
        language: default_language,
      },
    };

    var site_id = process.env.SITE_ID;
    var media_id = movie.media_id;

    var apiResponse = await axios
      .patch(
        `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/`,
        data,
        {
          headers: headers,
        }
      )
      .then(async (result) => {
        console.log("JW Result: ", result.data);
        var filter = {
          _id: movie_id,
        };
        var updateData = {
          title,
          description,
          category,
          default_language,
          release_year,
        };
        var updatedMovie = await Movie.findByIdAndUpdate(filter, updateData, {
          new: true,
        })
          .then((result) => {
            console.log("Database update result: ", result);
            res.json({
              message: "Movie updated successfully!",
              status: "200",
              updatedMovie,
            });
          })

          .catch((error) => {
            console.log("Database update error: ", error);
            res.json({
              message: "No movie found with provided id!",
              status: "404",
              error,
            });
          });
      })

      .catch((error) => {
        console.log("JW catch update error: ", error);
        res.json({
          message: "Something went wrong!",
          status: "400",
          error,
        });
      });
  }
  // } catch (error) {
  //   res.status(500).json({
  //     message: "Internal server error!",
  //     status: "500",
  //     error: error,
  //   });
  // }
});

module.exports = router;
