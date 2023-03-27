const Slider = require("../models/Slider");

const addGeneralContentToSlider = async (req, res) => {
  try {
    var { general_content_id, slider_type } = req.body;

    if (
      !general_content_id ||
      general_content_id === "" ||
      !slider_type ||
      slider_type === ""
    ) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var sliderObj = new Slider({
        general_content: general_content_id,
        slider_type: slider_type,
      });

      var savedSlider = sliderObj
        .save()
        .then((onSliderAdded) => {
          res.json({
            message: "New slider item added!",
            status: "200",
            savedSliderItem: onSliderAdded,
          });
        })

        .catch((error) => {
          res.json({
            message: "Something went wrong while adding this time to slider!",
            status: "400",
            savedSlider: null,
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
};

const deleteSliderById = async (req, res) => {
  try {
    var _id = req.params.id;

    if (!_id || _id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var slider = await Slider.findById({
        _id: _id,
      });

      if (!slider) {
        res.json({
          message: "No slider item found with provided id!",
          status: "404",
        });
      } else {
        var deletedSlider = await Slider.findByIdAndDelete({
          _id: slider._id,
        })

          .then((result) => {
            res.json({
              message: "Slider item deleted!",
              status: "200",
            });
          })
          .catch((error) => {
            res.json({
              message: "Something went wrong while deleting slider item!",
              status: "400",
              error,
            });
          });
      }
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getSliderBySliderType = async (req, res) => {
  try {
    var slider_type = req.params.slider_type;

    if (!slider_type || slider_type === "") {
      res.json({
        message: `Required fields are empty!`,
        status: "400",
      });
    } else {
      var allSliders = await Slider.find({
        slider_type: slider_type,
      });

      if (!allSliders || allSliders.length <= 0) {
        res.json({
          message: "No sliders found for the provided slider type!",
          status: "404",
          allSliders: [],
        });
      } else {
        res.json({
          message: "Slider items found!",
          status: "200",
          allSliders,
        });
      }
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  addGeneralContentToSlider,
  deleteSliderById,
  getSliderBySliderType,
};
