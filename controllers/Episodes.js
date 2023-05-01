const Season = require("../models/Season");
const Episode = require("../models/Episode");
const TvShow = require("../models/TvShow");
const LanguagesContent = require("../models/LanguagesContent");
const Thumbnail = require("../models/Thumbnail");

const cloudinary = require("cloudinary").v2;

const cloudinaryConfigObj = require("../configurations/Cloudinary");

const createEpisodeOfASeason = async (req, res) => {
  try {
    var season_id = req.params.season_id;

    var {
      title,
      description,
      jw_tags,
      category,
      default_language,
      release_year,
      seo_tags,
      rating,
      isThumbnailSelected,
      monetization,
      imageBase64,
      language_code,
      duration,
    } = req.body;

    if (!season_id || season_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var season = await Season.findById(season_id)
        .then(async (onSeasonFound) => {
          console.log("on season found: ", onSeasonFound);

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

                var episodeObj = new Episode({
                  title: title,
                  description: description,
                  duration: duration,
                  default_language: default_language,
                  release_year: release_year,
                  media_id: "",
                  subtitles: [],
                  audio_tracks: [],
                  jw_tags: jw_tags,
                  seo_tags: seo_tags,
                  translated_content: [savedLanguagesContent._id],
                  rating: rating,
                  thumbnail: savedThumbnail._id,
                  rating: rating,
                  comments: [],
                  likes: 0,
                  monetization: monetization,
                });

                var savedEpisode = await episodeObj.save();

                var season = await Season.findByIdAndUpdate(
                  {
                    _id: onSeasonFound._id,
                  },
                  {
                    $push: {
                      episodes: savedEpisode._id,
                    },
                  },
                  {
                    new: true,
                  }
                )
                  .then(async (onSeasonUpdate) => {
                    console.log("on season update: ", onSeasonUpdate);
                    res.json({
                      message: "New Episode Created!",
                      status: "200",
                      savedEpisode,
                      thumbnail: savedThumbnail,
                      onSeasonUpdate,
                    });
                  })
                  .catch(async (onSeasonUpdateError) => {
                    console.log(
                      "on season update error: ",
                      onSeasonUpdateError
                    );
                    res.json({
                      message:
                        "Something went wrong while creating episode for a season!",
                      status: "400",
                      error: onSeasonUpdateError,
                    });
                  });
              })
              .catch((cloudinaryError) => {
                console.log("cloudinary error: ", cloudinaryError);
                res.json({
                  cloudinaryError,
                });
              });
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

            var customTags = req.body.jw_tags.map(
              (tag) => tag + `-${category}`
            );
            var jw_tags = [...req.body.jw_tags, ...customTags];

            var episodeObj = new Episode({
              title: title,
              description: description,
              duration: duration,
              default_language: default_language,
              release_year: release_year,
              media_id: "",
              subtitles: [],
              audio_tracks: [],
              jw_tags: jw_tags,
              seo_tags: seo_tags,
              translated_content: [savedLanguagesContent._id],
              rating: rating,
              thumbnail: savedThumbnail._id,
              rating: rating,
              comments: [],
              likes: 0,
              monetization: monetization,
            });

            var savedEpisode = await episodeObj.save();

            var season = await Season.findByIdAndUpdate(
              {
                _id: onSeasonFound._id,
              },
              {
                $push: {
                  episodes: savedEpisode._id,
                },
              },
              {
                new: true,
              }
            )
              .then(async (onSeasonUpdate) => {
                console.log("on season update: ", onSeasonUpdate);
                res.json({
                  message: "New Episode Created!",
                  status: "200",
                  savedEpisode,
                  thumbnail: savedThumbnail,
                  onSeasonUpdate,
                });
              })
              .catch(async (onSeasonUpdateError) => {
                console.log("on season update error: ", onSeasonUpdateError);
                res.json({
                  message:
                    "Something went wrong while creating episode for a season!",
                  status: "400",
                  error: onSeasonUpdateError,
                });
              });

            // res.json({
            //   message: "Episode created!",
            //   status: "200",
            //   savedEpisode,
            //   thumbnail: savedThumbnail,
            // });

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
        })
        .catch(async (onSeasonFoundError) => {
          console.log("on season found error: ", onSeasonFoundError);
          res.json({
            message: "Season not found!",
            status: "404",
            error: onSeasonFoundError,
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
  createEpisodeOfASeason,
};
