const axios = require("axios");

async function songfinder(query) {
  const { data } = await axios.get("https://flac.zumy.dev/api/search", {
    params: {
      q: query,
    },
    headers: {
      "user-agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
      accept: "*/*",
      "content-type": "application/json",
      "sec-ch-ua":
        '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      referer: "https://flac.zumy.dev/",
    },
  });
  const tracks = data.data.tracks;

  const results = tracks
    .map((track) => {
      return {
        album: track.album_name || "",
        artis: track.artists || "",
        duration: track.duration_ms || 0,
        name: track.name || "",
        id: track.id || "",
        spotify_id: track.spotify_id || "",
        images: track.images || "",
        item_type: track.item_type || "",
      };
    })
    .filter((result) => result !== null);
  return results;
}
(async () => {
  const data = await songfinder('terpaksa');
  console.log(data);
})();
