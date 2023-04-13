const express = require("express");
const router = express.Router();

const videoContentControllers = require("../controllers/Videos");

router.post("/create-video-content", videoContentControllers.createVideo);

router.get(
  "/get-video-content/:video_content_id",
  videoContentControllers.getVideoContent
);

router.delete(
  "/delete-video-content/:video_content_id",
  videoContentControllers.deleteVideoById
);

module.exports = router;
