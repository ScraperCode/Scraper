const axios = require('axios');
const fs = require('fs');
const path = require('path');

class UnrestrictedAIScraper {
    constructor() {
        this.baseURL = 'https://unrestrictedaiimagegenerator.com';
        this.headers = {
            'authority': 'unrestrictedaiimagegenerator.com',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': 'https://unrestrictedaiimagegenerator.com',
            'priority': 'u=1, i',
            'referer': 'https://unrestrictedaiimagegenerator.com/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        };
        
        this.cookie = this.generateCookies();
        this.headers['cookie'] = this.cookie;
        
        this.session = axios.create({
            baseURL: this.baseURL,
            headers: this.headers,
            withCredentials: true
        });
    }

    generateCookies() {
        const timestamp = Math.floor(Date.now() / 1000);
        const ga1 = `GA1.1.${Math.floor(Math.random() * 1000000000)}.${timestamp}`;
        const ga2 = `GS2.1.s${timestamp}$o1$g1$t${timestamp}$j40$l0$h0`;
        
        return `_ga=${ga1}; _ga_J4MEF7G6YX=${ga2}`;
    }

    async getNonce() {
        const response = await this.session.get('/');
        
        const nonceMatch = response.data.match(/name="_wpnonce" value="([^"]+)"/);
        if (nonceMatch) {
            return nonceMatch[1];
        }
        
        const alternativeMatch = response.data.match(/name="_wpnonce".*?value="([^"]+)"/);
        if (alternativeMatch) {
            return alternativeMatch[1];
        }
        
        return '218155152c';
    }

    async generateImage(prompt, style = 'photorealistic') {
        const nonce = await this.getNonce();
        
        const payload = new URLSearchParams({
            'generate_image': 'true',
            'image_description': prompt,
            'image_style': style,
            '_wpnonce': nonce
        }).toString();

        const response = await this.session.post('/', payload, {
            headers: {
                ...this.headers,
                'content-length': Buffer.byteLength(payload),
                'cookie': this.cookie
            }
        });
        
        const imageUrl = this.extractImageUrl(response.data);
        
        if (imageUrl) {
            const imageInfo = this.extractImageInfo(response.data);
            
            return {
                success: true,
                imageUrl: imageUrl,
                prompt: prompt,
                style: style,
                nonce: nonce,
                info: imageInfo
            };
        } else {
            return {
                success: false,
                error: 'Gambar tidak ditemukan',
                html: response.data.substring(0, 500) + '...'
            };
        }
    }

    extractImageUrl(html) {
        const patterns = [
            /src="([^"]*\/ai-images\/[^"]*\.(?:png|jpg|jpeg|webp))"/i,
            /src="([^"]*\/wp-content\/uploads\/ai-images\/[^"]*\.(?:png|jpg|jpeg|webp))"/i,
            /resultImage.*?src="([^"]+)"/i,
            /src="([^"]*unrestrictedaiimagegenerator_com_ai_[^"]*\.png)"/i
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        const imageRegex = /<img[^>]*src="([^"]*\/ai-images\/[^"]*)"[^>]*>/i;
        const imgMatch = html.match(imageRegex);
        if (imgMatch && imgMatch[1]) {
            return imgMatch[1];
        }

        return null;
    }

    extractImageInfo(html) {
        const info = {
            recentImages: []
        };

        const recentRegex = /<div class="recent-item">[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="recent-item-prompt">([^<]*)<\/div>[\s\S]*?<div class="recent-item-style">([^<]*)<\/div>/gi;
        
        let match;
        while ((match = recentRegex.exec(html)) !== null) {
            info.recentImages.push({
                imageUrl: match[1],
                prompt: match[2],
                style: match[3]
            });
        }

        return info;
    }

    async downloadImage(imageUrl, savePath = './downloads') {
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filePath = path.join(savePath, filename);

        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            headers: {
                'Referer': this.baseURL,
                'User-Agent': this.headers['user-agent']
            }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve(filePath);
            });
            writer.on('error', reject);
        });
    }

    async batchGenerate(prompts, style = 'photorealistic', delay = 2000) {
        const results = [];
        
        for (let i = 0; i < prompts.length; i++) {
            const result = await this.generateImage(prompts[i], style);
            results.push(result);
            
            if (i < prompts.length - 1) {
                await this.sleep(delay);
            }
        }
        
        return results;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const styles = ['photorealistic', 'digital-art', 'impressionist', 'anime', 'fantasy', 'sci-fi', 'vintage'];

(async () => {
    const scraper = new UnrestrictedAIScraper();
    const prompt = 'cat';
    const style = styles[0];
    const data = await scraper.generateImage(prompt, style);
    // if (result.success) {
    //     const downloadedPath = await scraper.downloadImage(result.imageUrl);
    // }
    console.log(JSON.stringify(data, null, 2));
})();
