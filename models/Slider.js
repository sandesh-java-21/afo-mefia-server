const mongoose = require("mongoose");

const sliderSchema = mongoose.Schema({
  slider_type: {
    type: String,
    required: true,
    default: "",
  },
  general_content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "general_content",
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
