const express = require("express");

const router = express.Router();

const adminControllers = require("../controllers/Admin");

router.get("/get-movie-list", adminControllers.getMovieList);

module.exports = router;
