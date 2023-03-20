const Genre = require("../models/Genre");

const addGenre = async (req, res) => {
  try {
    var { name } = req.body;
    var existingGenre = await Genre.findOne({
      name: name,
    });

    if (existingGenre) {
      res.json({
        message: `${name} genre already exists!`,
        status: "409",
        genreFound: true,
      });
    } else {
      var genreObj = new Genre({
        name: name,
      });

      var savedGenre = await genreObj.save();

      res.json({
        message: "New genre created!",
        status: "200",
        savedGenre: savedGenre,
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

const deleteGenre = async (req, res) => {
  try {
    var genre_id = req.params.id;

    var genre = await Genre.findByIdAndDelete({
      _id: genre_id,
    })
      .then((result) => {
        res.json({
          message: "Genre deleted!",
          status: "200",
          genreDeleted: true,
          genreFound: true,
        });
      })
      .catch((error) => {
        res.json({
          message: "No genre found with provided id!",
          status: "404",
          genreDeleted: false,
          genreFound: false,
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

const updateGenre = async (req, res) => {
  try {
    var genre_id = req.params.id;
    var { name } = req.body;

    if (!genre_id || genre_id === "") {
      res.json({
        message: "No genre found with provided id!",
        status: "404",
        genreUpdated: false,
        genreFound: false,
      });
    } else {
      var filter = {
        _id: genre_id,
      };
      var updateData = {
        name: name,
      };
      var updatedGenre = await Genre.findByIdAndUpdate(filter, updateData, {
        new: true,
      })
        .then((result) => {
          res.json({
            message: "Genre updated!",
            status: "200",
            genreUpdated: true,
            genreFound: true,
          });
        })
        .catch((error) => {
          res.json({
            message: "No genre found with provided id!",
            status: "404",
            genreUpdated: false,
            genreFound: false,
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

const getAllGenres = async (req, res) => {
  try {
    var allGenres = await Genre.find();
    if (!allGenres || allGenres.length <= 0) {
      res.json({
        message: "No genres found!",
        status: "404",
        genresFound: false,
      });
    } else {
      res.json({
        message: "Genres found!",
        status: "200",
        genresFound: true,
        allGenres,
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

const getGenreById = async (req, res) => {
  try {
    var genre_id = req.params.id;
    var genre = await Genre.findById({
      _id: genre_id,
    })

      .then((result) => {
        res.json({
          message: "Genre found!",
          status: "200",
          genre: result,
        });
      })
      .catch((error) => {
        res.json({
          message: "No genre found!",
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
  addGenre,
  deleteGenre,
  updateGenre,
  getAllGenres,
  getGenreById,
};
