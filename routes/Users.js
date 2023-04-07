const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/Users");

router.patch(
  "/upload-profile-picture/:user_id",
  userControllers.uploadProfileImage
);

router.put(
  "/update-profile-picture/:user_id",
  userControllers.updateProfilePicture
);

module.exports = router;
