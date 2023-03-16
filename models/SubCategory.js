const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
});

var subCategoryModel = mongoose.model("sub_categories", subCategorySchema);

module.exports = subCategoryModel;
