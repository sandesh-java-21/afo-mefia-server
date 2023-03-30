const Comment = require("../models/Comments");
const GeneralContent = require("../models/GeneralContent");

const addComment = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    var { comment, user_id } = req.body;

    var generalContent = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (onGcFound) => {
        console.log("Found gc: ", onGcFound);
        var generalContentObj = onGcFound;

        var commentObj = new Comment({
          Comment: comment,
          user: user_id,
        });

        var savedComment = await commentObj.save();
        var filter = {
          _id: onGcFound._id,
        };

        var updatedGc = await GeneralContent.findByIdAndUpdate(
          filter,
          {
            $push: { comments: savedComment._id },
          },
          {
            new: true,
          }
        )

          .then((onGcUpdate) => {
            res.json({
              message: "New comment added!",
              status: "200",
              savedComment,
              updatedGc: onGcUpdate,
            });
          })
          .catch((error) => {
            console.log("database update error: ", error);
            res.json({
              message:
                "Something went wrong while adding comment to the general content!",
              status: "400",
              error,
            });
          });
      })
      .catch((onGcNotFound) => {
        console.log("gc not found: ", onGcNotFound);
        res.json({
          message: "General content not found with provided id!",
          status: "404",
          error,
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

const deleteComment = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    var comment_id = req.params.comment_id;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (onGcFound) => {
        var generalContentObj = onGcFound;

        var comment = await Comment.findById({
          _id: comment_id,
        })
          .then(async (onCommentFound) => {
            console.log("comment found!", onCommentFound);

            var filter = {
              _id: generalContentObj._id,
            };
            var updatedGc = Media.updateOne(
              filter,
              {
                $pull: {
                  comments: comment._id,
                },
              },
              {
                new: true,
              }
            )
              .then(async (onGcUpdate) => {
                console.log("comment removed from gc: ", onGcUpdate);

                var deletedComment = await Comment.findByIdAndDelete({
                  _id: comment._id,
                })
                  .then(async (onCommentDelete) => {
                    console.log("comment deleted!");
                    res.json({
                      message: "Comment deleted!",
                      status: "200",
                    });
                  })
                  .catch((onNotCommentDelete) => {
                    console.log("something went wrong while deleting comment!");
                    res.json({
                      message: "Something went wrong while deleting comment!",
                      status: "400",
                      error: onNotCommentDelete,
                    });
                  });
              })
              .catch((onNotGcUpdate) => {
                console.log("gc not updated error: ", onNotGcUpdate);
                res.json({
                  message: "Something went wrong while deleting comment!",
                  status: "400",
                  error: onNotGcUpdate,
                });
              });
          })
          .catch((onCommentNotFound) => {
            console.log(
              "comment not found with provided comment id!",
              onCommentNotFound
            );
            res.json({
              message: "Comment not found!",
              status: "404",
              error: onCommentNotFound,
            });
          });
      })
      .catch((onGcNotFound) => {
        console.log(
          "general content not found with provided id !",
          onGcNotFound
        );
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

const getCommentsForGeneralContent = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })
      .populate("comments")
      .then(async (onGcFound) => {
        console.log * ("gc found: ", onGcFound);
        res.json({
          message: "Comment found!",
          status: "200",
          comments: general_content.comments,
        });
      })
      .catch((onGcNotFound) => {
        console.log("on gc not found error: ", onGcNotFound);
        res.json({
          message: "General content not found with provided id!",
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
};

module.exports = {
  addComment,
  deleteComment,
  getCommentsForGeneralContent,
};
