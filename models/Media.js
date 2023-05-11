const mongoose = require("mongoose");

const mediaSchema = mongoose.Schema({
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
  default_language: {
    type: String,
    required: false,
    default: "english",
  },
  release_year: {
    type: Date,
    required: false,
    // get: (val) => val.getFullYear(),
    // set: (val) => new Date(val, 0, 1),
  },
  media_id: {
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

  jw_tags: [String],
  seo_tags: [String],
  translated_content: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages_content",
      default: [],
    },
  ],
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
  monetization: {
    type: Boolean,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var mediaModal = mongoose.model("medias", mediaSchema);

module.exports = mediaModal;
