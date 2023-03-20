const mongoose = require("mongoose");

const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var genreModel = mongoose.model("genres", genreSchema);

module.exports = genreModel;
