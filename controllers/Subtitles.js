const Subtitles = require("../models/Subtitles");
const Media = require("../models/Media");
const GeneralContent = require("../models/GeneralContent");

const axios = require("axios");

const addSubtitles = async (req, res) => {
  try {
    var mediaObjId = req.params.media_object_id;
    var { file_format, download_url, label, language } = req.body;
    var mediaObj = await Media.findById({
      _id: mediaObjId,
    });

    if (!mediaObj) {
      res.json({
        message: "No media found!",
        status: "404",
      });
    } else {
      var media_id = mediaObj.media_id;
      var headers = {
        Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
      };

      var data = {
        upload: {
          file_format: file_format,
          method: "fetch",
          download_url: download_url,
        },
        metadata: {
          label: label,
          srclang: language,
          track_kind: "subtitles",
        },
      };

      var site_id = process.env.SITE_ID;

      var apiResponse = await axios
        .post(
          `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/text_tracks/`,
          data,
          {
            headers: headers,
          }
        )
        .then(async (subtitleResult) => {
          var { id, track_kind } = subtitleResult.data;
          var { srclang } = subtitleResult.data.metadata;

          setTimeout(() => {}, 3000);

          var apiResponse_2 = await axios
            .get(
              `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/text_tracks/${id}/`,
              {
                headers: headers,
              }
            )
            .then(async (subtitleResult_2) => {
              var { delivery_url } = subtitleResult_2.data;

              console.log(delivery_url);
              var subtitlesObj = new Subtitles({
                track_id: id,
                delivery_url,
                track_kind,
                language: srclang,
                media: mediaObj._id,
              });

              var savedSubtitles = subtitlesObj.save();

              var filter = {
                _id: mediaObj._id,
              };

              var updatedMedia = await Media.findByIdAndUpdate(
                filter,
                {
                  $push: { subtitles: subtitlesObj._id },
                },
                {
                  new: true,
                }
              )
                .then((updatedMediaResult) => {
                  console.log("Saved Subtitles: ", savedSubtitles);
                  res.json({
                    message: "Subtitles Created!",
                    status: "200",
                    savedSubtitles,
                    updatedMediaResult,
                  });
                })
                .catch((error) => {
                  res.json({
                    error,
                  });
                });
            })

            .catch((error) => {
              console.log(error);
              res.json({
                error,
              });
            });
        })
        .catch((error) => {
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

const deletedSubtitles = async (req, res) => {
  try {
    var media_object_id = req.params.media_object_id;
    var subtitles_id = req.params.subtitles_id;

    var mediaObj = await Media.findById({
      _id: media_object_id,
    });
    var media_id = mediaObj.media_id;
    var subtitles = await Subtitles.findOne({
      _id: subtitles_id,
    });

    var site_id = process.env.SITE_ID;
    var track_id = subtitles?.track_id;

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var apiResponse = await axios
      .delete(
        `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/text_tracks/${track_id}/`,
        {
          headers: headers,
        }
      )
      .then((result) => {
        var updatedMedia = Media.updateOne(
          {
            _id: mediaObj._id,
          },
          {
            $pull: {
              subtitles: subtitles._id,
            },
          },
          {
            new: true,
          }
        )
          .then(async (result) => {
            var deletedSubtitles = await Subtitles.findByIdAndDelete({
              _id: subtitles._id,
            });

            res.json({
              message: "Subtitles deleted!",
              status: "200",
              result: result.data,
            });
          })
          .catch((error) => {
            console.log("Database Error: ", error);
            res.json({
              message: "No media found with provided id!",
              status: "404",
              error,
            });
          });
      })
      .catch((error) => {
        console.log("JW Error: ", error);
        res.send(error);
      });
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error,
    });
  }
};

const getSubtitlesByGeneralContentId = async (req, res) => {
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
          message: "General content not found with provided id!",
          status: "404",
          subtitles: [],
        });
      } else {
        var media = general_content.media;

        var populatedMedia = Media.findById({
          _id: media._id,
        }).populate("subtitles");

        if (!populatedMedia.subtitles) {
          res.json({
            message: "Subtitles found!",
            status: "200",
            subtitles: [],
          });
        } else {
          res.json({
            message: "Subtitles found!",
            status: "200",
            subtitles: populatedMedia.subtitles,
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

const getSubtitlesByMediaId = async (req, res) => {
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
      }).populate("subtitles");

      if (media) {
        res.json({
          message: "Subtitles found!",
          status: "200",
          subtitles: media.subtitles,
        });
      } else {
        res.json({
          message: "Media not found!",
          status: "404",
          subtitles: [],
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
  addSubtitles,
  deletedSubtitles,
  getSubtitlesByGeneralContentId,
  getSubtitlesByMediaId,
};
