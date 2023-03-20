const GeneralContent = require("../models/GeneralContent");

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

module.exports = {
  addGeneralContent,
};
