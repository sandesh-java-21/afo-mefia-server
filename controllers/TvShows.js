const TvShow = require("../models/TvShow");
const Season = require("../models/Season");
const LanguagesContent = require("../models/LanguagesContent");
const Thumbnail = require("../models/Thumbnail");
const Trailer = require("../models/Trailer");

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");

const axios = require("axios");

const createTvShow = async (req, res) => {
  try {
    var {
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status,
      isThumbnailSelected,
      language_code,
      imageBase64,
      content_type,
      availability,
      monetization,
    } = req.body;

    console.log(
      "Data body: ",
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      genres,
      seo_tags,
      rating,
      status,
      isThumbnailSelected,
      content_type,
      availability,
      monetization
    );

    category = "tvshow";

    if (!title) {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      if (isThumbnailSelected) {
        cloudinary.config(cloudinaryConfigObj);
        console.log(" image base 64 : ");

        cloudinary.uploader
          .upload(imageBase64, {
            folder: "thumbnails",
          })
          .then(async (result) => {
            console.log("cloudinary result : ", result);

            var publicId = result.public_id;

            var thumbnail = new Thumbnail({
              thumbnail_id: "",
              static_thumbnail_url: result.secure_url,
              banner_thumbnail_url: result.secure_url,
              motion_thumbnail_url: "",
              thumbnail_type: "cloudinary",
              cloudinary_public_id: publicId,
            });

            var savedThumbnail = await thumbnail.save();

            var languagesContentObj = new LanguagesContent({
              title_translated: title,
              description_translated: description,
              language_type: default_language,
              language_code: language_code,
            });

            var savedLanguagesContent = await languagesContentObj.save();

            var customTags = req.body.jw_tags.map(
              (tag) => tag + `-${category}`
            );
            var jw_tags = [...req.body.jw_tags, ...customTags];

            var tvShowTrailer = new Trailer({
              media_id: "",
              audio_tracks: [],
              subtitles: [],
              type: "trailer",
            });

            var savedTrailerTvShow = await tvShowTrailer.save();

            var tvShowObj = new TvShow({
              title: title,
              description: description,
              duration: 0,
              default_language: default_language,
              release_year: release_year,
              subtitles: [],
              audio_tracks: [],
              jw_tags: jw_tags,
              seo_tags: seo_tags,
              translated_content: [savedLanguagesContent._id],
              rating: rating,
              monetization: monetization,
              genre: genres,
              availability: availability,
              content_type: content_type,
              thumbnail: savedThumbnail._id,
              status: status,
              rating: rating,
              category: category,
              comments: [],
              total_likes: 0,
              crew_members: [],
              seasons: [],
              trailer: savedTrailerTvShow._id,
            });

            var savedTvShow = await tvShowObj.save();

            //   var generalContentObj = new GeneralContent({
            //     media: savedMedia._id,
            //     category: "movie",
            //     genre: genres,
            //     rating: rating,
            //     status: status,
            //     thumbnail: savedThumbnail._id,
            //     content_type: content_type,
            //     availability: availability,
            //   });

            //   var savedGeneralContent = await generalContentObj.save();

            res.json({
              message: "Tv Showcreated!",
              status: "200",
              savedTvShow,
              thumbnail: savedThumbnail,
            });

            // var headers = {
            //   Authorization: `Bearer ${process.env.JW_PLAYER_API_KEY}`,
            // };

            // var data = {
            //   relationships: {
            //     media: [
            //       {
            //         id: `${mediaObj.media_id}`,
            //       },
            //     ],
            //   },
            //   upload: {
            //     source_type: "custom_upload",
            //     method: "fetch",
            //     thumbnail_type: "static",
            //     download_url: `${result.secure_url}`,
            //   },
            // };

            // var site_id = process.env.SITE_ID;
            // var apiResponse = await axios
            //   .post(
            //     `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/`,
            //     data,
            //     {
            //       headers: headers,
            //     }
            //   )
            //   .then(async (result) => {
            //     console.log("JW Thumbnail Success: ", result.data);
            //     var { id } = result.data;
            //     var site_id = process.env.SITE_ID;
            //     var thumbnail_id = id;

            //     setTimeout(async () => {
            //       var apiResponse_2 = await axios
            //         .get(
            //           `https://api.jwplayer.com/v2/sites/${site_id}/thumbnails/${thumbnail_id}/`,
            //           {
            //             headers: headers,
            //           }
            //         )

            //         .then(async (result) => {
            //           cloudinary.config(cloudinaryConfigObj);

            //           cloudinary.uploader
            //             .destroy(publicId)
            //             .then((deleteResult) => {
            //               console.log(deleteResult);
            //             })
            //             .catch((deleteError) => {
            //               console.log("delete error: ", deleteError);
            //             });

            //           console.log("JW Get Thumbnail Success: ", result.data);
            //           console.log(
            //             "JW Get Thumbnail Success URL: ",
            //             result.data.delivery_url
            //           );

            //           var thumbnail = new Thumbnail({
            //             thumbnail_id: thumbnail_id,
            //             static_thumbnail_url: result.data.delivery_url,
            //             banner_thumbnail_url: result.data.delivery_url,
            //             motion_thumbnail_url: "",
            //             thumbnail_type: "jw_player",
            //           });

            //           var savedThumbnail = await thumbnail.save();

            //           var languagesContentObj = new LanguagesContent({
            //             title_translated: title,
            //             description_translated: description,
            //             language_type: default_language,
            //             language_code: language_code,
            //           });

            //           var savedLanguagesContent =
            //             await languagesContentObj.save();

            //           var customTags = jw_tags.map(
            //             (tag) => tag + `-${category}`
            //           );
            //           var jw_tags = [...jw_tags, ...customTags];

            //           var mediaObj = new Media({
            //             title: title,
            //             description: description,
            //             duration: 0,
            //             default_language: default_language,
            //             release_year: release_year,
            //             subtitles: [],
            //             audio_tracks: [],
            //             jw_tags: jw_tags,
            //             seo_tags: seo_tags,
            //             translated_content: [savedLanguagesContent._id],
            //             rating: rating,
            //           });

            //           var savedMedia = await mediaObj.save();

            //           var generalContentObj = new GeneralContent({
            //             media: savedMedia._id,
            //             category: category,
            //             genre: genres,
            //             rating: rating,
            //             status: status,
            //             thumbnail: savedThumbnail._id,
            //           });

            //           var savedGeneralContent = await generalContentObj.save();

            //           res.json({
            //             message: "Media and general content created!",
            //             status: "200",
            //             savedGeneralContent,
            //             savedMedia,
            //           });
            //         })
            //         .catch(async (jwGetThumbnailError) => {
            //           res.json({
            //             jwGetThumbnailError,
            //           });
            //         });
            //     }, 10000);
            //   })
            //   .catch(async (jwThumbnailError) => {
            //     res.json({
            //       jwThumbnailError,
            //     });
            //   });
          })
          .catch((cloudinaryError) => {
            console.log("cloudinary error: ", cloudinaryError);
            res.json({
              cloudinaryError,
            });
          });

        // var { thumbnail_id, static_thumbnail_url, banner_thumbnail_url } =
        //   req.body;

        // var thumbnail = new Thumbnail({
        //   thumbnail_id: thumbnail_id,
        //   static_thumbnail_url: static_thumbnail_url,
        //   banner_thumbnail_url: banner_thumbnail_url,
        //   motion_thumbnail_url: "",
        // });

        // var savedThumbnail = await thumbnail.save();

        // var languagesContentObj = new LanguagesContent({
        //   title_translated: title,
        //   description_translated: description,
        //   language_type: default_language,
        //   language_code: language_code,
        // });

        // var savedLanguagesContent = await languagesContentObj.save();

        // var customTags = jw_tags.map((tag) => tag + `-${category}`);
        // var jw_tags = [...jw_tags, ...customTags];

        // var mediaObj = new Media({
        //   title: title,
        //   description: description,
        //   duration: 0,
        //   default_language: default_language,
        //   release_year: release_year,
        //   subtitles: [],
        //   audio_tracks: [],
        //   jw_tags: jw_tags,
        //   seo_tags: seo_tags,
        //   translated_content: [savedLanguagesContent._id],
        //   rating: rating,
        // });

        // var savedMedia = await mediaObj.save();

        // var generalContentObj = new GeneralContent({
        //   media: savedMedia._id,
        //   category: category,
        //   genre: genres,
        //   rating: rating,
        //   status: status,
        //   thumbnail: savedThumbnail._id,
        // });

        // var savedGeneralContent = await generalContentObj.save();

        // res.json({
        //   message: "Media and general content created!",
        //   status: "200",
        //   savedGeneralContent,
        //   savedMedia,
        // });
      } else {
        var languagesContentObj = new LanguagesContent({
          title_translated: title,
          description_translated: description,
          language_type: default_language,
          language_code: language_code,
        });

        var savedLanguagesContent = await languagesContentObj.save();

        var thumbnail = new Thumbnail({
          thumbnail_id: "",
          static_thumbnail_url: "",
          banner_thumbnail_url: "",
          motion_thumbnail_url: "",
          thumbnail_type: "",
          cloudinary_public_id: "",
        });

        var savedThumbnail = await thumbnail.save();

        var customTags = req.body.jw_tags.map((tag) => tag + `-${category}`);
        var jw_tags = [...req.body.jw_tags, ...customTags];

        var tvShowTrailer = new Trailer({
          media_id: "",
          audio_tracks: [],
          subtitles: [],
          type: "trailer",
        });

        var savedTrailerTvShow = await tvShowTrailer.save();

        var tvShowObj = new TvShow({
          title: title,
          description: description,
          duration: 0,
          default_language: default_language,
          release_year: release_year,
          subtitles: [],
          audio_tracks: [],
          jw_tags: jw_tags,
          seo_tags: seo_tags,
          translated_content: [savedLanguagesContent._id],
          rating: rating,
          monetization: monetization,
          genre: genres,
          availability: availability,
          content_type: content_type,
          thumbnail: savedThumbnail._id,
          status: status,
          rating: rating,
          category: category,
          comments: [],
          total_likes: 0,
          crew_members: [],
          seasons: [],
          trailer: savedTrailerTvShow._id,
        });

        var savedTvShow = await tvShowObj.save();

        //   var generalContentObj = new GeneralContent({
        //     media: savedMedia._id,
        //     category: "movie",
        //     genre: genres,
        //     rating: rating,
        //     status: status,
        //     thumbnail: savedThumbnail._id,
        //     content_type: content_type,
        //     availability: availability,
        //   });

        //   var savedGeneralContent = await generalContentObj.save();

        res.json({
          message: "Tv Showcreated!",
          status: "200",
          savedTvShow,
          thumbnail: savedThumbnail,
        });

        //   var customTags = jw_tags.map((tag) => tag + `-${category}`);
        //   var jw_tags = [...jw_tags, ...customTags];

        //   var mediaObj = new Media({
        //     title: title,
        //     description: description,
        //     duration: 0,
        //     default_language: default_language,
        //     release_year: release_year,
        //     subtitles: [],
        //     audio_tracks: [],
        //     jw_tags: jw_tags,
        //     seo_tags: seo_tags,
        //     translated_content: [savedLanguagesContent._id],
        //     rating: rating,
        //     monetization: monetization,
        //   });

        //   var savedMedia = await mediaObj.save();
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

const geAllTvShows = async (req, res) => {
  try {
    var tvshows = await TvShow.find()
      .populate("thumbnail")
      .then(async (onFound) => {
        console.log("on tv show found: ", onFound);

        var allTvShows = onFound;

        if (allTvShows.length <= 0) {
          res.json({
            message: "No Tv Show Found!",
            status: "404",
            allTvShows: [],
          });
        } else {
          res.json({
            message: "No Tv Show Found!",
            status: "404",
            allTvShows: allTvShows,
          });
        }
      })
      .catch(async (onFoundError) => {
        console.log("on tv show found error: ", onFoundError);
        res.json({
          message: "Something went wrong while getting tv show!",
          status: "400",
          error: onFoundError,
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

const getSeasonsOfATvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;
    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var tvshow = await TvShow.findById(tv_show_id)
        .populate("seasons", {
          title: 1,
          _id: 1,
        })
        .then(async (onTvShowFound) => {
          console.log("on tv show found: ", onTvShowFound);

          res.json({
            message: "Tv show seasons found!",
            status: "200",
            seasons: onTvShowFound.seasons,
          });
        })
        .catch(async (onTvShowFoundError) => {
          console.log("on tv show found error: ", onTvShowFoundError);
          res.json({
            message: "Something went wrong while getting tv show seasons!",
            status: "400",
            error: onTvShowFoundError,
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

const createSeasonOfAtvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;
    var { title } = req.body;
    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required field are empty!",
        status: "400",
      });
    } else {
      var tv_show = await TvShow.findById(tv_show_id)
        .then(async (onTvShowFound) => {
          console.log("on tv show found: ", onTvShowFound);

          var seasonTrailer = new Trailer({
            media_id: "",
            audio_tracks: [],
            subtitles: [],
            type: "trailer",
          });

          var savedTrailerSeason = await seasonTrailer.save();

          var seasonObj = new Season({
            title: title,
            tv_show: onTvShowFound._id,
            trailer: savedTrailerSeason._id,
          });

          var savedSeason = await seasonObj
            .save()
            .then(async (onSeasonSave) => {
              console.log("on season save: ", onSeasonSave);

              var filter = {
                _id: onTvShowFound._id,
              };

              var updatedTvShow = await TvShow.findByIdAndUpdate(
                filter,
                {
                  $push: {
                    seasons: onSeasonSave._id,
                  },
                },
                {
                  new: true,
                }
              )
                .then(async (onTvShowUpdate) => {
                  console.log("on tv show update: ", onTvShowUpdate);
                  res.json({
                    message: "New season created for the tv show!",
                    status: "200",
                    savedSeason: {
                      title: onSeasonSave.title,
                      _id: onSeasonSave._id,
                    },
                  });
                })
                .catch(async (onTvShowUpdateError) => {
                  console.log("on tv show update error: ", onTvShowUpdateError);
                  res.json({
                    message: "Something went wrong while creating season!",
                    status: "400",
                    error: onTvShowUpdateError,
                  });
                });
            })
            .catch(async (onSeasonSaveError) => {
              console.log("on season save error: ", onSeasonSaveError);
              res.json({
                message: "Something went wrong while saving season!",
                status: "400",
                error: onSeasonSaveError,
              });
            });
        })
        .catch(async (onTvShowFoundError) => {
          console.log("on tv show found error: ", onTvShowFoundError);
          res.json({
            message: "Tv show not found!",
            status: "404",
            error: onTvShowFoundError,
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

const updateTvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;

    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var tv_show = await TvShow.findById(tv_show_id)
        .then(async (onTvShowFound) => {
          console.log("on tv show found: ", onTvShowFound);

          // remaining code
        })
        .catch(async (onTvShowFoundError) => {
          console.log("on tv show found error: ", onTvShowFoundError);
          res.json({
            message: "Tv Show Not Found!",
            status: "404",
            error: onTvShowFoundError,
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

const getTvShow = async (req, res) => {
  try {
    var tv_show_id = req.params.tv_show_id;

    if (!tv_show_id || tv_show_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var tv_show = await TvShow.findById({
        _id: tv_show_id,
      })
        .populate(["genre", "trailer", "thumbnail", "seasons"])
        .then(async (onTvShowFound) => {
          var tv_show_obj = onTvShowFound;
          res.json({
            tv_show_obj,
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
      message: "Internal Server Error!",
      status: "400",
      error,
    });
  }
};

module.exports = {
  createTvShow,
  geAllTvShows,
  getSeasonsOfATvShow,
  createSeasonOfAtvShow,
  getTvShow,
};
