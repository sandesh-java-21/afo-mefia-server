const GeneralContent = require("../models/GeneralContent");

const likeGeneralContent = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (onGcFound) => {
        console.log("gc found: ", onGcFound);

        var general_content_obj = onGcFound;

        var updatedCount = general_content_obj.total_likes + 1;

        var filter = {
          _id: general_content_obj._id,
        };

        var updateData = {
          total_likes: updatedCount,
        };

        var updatedGc = await GeneralContent.findByIdAndUpdate(
          filter,
          updateData,
          { new: true }
        )
          .then(async (onGcUpdate) => {
            console.log("gc liked: ", onGcUpdate);
            res.json({
              message: "You liked this general content!",
              status: "200",
              updatedGc: onGcUpdate,
              total_likes: onGcUpdate.total_likes,
            });
          })
          .catch((onNotGcUpdate) => {
            console.log("not liked error: ", onNotGcUpdate);

            res.json({
              message:
                "Something went wrong while liking this general content!",
              status: "400",
              error: onNotGcUpdate,
            });
          });
      })
      .catch((onGcNotFound) => {
        console.log("gc not found: ", onGcNotFound);
        res.json({
          message: "General content not found!",
          status: "404",
          error: onGcNotFound,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const disLikeGeneralContent = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (onGcFound) => {
        console.log("gc found: ", onGcFound);

        var general_content_obj = onGcFound;

        var updatedCount = general_content_obj.total_likes - 1;

        var filter = {
          _id: general_content_obj._id,
        };

        var updateData = {
          total_likes: updatedCount,
        };

        var updatedGc = await GeneralContent.findByIdAndUpdate(
          filter,
          updateData,
          { new: true }
        )
          .then(async (onGcUpdate) => {
            console.log("gc liked: ", onGcUpdate);
            res.json({
              message: "You dis liked this general content!",
              status: "200",
              updatedGc: onGcUpdate,
              total_likes: onGcUpdate.total_likes,
            });
          })
          .catch((onNotGcUpdate) => {
            console.log("not liked error: ", onNotGcUpdate);

            res.json({
              message:
                "Something went wrong while dis liking this general content!",
              status: "400",
              error: onNotGcUpdate,
            });
          });
      })
      .catch((onGcNotFound) => {
        console.log("gc not found: ", onGcNotFound);
        res.json({
          message: "General content not found!",
          status: "404",
          error: onGcNotFound,
        });
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  likeGeneralContent,
  disLikeGeneralContent,
};
