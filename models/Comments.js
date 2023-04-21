const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const commentModel = mongoose.model("comments", commentsSchema);

module.exports = commentModel;
