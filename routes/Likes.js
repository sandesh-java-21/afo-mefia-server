const express = require("express");

const router = express.Router();

const likesControllers = require("../controllers/Likes");

router.post(
  "/like-general-content/:general_content_id",
  likesControllers.likeGeneralContent
);

router.post(
  "/dis-like-general-content/:general_content_id",
  likesControllers.disLikeGeneralContent
);

module.exports = router;
