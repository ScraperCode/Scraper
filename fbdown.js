const axios = require('axios');
const crypto = require('crypto');

function generateSaveFBSCookies() {
    const timestamp = Math.floor(Date.now() / 1000);
    const random1 = crypto.randomBytes(8).toString('hex');
    
    const cookies = [
        `_ga_6LKB37X4CF=GS2.1.s${timestamp}$o1$g0$t${timestamp}$j60$l0$h0`,
        `_ga=GA1.1.${crypto.randomInt(100000000, 999999999)}.${timestamp}`,
        `fpestid=${crypto.randomBytes(32).toString('hex').toUpperCase()}`,
        `FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%22${crypto.randomBytes(16).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(12).toString('hex')}%5C%22%2C%5B${timestamp}000000%2C${crypto.randomInt(100000000, 999999999)}%5D%5D%22%5D%5D%5D`,
        `FCNEC=%5B%5B%22${Buffer.from(crypto.randomBytes(50)).toString('base64')}%22%5D%5D`
    ];
    
    return cookies.join('; ');
}

async function downloadFacebookVideoSaveFBS(fbUrl) {
    const payload = {
        vid: fbUrl,
        prefix: "savefbs.com",
        ex: "tik_ytb_ig_tw_pin",
        format: ""
    };

    const headers = {
        'authority': 'savefbs.com',
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'cookie': generateSaveFBSCookies(),
        'origin': 'https://savefbs.com',
        'priority': 'u=1, i',
        'referer': 'https://savefbs.com/',
        'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
    };
        const response = await axios.post('https://savefbs.com/api/v1/aio/html', payload, {
            headers: headers,
            timeout: 30000
        });
        
        return parseDownloadLinks(response.data);
}

function parseDownloadLinks(html) {
    const hdMatch = html.match(/href="([^"]+)"[^>]*\s*class="[^"]*download-btn[^"]*"[^>]*>\s*Download\s*\(HD\)/s);
    const sdMatch = html.match(/href="([^"]+)"[^>]*\s*class="[^"]*download-btn[^"]*"[^>]*>\s*Download\s*\(SD\)/s);
    const titleMatch = html.match(/<h3[^>]*>([^<]+)<\/h3>/);
    const ownerMatch = html.match(/<strong>Owner:<\/strong>\s*([^<]+)/);
    const thumbnailMatch = html.match(/src="([^"]+)"[^>]*alt="[^"]*"/);
    
    return {
        title: titleMatch ? titleMatch[1].trim() : 'Facebook Video',
        owner: ownerMatch ? ownerMatch[1].trim() : 'Unknown',
        thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
        hd: hdMatch ? decodeURIComponent(hdMatch[1]) : null,
        sd: sdMatch ? decodeURIComponent(sdMatch[1]) : null,
    };
}

(async () => {
    const fbUrl = 'https://www.facebook.com/facebook/videos/10153231379946729/';
    const result = await downloadFacebookVideoSaveFBS(fbUrl);
    console.log(JSON.stringify(result, null, 2));
})();
