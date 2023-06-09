const mongoose = require("mongoose");

const subtitlessSchema = mongoose.Schema({
  track_id: {
    type: String,
    required: false,
  },
  delivery_url: {
    type: String,
    required: false,
    default: "",
  },
  track_kind: {
    type: String,
    required: false,
    default: "",
  },
  language: {
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

var subtitlesModel = mongoose.model("subtitles", subtitlessSchema);

module.exports = subtitlesModel;
