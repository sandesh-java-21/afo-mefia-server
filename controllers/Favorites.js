const Favorite = require("../models/Favorites");
const User = require("../models/User");

const addToFavorite = async (req, res) => {
  try {
    var user_id = req.params.user_id;

    var { general_content_id } = req.body;

    if (
      !user_id ||
      user_id === "" ||
      !general_content_id ||
      general_content_id === ""
    ) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var user = await User.findById(user_id)
        .then(async (onUserFound) => {
          console.log(" on user found: ", onUserFound);

          var favorite = new Favorite({
            general_content: general_content_id,
            user: onUserFound._id,
          });

          var savedFavorite = await favorite
            .save()
            .then(async (onFavoriteSave) => {
              console.log("on favorite save: ", onFavoriteSave);

              var filter = {
                _id: onUserFound._id,
              };

              var updatedUser = await User.findByIdAndUpdate(filter, {
                $push: { favorites: onFavoriteSave._id },
              })
                .then(async (onUserUpdate) => {
                  console.log("on user update: ", onUserUpdate);
                  res.json({
                    message: "Media added to your favorites!",
                    status: "200",
                    savedFavorite: onFavoriteSave,
                    updatedUser: onUserUpdate,
                  });
                })
                .catch(async (onUserUpdateError) => {
                  console.log("on user update error: ", onUserUpdateError);
                  res.json({
                    message:
                      "Something went wrong while adding media in your favorites!",
                    status: "400",
                    error: onUserUpdateError,
                  });
                });
            })
            .catch(async (onFavoriteSaveError) => {
              console.log("on favorite save error: ", onFavoriteSaveError);
              res.json({
                message:
                  "Something went wrong while adding media in your favorites!",
                status: "400",
                error: onFavoriteSaveError,
              });
            });
        })
        .catch(async (onUserNotFound) => {
          console.log("on user not found: ", onUserNotFound);
          res.json({
            message: "User not found!",
            status: "404",
            error: onUserNotFound,
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

module.exports = {
  addToFavorite,
};
