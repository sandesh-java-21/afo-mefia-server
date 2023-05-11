const express = require("express");
const mongoose = require('mongoose')
const dotenv = require("dotenv").config();

const morgan = require("morgan");
const cors = require("cors");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

var DB_URL = process.env.DB_URL;
// console.log(DB_URL);
mongoose
  .connect(`${DB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(data => { console.log('Database Connected'); })
  .catch(err => { console.log("Error Occurred While Establishing Connection: ", err) })


app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));

// app.use(cors());

const allRoutes = require("./routes/index");

app.use("/api", allRoutes);

// const movieRoutes = require("./routes/Movie");
// const thumbnailRoutes = require("./routes/Thumnail");
// const subtitlesRoutes = require("./routes/Subtitles");
// const audioTracksRoutes = require("./routes/AudioTracks");
// const slidersRoutes = require("./routes/Sliders");
// const genreRoutes = require("./routes/Genres");
// const generalContentRoutes = require("./routes/GeneralContent");

// app.use("/api/movie", movieRoutes);
// app.use("/api/thumbnail", thumbnailRoutes);
// app.use("/api/subtitles", subtitlesRoutes);
// app.use("/api/audio", audioTracksRoutes);
// app.use("/api/sliders", slidersRoutes);
// app.use("/api/genre", genreRoutes);
// app.use("/api/general-content", generalContentRoutes);

io.on("connection", () => {
  console.log("user connected!");
});

server.listen(3005, (err) => {
  if (err) {
    console.log("Error Occurred: ", err);
  } else {
    console.log("Stream It API is running . . .");
  }
});
