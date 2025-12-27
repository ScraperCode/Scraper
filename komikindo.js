/*
- [ KomikIndo ]
- Created: Rizki
- Base: https://komikindo.ch
- Channel: https://whatsapp.com/channel/0029VaxtSLDGZNCjvEXsw93f
*/
const axios = require("axios");
const cheerio = require("cheerio");

async function searchKomik(query) {
  const { data: html } = await axios.get("https://komikindo.ch", {
    params: {
      s: query,
    },
  });
  const $ = cheerio.load(html);
  let result = [];

  $(".animposx").each((_, i) => {
    const title = $(i).find("h3").text().trim();
    const imageUrl = $(i).find("img").attr("src");
    const rating = $(i).find(".rating").text().trim();
    const linkKomik = $(i).find(".tt > h3 > a").attr("href");

    result.push({
      title,
      imageUrl,
      rating,
      linkKomik,
    });
  });
  return result;
}

async function getDetail(url) {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const title = $('meta[property="og:title"]').attr('content') || 
                $('title').text().trim();
  const imageUrl = $(".thumb img").attr("src");
  const rating = $(".rating").text().trim().match(/\d+/)?.[0] || "N/A";

  let detailArray = [];
  $(".spe span").each((_, i) => {
    const text = $(i).text().trim().replace(/\s+/g, " ").trim();
    const parts = text.split(":");
    if (parts.length >= 2) {
      const value = parts.slice(1).join(":").trim();
      detailArray.push(value);
    }
  });

  return [
    {
      title: title,
      imageUrl: imageUrl,
      rating: rating,
      linkKomik: url,
      judulAlternatif: detailArray[0] || "",
      status: detailArray[1] || "",
      pengarang: detailArray[2] || "",
      ilustrator: detailArray[3] || "",
      grafis: detailArray[4] || "",
      tema: detailArray[5] || "",
      jenisKomik: detailArray[6] || "",
      official: detailArray[7] || "",
      informasi: detailArray[8] || "",
    },
  ];
}

(async () => {
  const searchResults = await searchKomik("return of top class master");
  const firstKomik = searchResults[0];
  const detailResult = await getDetail(firstKomik.linkKomik);
  console.log(detailResult);
})();

