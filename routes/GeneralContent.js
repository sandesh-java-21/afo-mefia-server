const express = require("express");

const router = express.Router();

const generalContentControllers = require("../controllers/GeneralContent");
const crewMembersControllers = require("../controllers/Crew");

router.post(
  "/add-general-content",
  generalContentControllers.addGeneralContent
);

router.delete(
  "/delete-general-content/:general_content_id",
  generalContentControllers.deleteGeneralContentById
);

router.get(
  "/get-general-content/:general_content_id",
  generalContentControllers.getGeneralContent
);

router.put(
  "/update-general-content/:general_content_id",
  generalContentControllers.updateGeneralContent
);

router.put(
  "/add-crew-members/:general_content_id",
  crewMembersControllers.addCrewMembers
);

router.post(
  "/get-upcoming-movies/:language_code",
  generalContentControllers.getUpcomingGeneralContent
);

router.post(
  "/get-latest-movies/:language_code",
  generalContentControllers.getLatestGeneralContent
);

router.post(
  "/get-movies-by-genre",
  generalContentControllers.getListOfGeneralContentByGenre
);

router.post(
  "/get-top-rated-content/:language_code",
  generalContentControllers.getTopRatedMovies
);

router.post(
  "/get-suggested-content/:user_id/:language_code",
  generalContentControllers.getSuggestedContent
);

module.exports = router;
