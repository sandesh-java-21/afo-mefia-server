const MD5 = require("crypto-js/md5");
const Time = new Date();

function signed_url(
  path,
  expires = 10000,
  secret = process.env.JW_PLAYER_API_KEY,
  host = "https://cdn.jwplayer.com"
) {
  const base = `${path}:${expires}:${secret}`;
  const signature = MD5(base);
  return `${host}/${path}?exp=${expires}&sig=${signature}`;
}

function get_response(mediaid, playerid) {
  const path = `players/${mediaid}-${playerid}.js`;
  const expires = Math.ceil((Time.getTime() + 3600) / 300) * 300;
  return signed_url(path, expires);
}

const signUrl = async (req, res) => {
  try {
    var media_id = req.params.media_id;

    console.log("media id: ", media_id);

    var response = get_response(media_id, "P6dCVDaO");
    res.json({
      message: "Signed URL Generated!",
      status: "200",
      signed_url: response,
    });
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  signUrl,
};
