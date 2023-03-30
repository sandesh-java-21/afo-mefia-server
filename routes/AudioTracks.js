const express = require("express");

const router = express.Router();

const Movie = require("../models/Media");
const AudioTracks = require("../models/AudioTracks");
const Media = require("../models/Media");

const audioTracksControllers = require("../controllers/AudioTracks");

const { default: axios } = require("axios");

router.post(
  "/add-audio-track/:media_object_id",
  audioTracksControllers.addAudioTrack
);

router.delete(
  "/delete-audio-track/:media_object_id/:audio_track_id",
  audioTracksControllers.deletedAudioTrack
);

router.get(
  "/get-audio-tracks-by-general-content/:general_content_id",
  audioTracksControllers.getAudioTracksByGeneralContentId
);

router.get(
  "/get-audio-tracks-by-media/:media_id",
  audioTracksControllers.getAudioTracksByGeneralMediaId
);

router.put(
  "/update-audio-track/:audio_track_id",
  audioTracksControllers.updateAudioTrack
);

module.exports = router;
