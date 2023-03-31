const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    default: null,
  },

  general_content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "general_contents",
    required: true,
    default: null,
  },
});

var favoriteModel = mongoose.model("favorites", favoriteSchema);

module.exports = favoriteModel;
