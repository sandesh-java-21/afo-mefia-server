const mongoose = require("mongoose");

const audioTracksSchema = mongoose.Schema({
  original_id: {
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

  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "medias",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var audioTracksModel = mongoose.model("audio_tracks", audioTracksSchema);

module.exports = audioTracksModel;
