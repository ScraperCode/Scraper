const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

class TikTokDownloader {
    constructor() {
        this.baseUrl = 'https://www.tiktok.com/oembed';
        this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    generateHeaders() {
        return {
            'accept': '*/*',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'connection': 'keep-alive',
            'host': 'www.tiktok.com',
            'origin': 'https://snaptik.app',
            'referer': 'https://snaptik.app/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
        };
    }

    async getVideoInfo(videoUrl) {
        const headers = this.generateHeaders();
        
        const params = {
            url: videoUrl
        };

        const response = await axios.get(this.baseUrl, {
            headers,
            params,
            httpsAgent: this.httpsAgent
        });
        
        return response.data;
    }

    async download(videoUrl) {
        const videoInfo = await this.getVideoInfo(videoUrl);
        
        const thumbnailUrl = videoInfo.thumbnail_url;
        const videoId = videoInfo.embed_product_id;
        const author = videoInfo.author_unique_id;
        
        const headers = this.generateHeaders();
        
        const response = await axios.get(thumbnailUrl, {
            headers,
            responseType: 'arraybuffer',
            httpsAgent: this.httpsAgent
        });

        const cleanInfo = { ...videoInfo };
        delete cleanInfo.width;
        delete cleanInfo.height;
        delete cleanInfo.html;

        return {
            success: true,
            videoId: videoId,
            author: author,
            thumbnail: videoInfo.thumbnail_url,
            thumbnailBuffer: response.data,
            contentType: response.headers['content-type'],
            info: cleanInfo
        };
    }
}

(async () => {
    const tiktok = new TikTokDownloader();
    const videoUrl = 'https://www.tiktok.com/@michellekolondam1/video/7561046530191265045';
    
    const result = await tiktok.download(videoUrl);
    console.log(result);
})();
