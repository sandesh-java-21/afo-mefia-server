const GeneralContent = require("../models/GeneralContent");
const Media = require("../models/Media");
const Thumbnail = require("../models/Thumbnail");

const axios = require("axios");

const generateJwMotionThumbnail = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var generalContentObj = await GeneralContent.findById({
      _id: general_content_id,
    });

    var mediaObj = await Media.findById({
      _id: generalContentObj.media,
    });

    var headers = {
      Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
    };

    var apiResponse = await axios
      .get(
        `https://api.jwplayer.com/v2/sites/yP9ghzCy/thumbnails/?q=media_id:${mediaObj.media_id}`,
        {
          headers: headers,
        }
      )
      .then(async (thumbnailResult) => {
        var { thumbnails } = thumbnailResult.data;

        var thumbnailObj = new Thumbnail({
          general_content: generalContentObj._id,
          motion_thumbnail_url: thumbnails[1].delivery_url,
        });

        var savedThumbnail = await thumbnailObj.save();

        var filter = {
          _id: generalContentObj._id,
        };

        var update = {
          thumbnail: savedThumbnail._id,
        };

        var updatedGeneralContent = await GeneralContent.findByIdAndUpdate(
          filter,
          update,
          {
            new: true,
          }
        )
          .then((result) => {
            console.log("Updated Doc: ", result);

            res.json({
              message: "Motion thumbnail Created!",
              status: "200",
              motion_thumbnail_url: thumbnails[1].delivery_url,
              savedThumbnail,
              updatedGeneralContent: result,
            });
          })
          .catch((error) => {
            res.json({
              message:
                "Something went wrong while generating motion thumbnail!",
              status: "400",
              error,
            });
          });
      })
      .catch((error) => {
        console.log("Error thumbnail: ", error);
        res.json({
          message: "Something went wrong!",
          status: "400",
          error,
        });
      })

      .catch((error) => {
        console.log("JW Error: ", error);
        res.json({
          message: "API Error!",
          status: "400",
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

const uploadCustomThumbnail = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var { download_url } = req.body;

    var searchedGeneralContent = await GeneralContent.findById({
      _id: general_content_id,
    })
      .then(async (found) => {
        var generalContentObj = found;

        var thumbnail = await Thumbnail.findById({
          _id: generalContentObj.thumbnail,
        })
          .then(async (foundThumbnail) => {
            var thumbnailObj = foundThumbnail;

            var media = await Media.findById({
              _id: generalContentObj.media,
            })

              .then(async (mediaFound) => {
                var mediaObj = mediaFound;

                var headers = {
                  Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
                };

                var data = {
                  relationships: {
                    media: [
                      {
                        id: `${mediaObj.media_id}`,
                      },
                    ],
                  },
                  upload: {
                    source_type: "custom_upload",
                    method: "fetch",
                    thumbnail_type: "static",
                    download_url: `${download_url}`,
                  },
                };

                var site_id = process.env.SITE_ID;
                var apiResponse = await axios
                  .post(
                    `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/`,
                    data,
                    {
                      headers: headers,
                    }
                  )
                  .then(async (result) => {
                    console.log("JW Thumbnail Success: ", result.data);
                    var { id } = result.data;
                    var site_id = process.env.SITE_ID;
                    var thumbnail_id = id;

                    setTimeout(async () => {
                      console.log("now start");

                      var apiResponse_2 = await axios
                        .get(
                          `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
                          {
                            headers: headers,
                          }
                        )

                        .then(async (result) => {
                          console.log(
                            "JW Get Thumbnail Success: ",
                            result.data
                          );
                          console.log(
                            "JW Get Thumbnail Success URL: ",
                            result.data.delivery_url
                          );
                          var filter = {
                            _id: thumbnailObj._id,
                          };

                          var updatedData = {
                            thumbnail_id: thumbnail_id,
                            static_thumbnail_url: result.data.delivery_url,
                            banner_thumbnail_url: result.data.delivery_url,
                          };
                          var updatedThumbnail =
                            await Thumbnail.findByIdAndUpdate(
                              filter,
                              updatedData,
                              {
                                new: true,
                              }
                            )
                              .then((updatedThumbnailResult) => {
                                console.log(
                                  "New updated doc thumbnail: ",
                                  updatedThumbnailResult
                                );
                                res.json({
                                  message: "Custom thumbnail uploaded!",
                                  status: "200",
                                  updatedThumbnail: updatedThumbnailResult,
                                  uploadedCustomThumbnailUrl:
                                    result.data.delivery_url,
                                });
                              })
                              .catch((error) => {
                                console.log("Database error: ", error);
                                res.json({
                                  message:
                                    "Something went wrong while saving in database!",
                                  status: "400",
                                  error,
                                });
                              });
                        })
                        .catch((error) => {
                          res.json({
                            message:
                              "Something went wrong while uploading custom thumbnail!",
                            status: "400",
                            error,
                          });
                        });
                    }, 5000);
                  })
                  .catch((error) => {
                    console.log("JW Thumbnail Error: ", error);
                    res.json({
                      message:
                        "Something went wrong while uploading custom thumbnail!",
                      status: "400",
                      error,
                    });
                  });
              })
              .catch((notFoundMedia) => {
                res.json({
                  message: "Media not found!",
                  status: "404",
                  notFoundMedia,
                });
              });
          })

          .catch((notFoundThumbnail) => {
            console.log("Thumbnail not found!");
            res.json({
              message: "Thumbnail not found!",
              status: "404",
              notFoundThumbnail,
            });
          });
      })

      .catch((notFound) => {
        res.json({
          message: "General content not found!",
          status: "404",
          notFound,
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

const getGeneralContentThumbnail = async (req, res) => {
  try {
    var general_content_id = req.params.general_content_id;

    var general_content = await GeneralContent.findById({
      _id: general_content_id,
    })

      .then(async (foundGc) => {
        var thumbnail = foundGc.thumbnail;

        var thumbnailobj = await Thumbnail.findOne({
          _id: thumbnail._id,
        })
          .then((thumbnail) => {
            res.json({
              message: "Thumbnail Found!",
              status: "200",
              thumbnail,
            });
          })

          .catch((error) => {
            res.json({
              message: "Something went wrong!",
              status: "400",
              error,
            });
          });
      })
      .catch((error) => {
        res.json({
          message: "General content not found!",
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

module.exports = {
  generateJwMotionThumbnail,
  uploadCustomThumbnail,
  getGeneralContentThumbnail,
};
