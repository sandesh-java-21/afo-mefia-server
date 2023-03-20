const mongoose = require("mongoose");

const trailerSchema = mongoose.Schema({
  media_id: {
    type: String,
    required: false,
    default: "",
  },
  audio_tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "audio_tracks",
      default: [],
    },
  ],

  subtitles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subtitles",
      default: [],
    },
  ],
  type: {
    type: String,
    required: false,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var trailerModel = mongoose.model("trailers", trailerSchema);

module.exports = trailerModel;
