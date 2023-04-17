const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  media: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "medias",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "users",
  },
});

var historyModel = mongoose.model("histories", historySchema);

module.exports = historyModel;
