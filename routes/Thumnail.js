const express = require("express");

const router = express.Router();

const Movie = require("../models/Movie");
const Thumbnail = require("../models/Thumbnail");

const axios = require("axios");

router.post("/add-thumbnail/:movie_id", async (req, res) => {
  try {
    var movieId = req.params.movie_id;
    var movie = await Movie.findOne({
      _id: movieId,
    });

    console.log("Media Id: ", movie.media_id);

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var apiResponse = await axios
      .get(
        `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails/?q=media_id:${movie.media_id}`,
        {
          headers: headers,
        }
      )
      .then(async (thumbnailResult) => {
        var { thumbnails } = thumbnailResult.data;

        var thumbnailObj = new Thumbnail({
          movie: movieId,
          static_url: thumbnails[0].delivery_url,
          motion_url: thumbnails[1].delivery_url,
        });

        var savedThumbnail = await thumbnailObj.save();

        res.json({
          message: "Thumbnail Created!",
          status: "200",
          static_thumbnail: thumbnails[0].delivery_url,
          motion_thumbnail: thumbnails[1].delivery_url,
          savedThumbnail,
        });
      })
      .catch((error) => {
        console.log("Error thumbnail: ", error);
        res.json({
          message: "Something went wrong!",
          status: "400",
          error,
        });
      });
  } catch (error) {
    console.log("catch error");
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

router.get("/get-thumbnail/:movie_id", async (req, res) => {
  try {
    var movie_id = req.params.movie_id;

    var thumbnail = await Thumbnail.findOne({
      movie: movie_id,
    })
      .populate("movie")
      .then((thumbnail) => {
        res.json({
          message: "Thumbnail Found!",
          status: "200",
          thumbnail,
        });
      })

      .catch((error) => {
        res.json({
          message: "Something went wrong!",
          status: "400",
          error,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

module.exports = router;
