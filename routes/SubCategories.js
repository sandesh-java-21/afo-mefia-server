const express = require("express");

const router = express.Router();

const SubCategory = require("../models/SubCategory");

router.get("/get-sub-category/:id", async (req, res) => {
  try {
    var sub_category_id = req.params.id;
    var subCategory = await SubCategory.findById({
      _id: sub_category_id,
    })

      .then((result) => {
        res.json({
          message: "Sub category found!",
          status: "200",
          subCategory: result,
        });
      })
      .catch((error) => {
        res.json({
          message: "No sub category found!",
          status: "404",
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

router.post("/add-sub-category", async (req, res) => {
  try {
    var { name } = req.body;
    var existingSubCategory = SubCategory.findOne({
      name: name,
    });

    if (existingSubCategory) {
      res.json({
        message: `${name} sub category already exists!`,
        status: "409",
        subCategoryFound: true,
      });
    } else {
      var subCategoryObj = new SubCategory({
        name: name,
      });

      var savedSubCategory = await subCategoryObj.save();

      res.json({
        message: "New sub category created!",
        status: "200",
        savedSubCategory,
      });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

router.delete("/delete-sub-category/:id", async (req, res) => {
  try {
    var sub_category_id = req.params.id;

    var subCategory = await SubCategory.findByIdAndDelete({
      _id: sub_category_id,
    })
      .then((result) => {
        res.json({
          message: "Sub category deleted!",
          status: "200",
          subCategoryDeleted: true,
          subCategoryFound: true,
        });
      })
      .catch((error) => {
        res.json({
          message: "No sub category found with provided id!",
          status: "404",
          subCategoryDeleted: false,
          subCategoryFound: false,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

router.put("/update-sub-category/:id", async (req, res) => {
  try {
    var sub_category_id = req.params.id;
    var { name } = req.body;

    if (!sub_category_id || sub_category_id === "") {
      res.json({
        message: "No sub category found with provided id!",
        status: "404",
        subCategoryUpdated: false,
        subCategoryFound: false,
      });
    } else {
      var filter = {
        _id: sub_category_id,
      };
      var updateData = {
        name: name,
      };
      var updatedSubCategory = await SubCategory.findByIdAndUpdate(
        filter,
        updateData,
        {
          new: true,
        }
      )
        .then((result) => {
          res.json({
            message: "Sub category updated!",
            status: "200",
            subCategoryUpdated: true,
            subCategoryFound: true,
          });
        })
        .catch((error) => {
          res.json({
            message: "No sub category found with provided id!",
            status: "404",
            subCategoryUpdated: false,
            subCategoryFound: false,
            error,
          });
        });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

router.get("/get-all-sub-categories", async (req, res) => {
  try {
    var allSubCategories = await SubCategory.find();
    if (!allSubCategories || allSubCategories.length <= 0) {
      res.json({
        message: "No sub categories found!",
        status: "404",
        subCategoriesFound: false,
      });
    } else {
      res.json({
        message: "Sub categories found!",
        status: "200",
        subCategoriesFound: true,
        allSubCategories,
      });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

module.exports = router;
