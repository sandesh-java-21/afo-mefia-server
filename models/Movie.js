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

  thumbnail_url: {
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
});
