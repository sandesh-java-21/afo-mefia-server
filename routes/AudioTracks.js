const express = require("express");

const router = express.Router();

const Movie = require("../models/Media");
const AudioTracks = require("../models/AudioTracks");
const Media = require("../models/Media");

const audioTracksControllers = require("../controllers/AudioTracks");

const { default: axios } = require("axios");

router.post(
  "/add-audio-track/:media_object_id",
  audioTracksControllers.addAudioTrack
);

router.delete(
  "/delete-audio-track/:media_object_id/:audio_track_id",
  audioTracksControllers.deletedAudioTrack
);

// router.get("/get-audio-tracks/:movie_id", async (req, res) => {
//   try {
//     var movie_id = req.params.movie_id;
//     var movie = await Movie.findById({
//       _id: movie_id,
//     }).populate("audio_tracks");

//     if (!movie) {
//       res.json({
//         message: "No movie found with provided id1",
//         status: "404",
//       });
//     } else {
//       res.json({
//         message: "Audio tracks found!",
//         status: "200",
//         audio_tracks: movie.audio_tracks,
//         movie: movie,
//       });
//     }
//   } catch (error) {
//     res.json({
//       message: "Internal server error!",
//       status: "500",
//       error,
//     });
//   }
// });

module.exports = router;
