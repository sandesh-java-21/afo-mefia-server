const mongoose = require("mongoose");
const tvShowSchema = mongoose.Schema({
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
  default_language: {
    type: String,
    required: false,
    default: "english",
  },
  jw_tags: [String],
  seo_tags: [String],
  release_year: {
    type: Date,
    required: false,
    // get: (val) => val.getFullYear(),
    // set: (val) => new Date(val, 0, 1),
  },
  category: {
    type: String,
    required: false,
    default: "",
  },
  genre: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "genres",
      default: [],
    },
  ],

  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "trailers",
    required: false,
  },
  status: {
    type: String,
    required: false,
    default: "",
  },
  thumbnail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "thumbnails",
    required: false,
  },
  rating: {
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
  total_likes: {
    type: Number,
    required: false,
    default: 0,
  },
  crew_members: [
    {
      member_name: {
        type: String,
        required: false,
      },
      member_role: {
        type: String,
        required: false,
      },
    },
  ],
  content_type: {
    type: String,
    required: false,
    default: "",
  },
  availability: {
    type: String,
    required: false,
    default: "",
  },

  seasons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seasons",
      default: [],
    },
  ],
  episodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "episodes",
      default: [],
    },
  ],

  monetization: {
    type: Boolean,
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var tvShowModel = mongoose.model("tv_shows", tvShowSchema);
module.exports = tvShowModel;
