const mongoose = require("mongoose");

const watchListSchema = mongoose.Schema({
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

var watchListModel = mongoose.model("watch_lists", watchListSchema);

module.exports = watchListModel;
