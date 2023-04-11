const mongoose = require("mongoose");

const videoSchema = mongoose.Schema({
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "medias",
    required: true,
    default: "",
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var videoModel = mongoose.model("videos", videoSchema);

module.exports = videoModel;
