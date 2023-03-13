const mongoose = require("mongoose");

const thumbnailSchema = mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "movies",
  },
  static_url: {
    type: String,
    require: true,
    default: "",
  },
  motion_url: {
    type: String,
    require: true,
    default: "",
  },
});

const thumbnailModel = mongoose.model("thumbnails", thumbnailSchema);

module.exports = thumbnailModel;
