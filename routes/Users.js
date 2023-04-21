const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/Users");
const historyControllers = require("../controllers/History");
const favoriteControllers = require("../controllers/Favorites");
const watchListControllers = require("../controllers/WatchLists");

router.patch(
  "/upload-profile-picture/:user_id",
  userControllers.uploadProfileImage
);

router.put(
  "/update-profile-picture/:user_id",
  userControllers.updateProfilePicture
);

router.post("/add-to-history/:user_id", historyControllers.addToHistory);

router.post("/add-to-favorite/:user_id", favoriteControllers.addToFavorite);

router.post("/add-to-watch-list/:user_id", watchListControllers.addToWatchList);

module.exports = router;
