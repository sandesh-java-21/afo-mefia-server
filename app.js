const express = require("express");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();

const morgan = require("morgan");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.json());

const cors = require("cors");

app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));

app.use(cors());

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

var DB_URL = process.env.DB_URL;

io.on("connection", () => {
  console.log("user connected!");
});

server.listen(4000, (err) => {
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
