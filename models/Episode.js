const mongoose = require("mongoose");

const episodeSchema = mongoose.Schema({
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
  thumbnail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "thumbnails",
    required: false,
  },
  likes: {
    type: Number,
    required: false,
    default: 0,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  tv_show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tv_shows",
  },
  season: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons",
  },
});

var episodeModal = mongoose.model("episodes", episodeSchema);

module.exports = episodeModal;
