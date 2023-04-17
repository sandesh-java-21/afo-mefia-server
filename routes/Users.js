const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/Users");
const historyControllers = require("../controllers/History");

router.patch(
  "/upload-profile-picture/:user_id",
  userControllers.uploadProfileImage
);

router.put(
  "/update-profile-picture/:user_id",
  userControllers.updateProfilePicture
);

router.post("/add-to-history/:user_id", historyControllers.addToHistory);

module.exports = router;
