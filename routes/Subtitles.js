const { default: axios } = require("axios");
const express = require("express");

const router = express.Router();

const Movie = require("../models/Movie");

const Subtitles = require("../models/Subtitles");

router.post("/add-subtitles/:movie_id", async (req, res) => {
  try {
    var movie_id = req.params.movie_id;
    var { file_format, download_url, label, language } = req.body;
    var movie = await Movie.findById({
      _id: movie_id,
    });

    if (!movie) {
      res.json({
        message: "No movie found!",
        status: "404",
      });
    } else {
      var media_id = movie.media_id;
      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        upload: {
          file_format: file_format,
          method: "fetch",
          download_url: download_url,
        },
        metadata: {
          label: label,
          srclang: language,
          track_kind: "subtitles",
        },
      };

      var site_id = process.env.SITE_ID;

      var apiResponse = await axios
        .post(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/text_tracks/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (subtitleResult) => {
          var { id, track_kind } = subtitleResult.data;
          var { srclang } = subtitleResult.data.metadata;

          setTimeout(() => {}, 3000);

          var apiResponse_2 = await axios
            .get(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/text_tracks/${id}/`,
              {
                headers: headers,
              }
            )
            .then(async (subtitleResult_2) => {
              var { delivery_url } = subtitleResult_2.data;

              console.log(movie);
              var filter = { _id: movie._id };
              var subtitlesObj = new Subtitles({
                track_id: id,
                delivery_url,
                track_kind,
                language: srclang,
              });

              var savedSubtitles = subtitlesObj.save();

              var updatedMovie = await Movie.findByIdAndUpdate(
                filter,
                {
                  $push: { subtitles: subtitlesObj._id },
                },
                {
                  new: true,
                }
              )
                .then((updatedMovieResult) => {
                  console.log("Saved Subtitles: ", savedSubtitles);
                  res.json({
                    message: "Subtitles Created!",
                    status: "200",
                    savedSubtitles,
                    updatedMovieResult,
                  });
                })
                .catch((error) => {
                  res.json({
                    error,
                  });
                });
            })

            .catch((error) => {
              res.json({
                error,
              });
            });
        })
        .catch((error) => {
          res.json({
            message: "Something went wrong!",
            status: "400",
            error,
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
});

module.exports = router;
