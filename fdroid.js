const axios = require("axios");
const cheerio = require("cheerio");

const SEARCH_URL = "https://search.f-droid.org";
const headers = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "priority": "u=0, i",
  "referer": "https://f-droid.org/",
  "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
};

async function search(query) {
  const { data: html } = await axios.get(
    SEARCH_URL,
    {
      params: {
        q: query,
        lang: "id",
      },
    },
    { headers }
  );
  const $ = cheerio.load(html);

  let results = [];

  $("a.package-header").each((i, v) => {
    const url = $(v).attr("href");

    results.push({
      url,
    });
  });
  return results;
};

async function details(url) {
  const { data: html } = await axios.get(url, { headers });

  const $ = cheerio.load(html);

  return {
    name: $("h3.package-name").text().replace(/\s+/g, " ").trim(),
    summary: $(".package-summary").text().replace(/\s+/g, " ").trim(),
    icon: new URL($("img.package-icon").attr("src"), "https://f-droid.org").href,
    description: $(".package-description").text().replace(/\s+/g, " ").trim(),
    website: $("#website a").attr("href") || null,
    source: $("#source_code a").attr("href") || null,
    version: $('.package-version')
    .first()
    .find('a[name]')
    .eq(1)
    .attr('name'),
    apkUrl: $(".package-version#latest .package-version-download a")
      .first()
      .attr("href"),
  };
};

(async () => {
    const data = await search('Termux');
    let load = data?.[0]?.url;
    await new Promise(resolve => setTimeout(resolve, 3000));
    let result = await details(load);
    console.log(result);
})();
