const express = require("express");

const router = express.Router();

const Movie = require("../models/Movie");
const AudioTracks = require("../models/AudioTracks");
const { default: axios } = require("axios");
const { json } = require("express");

router.post("/add-audio-track/:movie_id", async (req, res) => {
  try {
    var movie_id = req.params.movie_id;
    var { download_url, name, type, language, language_code } = req.body;

    var movie = await Movie.findById({
      _id: movie_id,
    });

    if (!movie_id || movie_id === "") {
      res.json({
        message: "Required fields are empty, Please provide movie id!",
        status: "404",
      });
    } else if (!movie) {
      res.json({
        message: "No movie found with provided id!",
        status: "404",
      });
    } else {
      var media_id = movie.media_id;
      var site_id = process.env.SITE_ID;

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        upload: {
          method: "fetch",
          download_url: `${download_url}`,
        },
        metadata: {
          name: `${name}`,
          type: `${type}`,
          language: `${language}`,
          language_code: `${language_code}`,
        },
      };

      var apiResponse = await axios
        .post(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          console.log("JW API Success: ", result.data);
          var { id } = result.data;
          var { name, type, language, language_code } = result.data.metadata;

          var audioTrack = new AudioTracks({
            original_id: id,
            name,
            type,
            language,
            language_code,
            movie: movie._id,
          });

          var savedAudioTrack = await audioTrack.save();
          var filter = {
            _id: movie_id,
          };

          var updatedMovie = await Movie.findByIdAndUpdate(
            filter,
            {
              $push: { audio_tracks: savedAudioTrack._id },
            },
            {
              new: true,
            }
          )
            .then((result) => {
              res.json({
                message: "Audio track added!",
                status: "200",
                savedAudioTrack,
                updatedMovie,
                result,
              });
            })
            .catch((error) => {
              console.log("Database Error: ", error);
              res.json({
                message: "Error Occurred while updating the database!",
                status: "400",
                error,
              });
            });
        })

        .catch((error) => {
          console.log("JW API Error: ", error);
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

router.delete("/delete-audio-track/:movie_id", async (req, res) => {
  try {
    var movie_id = req.params.movie_id;
    if (!movie_id || movie_id === "") {
      res.json({
        message: "Required fields are empty, please provide a movie id!",
        status: "400",
      });
    } else {
      var movie = await Movie.findById({
        _id: movie_id,
      });

      if (!movie) {
        res.json({
          message: "No movie found with provided movie id!",
          status: "404",
        });
      } else {
        var site_id = process.env.SITE_ID;
        var media_id = movie.media_id;

        var audioTrack = await AudioTracks.findOne({
          movie: movie._id,
        });
        if (!audioTrack) {
          res.json({
            message: "No audio track found with provided movie id!",
            status: "404",
          });
        } else {
          var original_id = audioTrack.original_id;
          var headers = {
            Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
          };
          var apiResponse = await axios
            .delete(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/${original_id}/`,
              {
                headers: headers,
              }
            )
            .then(async (result) => {
              console.log("JW API Success: ", result.data);

              var updatedMovie = Movie.updateOne(
                {
                  _id: movie._id,
                },
                {
                  $pull: {
                    audio_tracks: audioTrack._id,
                  },
                },
                {
                  new: true,
                }
              )

                .then(async (result) => {
                  var deletedAudioTrack = await AudioTracks.findByIdAndDelete({
                    _id: audioTrack._id,
                  })

                    .then((result) => {
                      console.log("Database success: ", result);
                      res.json({
                        message: "Audio track deleted!",
                        status: "200",
                      });
                    })
                    .catch((error) => {
                      console.log("Database error delete audio: ", error);
                      res.json({
                        message: "Something went wrong!",
                        status: "400",
                      });
                    });
                })
                .catch((error) => {
                  console.log("Database error: ", error);
                  res.json({
                    message: "Something went wrong!",
                    status: "503",
                  });
                });
            })
            .catch((error) => {
              console.log("JW API Error: ", error);
              res.json({
                message: "Something went wrong!",
                status: "503",
              });
            });
        }
      }
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

// router.delete("/delete-audio-track/:movie_id", async (req, res) => {
//   try {
//     var movie_id = req.params.movie_id;
//     var movie = await Movie.findOne({
//       _id: movie_id,
//     });
//     var media_id = movie.media_id;
//     var audioTrack = await AudioTracks.findOne({
//       movie: movie._id,
//     });

//     var site_id = process.env.SITE_ID;
//     var original_id = audioTrack.original_id;
//     var headers = {
//       Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
//     };

//     var apiResponse = await axios
//       .delete(
//         `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/${original_id}`,
//         {
//           headers: headers,
//         }
//       )

//       .then(async (result) => {
//         console.log("JW API Success: ", result.data);

//         var updatedMovie = Movie.updateOne(
//           {
//             _id: movie._id,
//           },
//           {
//             $pull: {
//               audio_tracks: audioTrack._id,
//             },
//           },
//           {
//             new: true,
//           }
//         )
//           .then(async (result) => {
//             var deletedAudioTrack = await Subtitles.findByIdAndDelete({
//               _id: audioTrack._id,
//             });

//             res.json({
//               message: "Audio Track deleted!",
//               status: "200",
//               result: result.data,
//             });
//           })
//           .catch((error) => {
//             console.log("Database Error: ", error);
//             res.json({
//               message: "No movie found with provided id!",
//               status: "404",
//               error,
//             });
//           });
//       });
//   } catch (error) {
//     res.json({
//       message: "Internal server error!",
//       status: "500",
//       error,
//     });
//   }
// });

router.get("/get-audio-tracks/:movie_id", async (req, res) => {
  try {
    var movie_id = req.params.movie_id;
    var movie = await Movie.findById({
      _id: movie_id,
    }).populate("audio_tracks");

    if (!movie) {
      res.json({
        message: "No movie found with provided id1",
        status: "404",
      });
    } else {
      res.json({
        message: "Audio tracks found!",
        status: "200",
        audio_tracks: movie.audio_tracks,
        movie: movie,
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
