const GeneralContent = require("../models/GeneralContent");
const Video = require("../models/Video");
const TvShow = require("../models/TvShow");

const addCrewMembersMovie = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    var { crew_members } = req.body;

    var general_content = await GeneralContent.findById(general_content_id)
      .then(async (onGcFound) => {
        console.log("on gc found: ", onGcFound);

        var updated = await GeneralContent.findByIdAndUpdate(
          onGcFound._id,
          { $push: { crew_members: { $each: crew_members } } },
          { new: true }
        )
          .then(async (onGcUpdate) => {
            console.log("on gc update: ", onGcUpdate);

            res.json({
              message: "Crew members added!",
              status: "200",
              updatedGeneralContent: onGcUpdate,
            });
          })
          .catch(async (onGcNotUpdate) => {
            console.log("on gc not update: ", onGcNotUpdate);
            res.json({
              message: "Something went wrong while updating general content!",
              status: "400",
              error: onGcNotUpdate,
            });
          });
      })
      .catch(async (onGcNotFound) => {
        console.log("on gc not found: ", onGcNotFound);
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

const addCrewMembersVideo = async (req, res) => {
  try {
    var video_content_id = req.params.video_content_id;
    var { crew_members } = req.body;

    var video_content = await Video.findById(video_content_id)
      .then(async (onGcFound) => {
        console.log("on vc found: ", onGcFound);

        var updated = await Video.findByIdAndUpdate(
          onGcFound._id,
          { $push: { crew_members: { $each: crew_members } } },
          { new: true }
        )
          .then(async (onGcUpdate) => {
            console.log("on vc update: ", onGcUpdate);

            res.json({
              message: "Crew members added!",
              status: "200",
              updatedVideoContent: onGcUpdate,
            });
          })
          .catch(async (onGcNotUpdate) => {
            console.log("on vc not update: ", onGcNotUpdate);
            res.json({
              message: "Something went wrong while updating video content!",
              status: "400",
              error: onGcNotUpdate,
            });
          });
      })
      .catch(async (onGcNotFound) => {
        console.log("on gc not found: ", onGcNotFound);
        res.json({
          message: "Video not found!",
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

const addCrewMembersTvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;
    var { crew_members } = req.body;

    var tv_show_content = await TvShow.findById(tv_show_id)
      .then(async (onTvFound) => {
        console.log("on tv found: ", onTvFound);

        var updated = await TvShow.findByIdAndUpdate(
          onTvFound._id,
          { $push: { crew_members: { $each: crew_members } } },
          { new: true }
        )
          .then(async (onTvUpdate) => {
            console.log("on tv update: ", onTvUpdate);

            res.json({
              message: "Crew members added!",
              status: "200",
              updatedTvShow: onTvUpdate,
            });
          })
          .catch(async (onGcNotUpdate) => {
            console.log("on vc not update: ", onGcNotUpdate);
            res.json({
              message: "Something went wrong while updating video content!",
              status: "400",
              error: onGcNotUpdate,
            });
          });
      })
      .catch(async (onGcNotFound) => {
        console.log("on gc not found: ", onGcNotFound);
        res.json({
          message: "Video not found!",
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
  addCrewMembersMovie,
  addCrewMembersVideo,
  addCrewMembersTvShow,
};
