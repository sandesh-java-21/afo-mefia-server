const express = require("express");

const router = express.Router();

const homeControllers = require("../controllers/Home");

router.post(
  "/get-mix-content/:genre_id/:language_code",
  homeControllers.getMixContentByGenreId
);

router.post(
  "/get-suggested-content-for-non-logged-in-users/:language_code",
  homeControllers.getSuggestedContentBasedOnHistoryTags
);

router.post(
  "/get-upcoming-movies/:language_code",
  homeControllers.getUpcomingGeneralContent
);

router.post(
  "/get-latest-movies/:language_code",
  homeControllers.getLatestGeneralContent
);

router.post(
  "/get-movies-by-genre",
  homeControllers.getListOfGeneralContentByGenre
);

router.post(
  "/get-top-rated-content/:language_code",
  homeControllers.getTopRatedMovies
);

router.post(
  "/get-suggested-content/:user_id/:language_code",
  homeControllers.getSuggestedContent
);

module.exports = router;
