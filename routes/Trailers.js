const express = require("express");
const router = express.Router();

const trailerControllers = require("../controllers/Trailer");

router.post(
  "/upload-trailer/:general_content_id",
  trailerControllers.uploadTrailerOfGeneralContent
);

module.exports = router;
