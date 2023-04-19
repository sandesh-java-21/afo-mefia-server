const GeneralContent = require("../models/GeneralContent");

const getMixContentByGenreId = async (req, res) => {
  try {
    var genre_id = req.params.genre_id;
    var language_code = req.params.language_code;

    var { category } = req.body;

    if (!genre_id || genre_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var mixContent = await GeneralContent.find({
        genre: { $in: [genre_id] },
      })
        .populate([
          {
            path: "media",
            populate: {
              path: "translated_content",
              match: { language_code: language_code },
            },
          },
        ])
        .populate("thumbnail")
        .limit(12)
        .then(async (onGcFound) => {
          console.log("on gc found: ", onGcFound);

          const filteredContent = onGcFound.filter((content) => {
            return content.media.translated_content.length > 0;
          });

          for (let i = filteredContent.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredContent[i], filteredContent[j]] = [
              filteredContent[j],
              filteredContent[i],
            ];
          }

          console.log("general content after shuffle: ", filteredContent);

          res.json({
            message: "General content found!",
            status: "200",
            general_content: filteredContent,
          });
        })
        .catch(async (onGcNotFound) => {
          console.log("on gc not found: ", onGcNotFound);
          res.json({
            message: "Something went wrong!",
            status: "400",
            error: onGcNotFound,
          });
        });
    }
  } catch (error) {
    res.json({
      message: "Internal server error!",
      status: "500",
      error: error,
    });
  }
};

module.exports = {
  getMixContentByGenreId,
};
