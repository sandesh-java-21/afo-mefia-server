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

module.exports = router;
