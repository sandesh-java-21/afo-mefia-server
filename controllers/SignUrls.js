const MD5 = require("crypto-js/md5");
const Time = new Date();

function signed_url(
  path,
  expires,
  secret = process.env.JW_PLAYER_API_SECRET,
  host = 'https://cdn.jwplayer.com'
) {
  console.log(expires);
  const base = `${path}:${expires}:${secret}`;
  const signature = MD5(base);
  return `${host}/${path}?exp=${expires}&sig=${signature}`;
}

function get_response(mediaid, playerid) {
  const path = `players/${mediaid}-${playerid}.js`;
  let ts = parseInt((Date.now() + 3600) / 1000);
  const expires = ts + 50;//Math.ceil((Time.getTime()/1000 + 3600) / 300) * 300;
  console.log(ts, expires);
  return signed_url(path, expires);
}

const signUrl = async (req, res) => {
  try {
    var media_id = req.params.media_id;
    var response = get_response(media_id, "4t00MwmP");
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
