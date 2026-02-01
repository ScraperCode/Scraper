const axios = require('axios');
const cheerio = require('cheerio');

class MyInstantsScraper {
    constructor(baseUrl = 'https://www.myinstants.com') {
        this.baseUrl = baseUrl;
        this.axiosInstance = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
    }

    async getAllInstantsWithDetails() {
        const url = `${this.baseUrl}/en/index/id/`;
        const { data } = await this.axiosInstance.get(url);
        const $ = cheerio.load(data);
        
        const instants = [];
        
        $('.instant').each((index, element) => {
            const $element = $(element);
            const title = $element.find('.instant-link').text().trim();
            const link = $element.find('.instant-link').attr('href');
            const audioBtn = $element.find('.small-button').attr('onclick');
            let audioUrl = null;
            const match = audioBtn ? audioBtn.match(/play\('([^']+)'\)/) : null;
            audioUrl = match ? this.baseUrl + match[1] : null;
            
            instants.push({
                position: index + 1,
                title,
                url: this.baseUrl + link,
                audioUrl
            });
        });
        
        const detailedInstants = [];
        
        for (const instant of instants) {
            const detailResponse = await this.axiosInstance.get(instant.url);
            const detail$ = cheerio.load(detailResponse.data);
            const detailTitle = detail$('h1').first().text().trim();
            const audioElement = detail$('audio source');
            let detailAudioUrl = audioElement.attr('src');
            detailAudioUrl = detailAudioUrl && !detailAudioUrl.startsWith('http') ? this.baseUrl + detailAudioUrl : detailAudioUrl;
            const downloadBtn = detail$('#instant-page-extra-buttons-container a[download]');
            const downloadUrl = this.baseUrl + downloadBtn.attr('href');
            const shareBtn = detail$('#instant-page-extra-buttons-container button.webshare');
            const shareOnclick = shareBtn.attr('onclick');
            const shareMatch = shareOnclick ? shareOnclick.match(/share\('([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/) : null;
            const shareData = shareMatch ? {
                title: shareMatch[1],
                url: shareMatch[2],
                audioPath: `${this.baseUrl}` + shareMatch[3],
                slug: shareMatch[4]
            } : null;
            const copyLinkBtn = detail$('#instant-page-extra-buttons-container button[onclick*="copyInstantLink"]');
            const copyOnclick = copyLinkBtn.attr('onclick');
            const copyMatch = copyOnclick ? copyOnclick.match(/copyInstantLink\(([^,]+),\s*'([^']+)'\)/) : null;
            const copyLinkData = copyMatch ? {
                url: copyMatch[1].trim().replace(/window\.location\.toString\(\)/, `'${instant.url}'`),
                slug: copyMatch[2]
            } : null;
            const reportLink = detail$('#instant-page-extra-buttons-container a[href*="/report/"]');
            const reportUrl = this.baseUrl + reportLink.attr('href');
            const addToSoundboardLink = detail$('#instant-page-extra-buttons-container a[href*="/add/"]');
            const addToSoundboardUrl = this.baseUrl + addToSoundboardLink.attr('href');
            
            detailedInstants.push({
                position: instant.position,
                title: detailTitle || instant.title,
                url: instant.url,
                audioUrl: detailAudioUrl || instant.audioUrl,
                downloadUrl,
                buttons: {
                    share: shareData,
                    copyLink: copyLinkData,
                    reportUrl,
                    addToSoundboardUrl
                },
            });
        };
        return detailedInstants;
    };
};

(async () => {
    const scraper = new MyInstantsScraper();
    const results = await scraper.getAllInstantsWithDetails();
    console.log(JSON.stringify(results, null, 2));
})();
