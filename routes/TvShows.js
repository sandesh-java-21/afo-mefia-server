const express = require("express");

const router = express.Router();

const tvShowsControllers = require("../controllers/TvShows");

router.get("/get-all-tv-shows-list", tvShowsControllers.geAllTvShows);
router.post("/create-tv-show", tvShowsControllers.createTvShow);
router.get(
  "/get-seasons-of-a-tv-show/:tv_show_id",
  tvShowsControllers.getSeasonsOfATvShow
);

module.exports = router;
