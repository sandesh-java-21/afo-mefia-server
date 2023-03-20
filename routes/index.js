const express = require("express");
const router = express.Router();

const generalContentRoutes = require("../routes/GeneralContent");
const mediaRoutes = require("../routes/Media");
const thumbnailRoutes = require("./Thumbnail");
const trailerRoutes = require("../routes/Trailers");
const subtitlesRoutes = require("../routes/Subtitles");
const audioTracksRoutes = require("../routes/AudioTracks");

router.use("/general-content", generalContentRoutes);
router.use("/media", mediaRoutes);
router.use("/thumbnail", thumbnailRoutes);
router.use("/trailer", trailerRoutes);
router.use("/subtitles", subtitlesRoutes);
router.use("/audio", audioTracksRoutes);

module.exports = router;
