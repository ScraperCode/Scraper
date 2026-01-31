const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

async function bypass() {
    const response = await axios.get('https://www.ikyiizyy.my.id/tools/cloudflare-bypass?apikey=new&url=https://x2twitter.com');
    return response?.data?.result?.token || null;
}

function extractDownloadLinks(html) {
    const results = [];
    
    const regex = /href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)"/g;
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
        results.push({
            type: 'download',
            url: match[1]
        });
    }
    
    let imgMatch;
    while ((imgMatch = imageRegex.exec(html)) !== null) {
        if (imgMatch[1].includes('pbs.twimg.com')) {
            results.push({
                type: 'preview',
                url: imgMatch[1],
                filename: imgMatch[1].split('/').pop()
            });
        }
    }
    
    const scriptRegex = /k_url_convert\s*=\s*"([^"]+)"[^]*?k_exp\s*=\s*"([^"]+)"[^]*?k_token\s*=\s*"([^"]+)"/s;
    const scriptMatch = html.match(scriptRegex);
    if (scriptMatch) {
        results.push({
            type: 'api_config',
            convert_url: scriptMatch[1],
            exp: scriptMatch[2],
            token: scriptMatch[3]
        });
    }
    
    return results;
};

async function x2twitter(url) {
    const cftoken = await bypass();
    if (!cftoken) throw new Error('Failed to get bypass token');
    
    const generateCookie = () => {
        return {
            _ga: `GA1.1.${crypto.randomBytes(8).toString('hex')}.${Math.floor(Date.now() / 1000)}`,
            _gid: `GA1.2.${crypto.randomBytes(8).toString('hex')}.${Math.floor(Date.now() / 1000)}`,
            _gat: '1',
            __gads: `ID=${crypto.randomBytes(16).toString('hex')}`,
            __gpi: `UID=${crypto.randomBytes(8).toString('hex')}`
        };
    };

    const cookies = generateCookie();
    const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

    const formData = new FormData();
    formData.append('q', url);
    formData.append('lang', 'id');
    formData.append('cftoken', cftoken);

    const headers = {
        'authority': 'x2twitter.com',
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'cookie': cookieString,
        'origin': 'https://x2twitter.com',
        'referer': 'https://x2twitter.com/id3',
        'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
    };

    const response = await axios.post('https://x2twitter.com/api/ajaxSearch', formData, {
        headers: {
            ...headers,
            ...formData.getHeaders()
        }
    });

    const downloadLinks = extractDownloadLinks(response.data.data);
    
    const twitterIdMatch = response.data.data.match(/id="TwitterId" value="([^"]+)"/);
    const twitterId = twitterIdMatch ? twitterIdMatch[1] : null;

    return {
        status: response.data.status,
        twitter_id: twitterId,
        download_links: downloadLinks,
    };
}

(async () => {
        const url = 'https://x.com/rubudsa/status/2017395076662759726?s=20';
        const result = await x2twitter(url);
        console.log(result);
})();
