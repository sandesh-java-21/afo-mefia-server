const mongoose = require("mongoose");

const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },

  genre_image: {
    url: {
      type: String,
      required: false,
      default: "",
    },
    public_id: {
      type: String,
      required: false,
      default: "",
    },
  },

  genre_type: {
    type: String,
    required: false,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

var genreModel = mongoose.model("genres", genreSchema);

module.exports = genreModel;
