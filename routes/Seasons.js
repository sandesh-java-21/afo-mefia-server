const express = require("express");

const router = express.Router();

const seasonsControllers = require("../controllers/Seasons");
const tvShowControllers = require("../controllers/TvShows");

router.get(
  "/get-episodes-of-season/:season_id",
  seasonsControllers.getAllEpisodesOfASeason
);

router.get(
  "/get-seasons-of-tv-show/:tv_show_id",
  seasonsControllers.getSeasonsOfAtvShow
);

router.post(
  "/create-season-of-tv-show/:tv_show_id",
  tvShowControllers.createSeasonOfAtvShow
);

router.delete("/delete-season/:season_id", seasonsControllers.deleteSeasonById);

module.exports = router;
