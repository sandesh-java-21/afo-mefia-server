const express = require("express");

const router = express.Router();

const homeControllers = require("../controllers/Home");

router.post(
  "/get-mix-content/:genre_id/:language_code",
  homeControllers.getMixContentByGenreId
);

module.exports = router;
