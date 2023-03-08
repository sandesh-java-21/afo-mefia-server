const e = require("express");
const express = require("express");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const videoUploadRoutes = require("./routes/Videos");
app.use("/api/video", videoUploadRoutes);

var DB_URL = process.env.DB_URL;

app.listen(4000, (err) => {
  if (err) {
    console.log("Error Occurred: ", err);
  } else {
    console.log("Stream It API is running . . .");

    mongoose
      .connect(`${DB_URL}`)
      .then((res) => console.log("Stream It Database Connection Established!"))
      .catch((error) =>
        console.log("Error Occurred While Establishing Connection: ", error)
      );
  }
});
