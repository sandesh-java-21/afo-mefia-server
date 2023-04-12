const express = require("express");
const router = express.Router();

const signUrlControllers = require("../controllers/SignUrls");

router.get("/get-signed-url/:media_id", signUrlControllers.signUrl);

module.exports = router;
