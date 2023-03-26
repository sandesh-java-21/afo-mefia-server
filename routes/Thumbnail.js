const express = require("express");

const router = express.Router();

const thumbnailControllers = require("../controllers/Thumbnails");

router.get(
  "/get-thumbnail/:general_content_id",
  thumbnailControllers.getGeneralContentThumbnail
);

router.post(
  "/generate-motion-thumbnail/:general_content_id",
  thumbnailControllers.generateJwMotionThumbnail
);

router.post(
  "/upload-custom-thumbnail/:general_content_id",
  thumbnailControllers.uploadCustomThumbnail
);

router.delete(
  "/delete-thumbnail/:thumbnail_id",
  thumbnailControllers.deleteThumbnailById
);

module.exports = router;
