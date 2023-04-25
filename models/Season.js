const mongoose = require("mongoose");

const seasonSchema = mongoose.Schema({
  tv_show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tv_shows",
    required: false,
  },
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "trailers",
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
  episodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "episodes",
      default: [],
    },
  ],
});

const seasonModel = mongoose.model("seasons", seasonSchema);

module.exports = seasonModel;
