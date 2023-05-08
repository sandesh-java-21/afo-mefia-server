const express = require("express");

const router = express.Router();

const seasonsControllers = require("../controllers/Seasons");
const tvShowControllers = require("../controllers/TvShows");
const episodesControllers = require("../controllers/Episodes");

router.post(
  "/create-episode-of-season/:season_id",
  episodesControllers.createEpisodeOfASeason
);

router.patch("/upload-media-id/:episode_id", episodesControllers.uploadMediaId);

router.delete(
  "/delete-episode/:episode_id/:season_id",
  episodesControllers.deleteEpisode
);

module.exports = router;
