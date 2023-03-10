const mongoose = require("mongoose");

const audioTracksSchema = mongoose.Schema({
  tracks_id: {
    type: String,
    required: true,
  },
  delivery_url: {
    type: String,
    required: true,
    default: "",
  },
  track_kind: {
    type: String,
    required: true,
    default: "",
  },
  language: {
    type: String,
    required: true,
    default: "",
  },
});

var audioTracksModel = mongoose.model("audio_tracks", audioTracksSchema);

module.exports = audioTracksModel;
