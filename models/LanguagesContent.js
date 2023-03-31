const mongoose = require("mongoose");

const languagesContentSchema = mongoose.Schema({
  title_translated: {
    type: String,
    required: false,
    default: "",
  },
  description_translated: {
    type: String,
    required: false,
    default: "",
  },
  language_type: {
    type: String,
    required: false,
    default: "",
  },

  language_code: {
    type: String,
    required: false,
    default: "",
  },
});

var languagesContentModel = mongoose.model(
  "languages_content",
  languagesContentSchema
);

module.exports = languagesContentModel;
