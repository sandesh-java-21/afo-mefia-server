const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "",
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
  duration: {
    type: Number,
    required: false,
    default: 0,
  },

  banner_url: {
    type: String,
    required: false,
    default: "",
  },

  category: {
    type: String,
    required: true,
    default: "",
  },
  default_language: {
    type: String,
    required: false,
    default: "english",
  },
  release_year: {
    type: Date,
    get: (val) => val.getFullYear(),
    set: (val) => new Date(val, 0, 1),
  },
  media_id: {
    type: String,
    required: true,
    default: "",
  },
  upload_link: {
    type: String,
    required: false,
    default: "",
  },
  subtitles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subtitles",
      default: [],
    },
  ],

  audio_tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "audio_tracks",
      default: [],
    },
  ],
  video_url: {
    type: String,
    required: false,
    default: "",
  },
});

var movieModal = mongoose.model("movies", movieSchema);

module.exports = movieModal;
