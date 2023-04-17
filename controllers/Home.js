const GeneralContent = require("../models/GeneralContent");

const getMixContentByGenreId = async (req, res) => {
  try {
    var genre_id = req.params.genre_id;

    var { category } = req.body;

    if (!genre_id || genre_id === "") {
      res.json({
        message: "Required fields are empty!",
        status: "400",
      });
    } else {
      var mixContent = await GeneralContent.find({
        genre: { $in: [genre_id] },
        // category: category,
      })
        .populate("media", {
          title: 1,
        })
        .populate("thumbnail")
        .limit(12)
        .then(async (onGcFound) => {
          console.log("on gc found: ", onGcFound);

          for (let i = onGcFound.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [onGcFound[i], onGcFound[j]] = [onGcFound[j], onGcFound[i]];
          }

          console.log("general content after shuffle: ", onGcFound);

          res.json({
            message: "General content found!",
            status: "200",
            general_content: onGcFound,
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
