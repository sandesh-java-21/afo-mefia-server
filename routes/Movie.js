const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const { getVideoDurationInSeconds } = require("get-video-duration");
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
            var { banner_url, thumbnail_url } =
              result.data.metadata.custom_params;

            var movieObj = new Movie({
              title,
              description,
              duration,
              banner_url,
              thumbnail_url,
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

module.exports = router;
