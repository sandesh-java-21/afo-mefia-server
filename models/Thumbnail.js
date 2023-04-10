const mongoose = require("mongoose");

const thumbnailSchema = mongoose.Schema({
  general_content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "general_content",
  },
  thumbnail_id: {
    type: String,
    required: false,
    default: "",
  },
  static_thumbnail_url: {
    type: String,
    required: false,
    default: "",
  },
  motion_thumbnail_url: {
    type: String,
    required: false,
    default: "",
  },
  banner_thumbnail_url: {
    type: String,
    required: false,
    default: "",
  },

  trailer_motion_url: {
    type: String,
    required: false,
    default: "",
  },

  thumbnail_type: {
    type: String,
    required: false,
    default: "",
  },

  cloudinary_public_id: {
    type: String,
    required: false,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const thumbnailModel = mongoose.model("thumbnails", thumbnailSchema);

module.exports = thumbnailModel;
