const express = require("express");

const router = express.Router();

const commentsControllers = require("../controllers/Comments");

router.post("/add-comment/:general_content_id", commentsControllers.addComment);

router.delete(
  "/delete-comment/:general_content_id/:comment_id",
  commentsControllers.deleteComment
);

router.get(
  "/get-general-content-comments/:general_content_id",
  commentsControllers.getCommentsForGeneralContent
);

router.put(
  "/update-comment/:general_content_id/:comment_id",
  commentsControllers.updateComment
);

module.exports = router;
