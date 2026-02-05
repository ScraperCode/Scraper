const axios = require("axios");

async function songfinder(query) {
  const { data } = await axios.get("https://flac.zumy.dev/api/search", {
    params: {
      q: query,
    },
    headers: {
      "accept": "*/*",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/json",
      "priority": "u=1, i",
      "referer": "https://flac.zumy.dev/",
      "sec-ch-ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36"
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
