const express = require("express");

const router = express.Router();

const mediaControllers = require("../controllers/Media");

router.post("/create-media", mediaControllers.createMedia);
router.patch("/upload-media/:general_content_id", mediaControllers.uploadMedia);
router.put(
  "/re-upload-media/:media_id",
  mediaControllers.reUploadMediaByMediaId
);

module.exports = router;
