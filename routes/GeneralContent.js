const express = require("express");

const router = express.Router();

const generalContentControllers = require("../controllers/GeneralContent");

router.post(
  "/add-general-content",
  generalContentControllers.addGeneralContent
);

module.exports = router;
