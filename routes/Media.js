const express = require("express");

const router = express.Router();

const mediaControllers = require("../controllers/Media");

router.post("/create-media", mediaControllers.createMedia);
router.post("/updated-create-media", mediaControllers.createMediaUpdated);
router.patch("/upload-media/:general_content_id", mediaControllers.uploadMedia);

router.put("/upload-media-id/:media_Obj_Id", mediaControllers.uploadMediaId);

router.put(
  "/re-upload-media/:media_id",
  mediaControllers.reUploadMediaByMediaId
);

module.exports = router;
