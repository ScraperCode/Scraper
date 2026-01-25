const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNHentaiSearch(query) {
    const url = `https://nhentai.net/search/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const results = [];

    $('.gallery').each((index, element) => {
        const gallery = $(element);
        
        const link = gallery.find('.cover').attr('href');
        const id = link ? link.split('/')[2] : null;
        
        const title = gallery.find('.caption').text().trim();
        const thumbnail = gallery.find('img').attr('data-src') || gallery.find('img').attr('src') || gallery.find('img').attr('data-cfsrc');
        
        const tags = [];
        gallery.find('.tags span.name').each((i, tagElement) => {
            tags.push($(tagElement).text().trim());
        });

        if (id) {
            results.push({
                id,
                title,
                thumbnail: thumbnail ? thumbnail.replace(/^\/\//, 'https://') : null,
                tags,
                url: `https://nhentai.net/g/${id}`
            });
        }
    });

    return results;
}

async function scrapeNHentaiDetail(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const title = $('h1.title').text().trim();
    const japaneseTitle = $('h2.title').text().trim();
    
    const pages = [];
    $('.gallerythumb img').each((index, element) => {
        const img = $(element);
        const src = img.attr('data-src') || img.attr('src');
        pages.push(src ? src.replace(/^\/\//, 'https://') : null);
    });

    const tags = {};
    $('.tag-container').each((index, element) => {
        const container = $(element);
        const category = container.find('.name').text().trim().replace(':', '');
        const tagItems = [];
        
        container.find('.tags a').each((i, tagElement) => {
            tagItems.push($(tagElement).text().trim());
        });
        
        if (category && tagItems.length > 0) {
            tags[category.toLowerCase()] = tagItems;
        }
    });

    return {
        title,
        japaneseTitle,
        pages,
        tags,
        totalPages: pages.length
    };
}

(async() {
    const results = await scrapeNHentaiSearch('elaina di ewe gojo');
    console.log(results);
})();
