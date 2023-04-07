const Media = require("../models/Media");
const Trailer = require("../models/Trailer");
const GeneralContent = require("../models/GeneralContent");

const axios = require("axios");
const { getVideoDurationInSeconds } = require("get-video-duration");

const uploadTrailerOfGeneralContent = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var { download_url, type } = req.body;

    var generalContent = await GeneralContent.findById({
      _id: general_content_id,
    })

      .then(async (foundGC) => {
        var generalContentObj = foundGC;
        console.log("Media id:", generalContentObj.media);

        var media = await Media.findById({
          _id: generalContentObj.media,
        })
          .then(async (foundMedia) => {
            console.log("found media!");
            var mediaObj = foundMedia;

            var video_duration = getVideoDurationInSeconds(
              `${download_url}`
            ).then(async (duration) => {
              var data = {
                upload: {
                  method: "fetch",
                  download_url: `${download_url}`,
                },
                metadata: {
                  custom_params: {
                    category: `${generalContentObj.category}`,
                  },
                  title: `${mediaObj.title} Trailer`,
                  description: mediaObj.description,
                  // author: author,
                  duration: duration * 1000,
                  // category: `${category}`,
                  tags: mediaObj.jw_tags,
                  language: mediaObj.default_language,
                },
              };

              var headers = {
                Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
              };

              var apiResponse = await axios
                .post(
                  "https://api.jwplayer.com/v2/sites/yP9ghzCy/media",
                  data,
                  {
                    headers: headers,
                  }
                )
                .then(async (result) => {
                  var { duration, id } = result.data;

                  var trailerObj = new Trailer({
                    media_id: id,
                    subtitles: [],
                    audio_tracks: [],
                    type: type,
                  });

                  var savedTrailer = await trailerObj.save();

                  var filter = {
                    _id: generalContentObj._id,
                  };
                  var updateGcData = {
                    trailer: savedTrailer._id,
                  };

                  var updatedGc = await GeneralContent.findByIdAndUpdate(
                    filter,
                    updateGcData,
                    {
                      new: true,
                    }
                  )
                    .then((result2) => {
                      res.json({
                        message: "Trailer uploaded!",
                        status: "200",
                        savedTrailer,
                        updatedGc: result2,
                      });
                    })
                    .catch((error) => {
                      console.log("Database update error: ", error);
                      res.json({
                        message:
                          "Something went wrong while saving trailet to database!",
                        status: "400",
                        error,
                      });
                    });
                })
                .catch((error) => {
                  console.log("Error: ", error.data);
                  res.json({
                    error,
                    message: "Error occurred while uploading movie",
                    status: "400",
                  });
                });
            });
          })
          .catch((error) => {
            console.log("media not found!");
            res.json({
              message: "Media not found!",
              status: "404",
              error,
            });
          });
      })

      .catch((error) => {
        console.log("not found gc");

        res.json({
          message: "No general content found with provided id!",
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

const uploadTrailerOfGeneralContentUpdated = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;
    var { trailer_media_id, type } = req.body;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (onGcFound) => {
        var generalContentObj = onGcFound;

        var trailerObj = new Trailer({
          media_id: trailer_media_id,
          subtitles: [],
          audio_tracks: [],
          type: "Trailer",
        });

        var savedTrailer = await trailerObj.save();

        var filter = {
          _id: generalContentObj._id,
        };
        var updateGcData = {
          trailer: savedTrailer._id,
        };

        var updatedGc = await GeneralContent.findByIdAndUpdate(
          filter,
          updateGcData,
          {
            new: true,
          }
        )
          .then((result2) => {
            res.json({
              message: "Trailer uploaded!",
              status: "200",
              savedTrailer,
              updatedGc: result2,
            });
          })
          .catch((error) => {
            console.log("Database update error: ", error);
            res.json({
              message: "Something went wrong while saving trailet to database!",
              status: "400",
              error,
            });
          });
      })
      .catch((onGcNotFound) => {
        console.log("gc not found: ", onGcNotFound);
        res.json({
          message: "General content not found!",
          status: "404",
        });
      });
  } catch (error) {
    res.json({
      message: "internal server error!",
      status: "500",
      error,
    });
  }
};

module.exports = {
  uploadTrailerOfGeneralContent,
  uploadTrailerOfGeneralContentUpdated,
};
