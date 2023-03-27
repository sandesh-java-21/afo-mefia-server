const GeneralContent = require("../models/GeneralContent");
const Media = require("../models/Media");
const AudioTracks = require("../models/AudioTracks");
const Subtitles = require("../models/Subtitles");
const Slider = require("../models/Slider");
const Thumbnail = require("../models/Thumbnail");
const LanguagesContent = require("../models/LanguagesContent");
const Trailer = require("../models/Trailer");

const axios = require("axios");

const addGeneralContent = async (req, res) => {
  try {
    var { media, category, genre, trailer, status, thumbnail, rating } =
      req.body;

    if (
      !media ||
      !category ||
      !genre ||
      !trailer ||
      !status ||
      !thumbnail ||
      !rating
    ) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var generalContentObj = new GeneralContent({
        media: media,
        category: category,
        genre: genre,
        trailer: trailer,
        status: status,
        thumbnail: thumbnail,
        rating: rating,
      });

      var savedGeneralContent = await generalContentObj.save();

      res.json({
        message: "General content added!",
        status: "200",
        savedGeneralContent: savedGeneralContent,
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

const deleteGeneralContentById = async (req, res) => {
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
      })
        .then(async (onFoundGc) => {
          var general_content_obj = onFoundGc;

          var media = await Media.findById({
            _id: general_content_obj.media,
          }).then(async (onMediaFound) => {
            var mediaObj = onMediaFound;

            var subtitles = mediaObj.subtitles;

            var audio_tracks = mediaObj.audio_tracks;

            var languages_content = mediaObj.languages_content;

            var headers = {
              Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            };
            var media_id = mediaObj.media_id;
            var site_id = process.env.SITE_ID;

            var apiResponse = await axios
              .delete(
                `https://api.jwplayer.com/v2/sites/${site_id}/media/${media_id}/`,
                {
                  headers: headers,
                }
              )
              .then(async (onJwMediaDelete) => {
                console.log("JW media deleted: ", onJwMediaDelete);

                var subtitlesDeleted = await Subtitles.deleteMany({
                  _id: { $in: subtitles },
                }).then(async (onSubtitlesDelete) => {
                  console.log("Subtitles deleted: ", onSubtitlesDelete);

                  var audioTracksDeleted = await AudioTracks.deleteMany({
                    _id: { $in: audio_tracks },
                  }).then(async (onAudioTracksDelete) => {
                    console.log("Audio tracks deleted: ", onAudioTracksDelete);

                    var languagesContentDeleted =
                      await LanguagesContent.deleteMany({
                        _id: { $in: languages_content },
                      }).then(async (onLanguagesContentDelete) => {
                        console.log(
                          "languages content deleted: ",
                          onLanguagesContentDelete
                        );

                        var deletedSliderItem = await Slider.findOneAndDelete({
                          general_content: general_content_obj._id,
                        }).then(async (onSliderItemDelete) => {
                          console.log(
                            "slider item delete: ",
                            onSliderItemDelete
                          );

                          var thumbnailDeleted =
                            await Thumbnail.findOneAndDelete({
                              general_content: general_content_obj._id,
                            }).then(async (onThumbnailDelete) => {
                              console.log(
                                "thumbnail delete success: ",
                                onThumbnailDelete
                              );

                              var trailerDeleted =
                                await Trailer.findByIdAndDelete({
                                  _id: general_content_obj.trailer,
                                }).then(async (onTrailerDelete) => {
                                  console.log(
                                    "trailer deleted success: ",
                                    onTrailerDelete
                                  );

                                  var mediaDeleted =
                                    await Media.findByIdAndDelete({
                                      _id: mediaObj._id,
                                    }).then(async (onMediaDelete) => {
                                      console.log(
                                        "media delete success: ",
                                        onMediaDelete
                                      );

                                      var deletedGeneralContent =
                                        await GeneralContent.findByIdAndDelete({
                                          _id: general_content_obj._id,
                                        }).then(async (onGcDelete) => {
                                          console.log(
                                            "gc deleted: ",
                                            onGcDelete
                                          );
                                          res.json({
                                            message: "General content deleted!",
                                            status: "200",
                                          });
                                        });
                                      // .catch(onGcDeleteError=>{
                                      //   console.log("gc delete error: ", onGcDeleteError);
                                      // })
                                    });
                                  // .catch(onMediaDeleteError=>{
                                  //   console.log("media delete error: ", onMediaDeleteError);
                                  // })
                                });
                              // .catch(onTrailerDeleteError=>{
                              //   console.log("trailer delete error: ", onTrailerDeleteError);
                              // })
                            });
                          // .catch(onThumbnailDeleteError=>{
                          //   console.log("On thumbnail delete error: ", onThumbnailDeleteError);
                          // })
                        });
                        // .catch(onSliderItemDeleteError=>{
                        //   console.log(onSliderItemDeleteError);

                        // })
                      });
                    // .catch(onNoLanguagesContentDelete=>{
                    //   console.log("no languages content deleted: ", onNoLanguagesContentDelete);
                    // })
                  });
                  // .catch(onNoAudioTracksDelete=>{
                  //   console.log("no audio tracks deleted: ", onNoAudioTracksDelete);
                  // })
                });
                // .catch(onNoSubtitlesDelete=>{
                //   console.log(onNoSubtitlesDelete);
                // })
              })
              .catch((onJwMediaDeleteError) => {
                console.log(onJwMediaDeleteError);
                res.json({
                  message:
                    "Something went wrong while deleting media from JW Player!",
                  status: "400",
                  onJwMediaDeleteError,
                });
              });
          });
          // .catch(onMediaNotFound=>{
          //   console.log(onMediaNotFound);
          // })
        })
        .catch((onNotFoundGc) => {
          res.json({
            message: "General content not found for provided id!",
            status: "404",
            onNotFoundGc,
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

const getGeneralContent = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    if (!general_content_id || general_content_id === "") {
      res.json({
        message: "Please provide a general content id!",
        status: "400",
      });
    } else {
      var general_content = await GeneralContent.findById({
        _id: general_content_id,
      })
        .populate(["media", "genre", "trailer", "thumbnail"])
        .populate({
          path: "media",
          populate: [
            {
              path: "audio_tracks",
            },
            {
              path: "subtitles",
            },
            {
              path: "translated_content",
            },
          ],
        })
        .then(async (onGcFound) => {
          var generalContentObj = onGcFound;
          res.json({
            generalContentObj,
          });
        })
        .catch((error) => {
          res.json({
            message: "General content not found!",
            status: "404",
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

module.exports = {
  addGeneralContent,
  deleteGeneralContentById,
  getGeneralContent,
};
