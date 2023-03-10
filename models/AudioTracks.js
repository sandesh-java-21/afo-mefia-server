const mongoose = require("mongoose");

const audioTracksSchema = mongoose.Schema({
  upload_id: {
    type: String,
    required: true,
  },
  track_id: {
    type: String,
    required: true,
    default: "",
  },
  name: {
    type: String,
    required: true,
    default: "",
  },
  type: {
    type: String,
    required: true,
    default: "",
  },
  language: {
    type: String,
    required: true,
    default: "",
  },
  language_code: {
    type: String,
    required: false,
    default: "",
  },
});

var audioTracksModel = mongoose.model("audio_tracks", audioTracksSchema);

module.exports = audioTracksModel;
