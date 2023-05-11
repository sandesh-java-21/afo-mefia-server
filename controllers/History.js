const History = require("../models/History");
const User = require("../models/User");

const addToHistory = async (req, res) => {
  try {
    var user_id = req.params.user_id;
    var { general_content_id } = req.body;

    if (!user_id || user_id === "" || !general_content_id || general_content_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var user = await User.findById(user_id)
        .then(async (onUserFound) => {
          console.log("on user found: ", onUserFound);

          var history = new History({
            general_content: general_content_id,
            user: onUserFound._id,
          });

          var savedHistory = await history
            .save()
            .then(async (onHistorySave) => {
              console.log("on history save: ", onHistorySave);

              var filter = {
                _id: onUserFound._id,
              };

              var updatedUser = await User.findByIdAndUpdate(
                filter,
                {
                  $push: { history: onHistorySave._id },
                },
                {
                  new: true,
                }
              )
                .then(async (onUserUpdate) => {
                  console.log("on user update: ", onUserUpdate);
                  res.json({
                    message: "Media added to your history!",
                    status: "200",
                    savedHistory: onHistorySave,
                    updatedUser: onUserUpdate,
                  });
                })
                .catch(async (onUserNotUpdate) => {
                  console.log("on user not update: ", onUserNotUpdate);
                  res.json({
                    message:
                      "Something went wrong while adding media to history!",
                    status: "400",
                    error: onUserNotUpdate,
                  });
                });
            })
            .catch(async (onHistoryNotSave) => {
              console.log("on history not save: ", onHistoryNotSave);
              res.json({
                message: "Something went wrong while adding media to history!",
                status: "400",
                error: onHistoryNotSave,
              });
            });
        })
        .catch(async (onUserNotFound) => {
          console.log("on user not found: ", onUserNotFound);
          res.json({
            message: "User not found with provided id!",
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
  addToHistory,
};
