const User = require("../models/User");

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");

const uploadProfileImage = async (req, res) => {
  try {
    var user_id = req.params.user_id;

    var { profileImageBase64 } = req.body;

    if (!user_id || user_id === "") {
      res.json({
        message: "Please provide user id!",
        status: "400",
      });
    } else {
      var user = await User.findById({
        _id: user_id,
      })
        .then(async (onUserFound) => {
          var userObj = onUserFound;

          cloudinary.config(cloudinaryConfigObj);

          cloudinary.uploader
            .upload(profileImageBase64, {
              folder: "user-profile",
              use_filename: true,
            })
            .then(async (result) => {
              console.log("cloudinary result : ", result);

              var publicId = result.public_id;
              var secure_url = result.secure_url;

              var updateData = {
                profile_image: {
                  public_id: publicId,
                  url: secure_url,
                },
              };

              var filter = {
                _id: userObj._id,
              };

              var updatedUser = await User.findByIdAndUpdate(
                filter,
                updateData,
                {
                  new: true,
                }
              )
                .then(async (onUserUpdate) => {
                  console.log("on user profile upload:  ", onUserUpdate);
                  res.json({
                    message: "User profile picture uploaded successfully!",
                    status: "200",
                    updatedUser: onUserUpdate,
                    profile_image: secure_url,
                  });
                })
                .catch(async (onUserUpdateError) => {
                  console.log("on user update error: ", onUserUpdateError);
                  res.json({
                    message:
                      "Something went wrong while uploading profile picture!",
                    status: "400",
                    error: onUserUpdateError,
                  });
                });
            })
            .catch(async (onCloudinaryError) => {
              console.log("on cloudinary error: ", onCloudinaryError);
              res.json({
                message:
                  "Something went wrong while uploading profile picture!",
                status: "400",
                error: onCloudinaryError,
              });
            });
        })
        .catch((onUserNotFound) => {
          console.log("on user not found!");
          res.json({
            message: "No user found with provided id!",
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

const updateProfilePicture = async (req, res) => {
  try {
    var user_id = req.params.user_id;

    var { profileImageBase64 } = req.body;

    if (!user_id || user_id === "") {
      res.json({
        message: "Please provide user id!",
        status: "400",
      });
    } else {
      var user = await User.findById({
        _id: user_id,
      })
        .then(async (onUserFound) => {
          var userObj = onUserFound;

          cloudinary.config(cloudinaryConfigObj);

          // work will added here!

          console.log(
            "url and public id: ",
            userObj.profile_image.url,
            userObj.profile_image.public_id
          );

          cloudinary.uploader
            .destroy(userObj.profile_image.public_id)
            .then(async (onCloudinaryProfileDelete) => {
              console.log(
                "cloudinary delete success: ",
                onCloudinaryProfileDelete
              );

              cloudinary.uploader
                .upload(profileImageBase64, {
                  folder: "user-profile",
                  use_filename: true,
                })
                .then(async (result) => {
                  console.log("cloudinary result : ", result);

                  var publicId = result.public_id;
                  var secure_url = result.secure_url;

                  var updateData = {
                    profile_image: {
                      public_id: publicId,
                      url: secure_url,
                    },
                  };

                  var filter = {
                    _id: userObj._id,
                  };

                  var updatedUser = await User.findByIdAndUpdate(
                    filter,
                    updateData,
                    {
                      new: true,
                    }
                  )
                    .then(async (onUserUpdate) => {
                      console.log("on user profile upload:  ", onUserUpdate);
                      res.json({
                        message: "User profile picture uploaded successfully!",
                        status: "200",
                        updatedUser: onUserUpdate,
                        profile_image: secure_url,
                      });
                    })
                    .catch(async (onUserUpdateError) => {
                      console.log("on user update error: ", onUserUpdateError);
                      res.json({
                        message:
                          "Something went wrong while uploading profile picture!",
                        status: "400",
                        error: onUserUpdateError,
                      });
                    });
                })
                .catch(async (onCloudinaryError) => {
                  console.log("on cloudinary error: ", onCloudinaryError);
                  res.json({
                    message:
                      "Something went wrong while uploading profile picture!",
                    status: "400",
                    error: onCloudinaryError,
                  });
                });
            })
            .catch(async (onCloudinaryProfileDeleteError) => {
              console.log(
                "on cloudinary delete error: ",
                onCloudinaryProfileDeleteError
              );
              res.json({
                message:
                  "Something went wrong while updating profile picture! please try again!",
                status: "400",
                error: onCloudinaryProfileDeleteError,
              });
            });

          //   cloudinary.uploader
          //     .upload(profileImageBase64)
          //     .then(async (result) => {
          //       console.log("cloudinary result : ", result);

          //       var publicId = result.public_id;
          //       var secure_url = result.secure_url;

          //       var updateData = {
          //         profile_image: {
          //           public_id: publicId,
          //           url: secure_url,
          //         },
          //       };

          //       var filter = {
          //         _id: userObj._id,
          //       };

          //       var updatedUser = await User.findByIdAndUpdate(
          //         filter,
          //         updateData,
          //         {
          //           new: true,
          //         }
          //       )
          //         .then(async (onUserUpdate) => {
          //           console.log("on user profile upload:  ", onUserUpdate);
          //           res.json({
          //             message: "User profile picture uploaded successfully!",
          //             status: "200",
          //             updatedUser: onUserUpdate,
          //             profile_image: secure_url,
          //           });
          //         })
          //         .catch(async (onUserUpdateError) => {
          //           console.log("on user update error: ", onUserUpdateError);
          //           res.json({
          //             message:
          //               "Something went wrong while uploading profile picture!",
          //             status: "400",
          //             error: onUserUpdateError,
          //           });
          //         });
          //     })
          //     .catch(async (onCloudinaryError) => {
          //       console.log("on cloudinary error: ", onCloudinaryError);
          //       res.json({
          //         message:
          //           "Something went wrong while uploading profile picture!",
          //         status: "400",
          //         error: onCloudinaryError,
          //       });
          //     });
        })
        .catch((onUserNotFound) => {
          console.log("on user not found!");
          res.json({
            message: "No user found with provided id!",
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
  uploadProfileImage,
  updateProfilePicture,
};
