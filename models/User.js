const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    default: "",
  },
  password: {
    type: String,
    required: true,
    default: "",
  },
  profile_image: {
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

  history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "histories",
    },
  ],

  tags: [
    {
      type: String,
      required: false,
      default: "",
    },
  ],
});

var userModel = mongoose.model("users", userSchema);

module.exports = userModel;
