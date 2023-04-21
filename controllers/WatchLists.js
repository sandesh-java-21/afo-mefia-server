const User = require("../models/User");

const WatchList = require("../models/WatchList");

const addToWatchList = async (req, res) => {
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

          var watch_list = new WatchList({
            general_content: general_content_id,
            user: onUserFound._id,
          });

          var savedWatchList = await watch_list
            .save()
            .then(async (onWatchListSave) => {
              console.log("on watch list save: ", onWatchListSave);

              var filter = {
                _id: onUserFound._id,
              };

              var updatedUser = await User.findByIdAndUpdate(filter, {
                $push: { watch_list: onWatchListSave._id },
              })
                .then(async (onUserUpdate) => {
                  console.log("on user update: ", onUserUpdate);
                  res.json({
                    message: "Media added to your favorites!",
                    status: "200",
                    savedWatchListItem: onWatchListSave,
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
            .catch(async (onWatchListSaveError) => {
              console.log("on watch list save error: ", onWatchListSaveError);
              res.json({
                message:
                  "Something went wrong while adding media in your favorites!",
                status: "400",
                error: onWatchListSaveError,
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
  addToWatchList,
};
