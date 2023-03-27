const AudioTracks = require("../models/AudioTracks");
const Media = require("../models/Media");
const GeneralContent = require("../models/GeneralContent");

const axios = require("axios");

const addAudioTrack = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var { download_url, name, type, language, language_code } = req.body;

    var mediaObj = await Media.findById({
      _id: media_object_id,
    });

    if (!media_object_id || media_object_id === "") {
      res.json({
        message: "Required fields are empty, Please provide media id!",
        status: "404",
      });
    } else if (!mediaObj) {
      res.json({
        message: "No media found with provided id!",
        status: "404",
      });
    } else {
      var media_id = mediaObj.media_id;
      var site_id = process.env.SITE_ID;

      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        upload: {
          method: "fetch",
          download_url: `${download_url}`,
        },
        metadata: {
          name: `${name}`,
          type: `${type}`,
          language: `${language}`,
          language_code: `${language_code}`,
        },
      };

      var apiResponse = await axios
        .post(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (result) => {
          console.log("JW API Success: ", result.data);
          var { id } = result.data;
          var { name, type, language, language_code } = result.data.metadata;

          var audioTrack = new AudioTracks({
            original_id: id,
            name,
            type,
            language,
            language_code,
            media: mediaObj._id,
          });

          var savedAudioTrack = await audioTrack.save();
          var filter = {
            _id: mediaObj._id,
          };

          var updatedMedia = await Media.findByIdAndUpdate(
            filter,
            {
              $push: { audio_tracks: savedAudioTrack._id },
            },
            {
              new: true,
            }
          )
            .then((result) => {
              res.json({
                message: "Audio track added!",
                status: "200",
                savedAudioTrack,
                updatedMedia: result,
              });
            })
            .catch((error) => {
              console.log("Database Error: ", error);
              res.json({
                message: "Error Occurred while updating the database!",
                status: "400",
                error,
              });
            });
        })

        .catch((error) => {
          console.log("JW API Error: ", error);
          res.json({
            message: "Something went wrong!",
            status: "400",
            error,
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

const deletedAudioTrack = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var audio_track_id = req.params.audio_track_id;

    if (!media_object_id || media_object_id === "") {
      res.json({
        message: "Required fields are empty, please provide a movie id!",
        status: "400",
      });
    } else {
      var mediaObj = await Media.findById({
        _id: media_object_id,
      });

      if (!mediaObj) {
        res.json({
          message: "No media found with provided media id!",
          status: "404",
        });
      } else {
        var site_id = process.env.SITE_ID;
        var media_id = mediaObj.media_id;

        var audioTrack = await AudioTracks.findOne({
          _id: audio_track_id,
        });
        if (!audioTrack) {
          res.json({
            message: "No audio track found with provided media id!",
            status: "404",
          });
        } else {
          var original_id = audioTrack.original_id;
          var headers = {
            Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
          };
          var apiResponse = await axios
            .delete(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/originals/${original_id}/`,
              {
                headers: headers,
              }
            )
            .then(async (result) => {
              console.log("JW API Success: ", result.data);

              var updatedMedia = Media.updateOne(
                {
                  _id: mediaObj._id,
                },
                {
                  $pull: {
                    audio_tracks: audioTrack._id,
                  },
                },
                {
                  new: true,
                }
              )

                .then(async (result) => {
                  var deletedAudioTrack = await AudioTracks.findByIdAndDelete({
                    _id: audioTrack._id,
                  })

                    .then((result) => {
                      console.log("Database success: ", result);
                      res.json({
                        message: "Audio track deleted!",
                        status: "200",
                      });
                    })
                    .catch((error) => {
                      console.log("Database error delete audio: ", error);
                      res.json({
                        message: "Something went wrong!",
                        status: "400",
                      });
                    });
                })
                .catch((error) => {
                  console.log("Database error: ", error);
                  res.json({
                    message: "Something went wrong!",
                    status: "503",
                  });
                });
            })
            .catch((error) => {
              console.log("JW API Error: ", error);
              res.json({
                message: "Something went wrong!",
                status: "503",
              });
            });
        }
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

const getAudioTracksByGeneralMediaId = async (req, res) => {
  try {
    var media_id = req.params.media_id;

    if (!media_id || media_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var media = await Media.findById({
        _id: media_id,
      }).populate("audio_tracks");

      if (media) {
        res.json({
          message: "Audio tracks found!",
          status: "200",
          audio_tracks: media.audio_tracks,
        });
      } else {
        res.json({
          message: "No audio tracks found!",
          status: "404",
          audio_tracks: [],
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

const getAudioTracksByGeneralContentId = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    if (!general_content_id || general_content_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var general_content = await GeneralContent.findById({
        _id: general_content_id,
      }).populate("media");

      if (!general_content) {
        res.json({
          message: "No general content found for provided general content id!",
          status: "404",
          general_content: null,
        });
      } else {
        console.log("general content: ", general_content);
        var media = general_content.media;

        var populatedMedia = await Media.findById({
          _id: media._id,
        }).populate("audio_tracks");

        if (populatedMedia) {
          res.json({
            message: "Subtitles found!",
            status: "200",
            audio_tracks: populatedMedia.audio_tracks,
          });
        } else {
          res.json({
            message: "No audio tracks found!",
            status: "404",
            audio_tracks: [],
          });
        }
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
  addAudioTrack,
  deletedAudioTrack,
  getAudioTracksByGeneralMediaId,
  getAudioTracksByGeneralContentId,
};
