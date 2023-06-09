const { default: axios } = require("axios");
const express = require("express");

const router = express.Router();

const subtitlesControllers = require("../controllers/Subtitles");

router.post(
  "/add-subtitles/:media_object_id",
  subtitlesControllers.addSubtitlesUpdated_V2
);

router.post(
  "/add-subtitles-for-episode/:episode_id",
  subtitlesControllers.addSubtitlesForEpisode
);

router.delete(
  "/delete-subtitles/:media_object_id/:subtitles_id",
  subtitlesControllers.deletedSubtitles
);

router.delete(
  "/delete-subtitles-of-episode/:episode_id/:subtitles_id",
  subtitlesControllers.deletedSubtitlesOfEpisode
);

router.get(
  "/get-subtitles-by-general-content/:general_content_id",
  subtitlesControllers.getSubtitlesByGeneralContentId
);
router.get(
  "/get-subtitles-by-media/:media_id",
  subtitlesControllers.getSubtitlesByMediaId
);

router.get(
  "/get-subtitles-by-episode/:episode_id",
  subtitlesControllers.getSubtitlesByEpisodeId
);

router.put(
  "/update-subtitles/:subtitles_id",
  subtitlesControllers.updateSubtitles
);

// router.get("/get-subtitles/:movie_id", async (req, res) => {
//   try {
//     var movie_id = req.params.movie_id;

//     if (!movie_id) {
//       res.json({
//         message: "Please provide a movie id!",
//         status: "400",
//       });
//     } else {
//       var movie = await Movie.findOne({
//         _id: movie_id,
//       }).populate("subtitles");

//       console.log("Subtitles: ", movie.subtitles);

//       res.json({
//         message: "Subtitles found!",
//         status: "200",
//         subtitles: movie.subtitles,
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
