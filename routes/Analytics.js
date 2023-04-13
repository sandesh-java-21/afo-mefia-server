const express = require("express");

const router = express.Router();

const analyticsControllers = require("../controllers/Analytics");

router.post(
  "/get-analysis-for-media",
  analyticsControllers.getAnalysisForMediaIds
);

router.post(
  "/get-analysis-for-tags",
  analyticsControllers.getAnalysisForTagsUpdated_V2
);

router.post(
  "/get-analysis-for-this-and-last-month",
  analyticsControllers.getAnalysisForTagsThisAndLastMonth
);

module.exports = router;
