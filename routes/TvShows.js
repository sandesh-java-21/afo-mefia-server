const express = require("express");

const router = express.Router();

const tvShowsControllers = require("../controllers/TvShows");
const crewMembersControllers = require("../controllers/Crew");
const trailerControllers = require("../controllers/Trailer");

router.get("/get-all-tv-shows-list", tvShowsControllers.geAllTvShows);

router.get("/get-tv-show/:tv_show_id", tvShowsControllers.getTvShow);

router.post("/create-tv-show", tvShowsControllers.createTvShow);
router.get(
  "/get-seasons-of-a-tv-show/:tv_show_id",
  tvShowsControllers.getSeasonsOfATvShow
);

router.put(
  "/add-crew-members/:tv_show_id",
  crewMembersControllers.addCrewMembersTvShow
);

router.patch(
  "/upload-trailer-id/:tv_show_id",
  trailerControllers.uploadTrailerOfTvShow
);

module.exports = router;
