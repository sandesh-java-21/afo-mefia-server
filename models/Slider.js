const mongoose = require("mongoose");

const sliderSchema = mongoose.Schema({
  banner_url: {
    type: String,
    required: true,
    default: "",
  },
  page_name: {
    type: String,
    required: true,
    default: "",
  },

  language: {
    type: String,
    required: true,
    default: "",
  },

  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "movies",
    required: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var sliderModel = mongoose.model("sliders", sliderSchema);

module.exports = sliderModel;
