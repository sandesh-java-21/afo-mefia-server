const express = require("express");

const router = express.Router();

const Slider = require("../models/Slider");

const sliderControllers = require("../controllers/Sliders");

router.post("/add-slider-item", sliderControllers.addGeneralContentToSlider);

router.get(
  "/get-slider-by-slider-type/:slider_type",
  sliderControllers.getSliderBySliderType
);

router.delete(
  "/delete-slider-item-by-id/:id",
  sliderControllers.deleteSliderById
);

module.exports = router;
