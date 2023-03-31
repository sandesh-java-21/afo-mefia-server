const Favorite = require("../models/Favorites");

const addToFavorite = async (req, res) => {
  try {
    var user_id = req.params.user_id;
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  addToFavorite,
};
