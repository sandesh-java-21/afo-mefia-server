const express = require("express");
const router = express.Router();

const videoContentControllers = require("../controllers/Videos");
const crewMembersControllers = require("../controllers/Crew");

router.post(
  "/create-video-content",
  videoContentControllers.createVideoUpdated
);

router.get(
  "/get-video-content/:video_content_id",
  videoContentControllers.getVideoContent
);

router.get("/get-video-list", videoContentControllers.getVideoList);

router.delete(
  "/delete-video-content/:video_content_id",
  videoContentControllers.deleteVideoContentByIdUpdated
);

router.put(
  "/add-crew-members/:video_content_id",
  crewMembersControllers.addCrewMembersVideo
);

router.put(
  "/upload-media-id/:media_Obj_Id",
  videoContentControllers.uploadMediaId
);

module.exports = router;
