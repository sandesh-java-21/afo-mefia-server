const express = require("express");
const router = express.Router();

const generalContentRoutes = require("../routes/GeneralContent");
const mediaRoutes = require("../routes/Media");
const thumbnailRoutes = require("./Thumbnail");
const trailerRoutes = require("../routes/Trailers");
const subtitlesRoutes = require("../routes/Subtitles");
const audioTracksRoutes = require("../routes/AudioTracks");
const signUrlsRoutes = require("../routes/SignUrl");
const analyticsRoutes = require("../routes/Analytics");
const slidersRoutes = require("../routes/Sliders");
const genresRoutes = require("../routes/Genres");
const commentsRoutes = require("../routes/Comments");
const likesRoutes = require("../routes/Likes");
const usersRoutes = require("../routes/Users");
const homeRoutes = require("../routes/Home");
const videoRoutes = require("../routes/Videos");

router.use("/general-content", generalContentRoutes);
router.use("/media", mediaRoutes);
router.use("/thumbnail", thumbnailRoutes);
router.use("/trailer", trailerRoutes);
router.use("/subtitles", subtitlesRoutes);
router.use("/audio", audioTracksRoutes);
router.use("/protection", signUrlsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/sliders", slidersRoutes);
router.use("/genres", genresRoutes);
router.use("/comments", commentsRoutes);
router.use("/likes", likesRoutes);
router.use("/user", usersRoutes);
router.use("/home", homeRoutes);
router.use("/video", videoRoutes);

module.exports = router;
