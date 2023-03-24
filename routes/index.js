const express = require("express");
const router = express.Router();

const generalContentRoutes = require("../routes/GeneralContent");
const mediaRoutes = require("../routes/Media");
const thumbnailRoutes = require("./Thumbnail");
const trailerRoutes = require("../routes/Trailers");
const subtitlesRoutes = require("../routes/Subtitles");
const audioTracksRoutes = require("../routes/AudioTracks");
const signUrlsRoutes = require("../routes/SignUrl");

router.use("/general-content", generalContentRoutes);
router.use("/media", mediaRoutes);
router.use("/thumbnail", thumbnailRoutes);
router.use("/trailer", trailerRoutes);
router.use("/subtitles", subtitlesRoutes);
router.use("/audio", audioTracksRoutes);
router.use("/protection", signUrlsRoutes);

module.exports = router;
