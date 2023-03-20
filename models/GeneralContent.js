const mongoose = require("mongoose");

const generalContentSchema = mongoose.Schema({
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "medias",
    required: true,
    default: "",
  },
  category: {
    type: String,
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var generalContentModel = mongoose.model(
  "general_content",
  generalContentSchema
);

module.exports = generalContentModel;
