const express = require("express");

const router = express.Router();

const genreControllers = require("../controllers/Genre");

router.get("/get-genre/:id", genreControllers.getGenreById);

router.post("/add-genre", genreControllers.addGenre);

router.delete("/delete-genre/:id", genreControllers.deleteGenre);

router.put("/update-genre/:id", genreControllers.updateGenre);

router.get("/get-all-genres", genreControllers.getAllGenres);

router.patch("/enable-genre/:genre_id", genreControllers.enableGenre);

router.patch("/disable-genre/:genre_id", genreControllers.disableGenre);

module.exports = router;
