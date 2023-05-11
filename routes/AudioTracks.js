const express = require("express");

const router = express.Router();

const Movie = require("../models/Media");
const AudioTracks = require("../models/AudioTracks");
const Media = require("../models/Media");

const audioTracksControllers = require("../controllers/AudioTracks");

const { default: axios } = require("axios");

router.post(
  "/add-audio-track/:media_object_id",
  audioTracksControllers.addAudioTrackUpdated_V2
);

router.post(
  "/add-audio-track-of-episode/:episode_id",
  audioTracksControllers.addAudioTrackForEpisode
);

router.delete(
  "/delete-audio-track/:media_object_id/:audio_track_id",
  audioTracksControllers.deletedAudioTrack
);

router.delete(
  "/delete-audio-track-of-episode/:episode_id/:audio_track_id",
  audioTracksControllers.deleteAudioTrackOfEpisode
);

router.get(
  "/get-audio-tracks-by-general-content/:general_content_id",
  audioTracksControllers.getAudioTracksByGeneralContentId
);

router.get(
  "/get-audio-tracks-by-media/:media_id",
  audioTracksControllers.getAudioTracksByGeneralMediaId
);

router.get(
  "/get-audio-tracks-by-episode/:episode_id",
  audioTracksControllers.getAudioTracksByEpisodeId
);

router.put(
  "/update-audio-track/:audio_track_id",
  audioTracksControllers.updateAudioTrack
);

module.exports = router;
