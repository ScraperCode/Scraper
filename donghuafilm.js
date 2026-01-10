const axios = require("axios");
const cheerio = require("cheerio");

async function donghua(search) {
  const { data: html } = await axios.get("https://donghuafilm.com/", {
    params: {
      s: search,
    },
  });
  const $ = cheerio.load(html);

  let result = [];

  $("article.bs").each((i, v) => {
    const $article = $(v);
    const $link = $article.find('a[itemprop="url"]');

    const sigma = {
      title: $link.attr("title") || "",
      url: $link.attr("href") || "",
      image:
        $article.find("img").attr("data-src") ||
        $article.find("img").attr("data-lazy-src") ||
        $article.find("img").attr("data-original") ||
        $article.find("img").attr("src") ||
        "",
      type: $article.find(".typez").text().trim() || "",
      status: $article.find(".status, .epx").first().text().trim() || "",
      isHot: $article.find(".hotbadge").length > 0,
      subDub: $article.find(".sb").text().trim() || "",
      displayTitle:
        $article.find(".tt").contents().first().text().trim() ||
        $article.find('h2[itemprop="headline"]').text().trim(),
    };

    result.push(sigma);
  });

  return result;
}

async function detail(url) {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const getImageSrc = (selector) => {
    const $img = $(selector);
    return $img.attr("data-src") || $img.attr("src") || "";
  };

  const description =
    $(".desc").text().trim() ||
    $(".info-content .desc").text().trim() ||
    $(".ninfo .desc").text().trim() ||
    $(".infox .desc").text().trim();

  const details = {
    title: $(".entry-title").text().trim(),
    description: description,
    coverImage: getImageSrc(".bigcover img"),
    thumbnail: getImageSrc(".thumb img"),
    status: $('span:contains("Status:")').next().text().trim(),
    network: $('span:contains("Network:") a').text().trim(),
    studio: $('span:contains("Studio:") a').text().trim(),
    duration: $('span:contains("Duration:")')
      .text()
      .replace("Duration:", "")
      .trim(),
    country: $('span:contains("Country:") a').text().trim(),
    type: $('span:contains("Type:")').text().replace("Type:", "").trim(),
    fansub: $('span:contains("Fansub:")').text().replace("Fansub:", "").trim(),
    censor: $('span:contains("Censor:")').text().replace("Censor:", "").trim(),
    postedBy: $(".author .fn").text().trim(),
    releasedDate: $('time[itemprop="datePublished"]').text().trim(),
    updatedDate: $('time[itemprop="dateModified"]').text().trim(),
    genres: [],
    synopsis: $(".entry-content p").text().trim(),
    episodes: [],
  };

  $(".genxed a").each((i, v) => {
    details.genres.push($(v).text().trim());
  });

  $(".eplister li").each((i, v) => {
    const episode = {
      number: $(v).find(".epl-num").text().trim(),
      title: $(v).find(".epl-title").text().trim(),
      subtitleType: $(v).find(".epl-sub .status").text().trim(),
      date: $(v).find(".epl-date").text().trim(),
      url: $(v).find("a").attr("href") || "",
    };
    details.episodes.push(episode);
  });

  return details;
}

// (async () => {
//   const hasil = await donghua('soul');
//   console.log(hasil);
// })();

(async () => {
  const hasil = await detail(
    "https://donghuafilm.com/anime/twin-martial-soul/"
  );
  console.log(hasil);
})();
