const express = require("express");

const router = express.Router();

const mediaControllers = require("../controllers/Media");

router.post("/create-media", mediaControllers.createMedia);
router.patch("/upload-media/:general_content_id", mediaControllers.uploadMedia);

module.exports = router;
