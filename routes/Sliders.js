const express = require("express");

const router = express.Router();

const Slider = require("../models/Slider");

router.post("/add-slider", async (req, res) => {
  try {
    var { page_name, movie_id, banner_url, language } = req.body;

    var sliderObj = new Slider({
      banner_url,
      page_name,
      movie: movie_id,
      language,
    });

    var savedSlider = await sliderObj.save();

    res.json({
      message: "New video added to slider!",
      status: "200",
      savedSlider,
    });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
});

router.delete("/delete-slider/:slider_id", async (req, res) => {
  try {
    var slider_id = req.params.slider_id;

    if (!slider_id) {
      res.json({
        message: "No slider found with provided id!",
        status: "404",
      });
    } else {
      var deletedSlider = await Slider.findByIdAndDelete({
        _id: slider_id,
      })
        .then((result) => {
          res.json({
            message: "Slider deleted!",
            status: "200",
          });
        })
        .catch((error) => {
          res.json({
            message: "Something went wrong while deleting slider!",
            status: "400",
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

router.get("/get-home-sliders", async (req, res) => {
  try {
    var homeSliders = await Slider.find({
      page_name: "home",
    });
    if (!homeSliders || homeSliders.length < 0) {
      res.json({
        message: "No home sliders found!",
        status: "404",
      });
    } else {
      res.json({
        message: "home Sliders found!",
        status: "200",
        homeSliders,
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
