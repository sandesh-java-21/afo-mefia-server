const express = require("express");
const router = express.Router();

const trailerControllers = require("../controllers/Trailer");

router.post(
  "/upload-trailer/:general_content_id",
  trailerControllers.uploadTrailerOfGeneralContentUpdated
);

router.patch(
  "/upload-trailer-media-id/:general_content_id",
  trailerControllers.uploadTrailerMediaIdToMediaObject
);

module.exports = router;
