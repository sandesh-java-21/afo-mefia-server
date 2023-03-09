const e = require("express");
const express = require("express");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();

const morgan = require("morgan");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));

const movieRoutes = require("./routes/Movie");

app.use("/api/movie", movieRoutes);

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
