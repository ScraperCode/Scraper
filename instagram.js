const axios = require('axios');
const FormData = require('form-data');

async function inflact(url) {
    const form = new FormData();
    form.append('url', url);

    const headers = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "multipart/form-data",
    "origin": "https://inflact.com",
    "referer": "https://inflact.com/instagram-downloader/video/",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
    "sec-ch-ua": `"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sentry-trace": "0488c4a157c7491e861e7a8c6ce1dba2-b55a39b5a91647b5-0",
    "baggage": "sentry-environment=production,sentry-public_key=1b282a50293c4c9738e871bb3fadd05c,sentry-trace_id=0488c4a157c7491e861e7a8c6ce1dba2,sentry-sampled=false,sentry-sample_rand=0.6486669557541169,sentry-sample_rate=0",
    "x-client-signature": "89920bc36cc88a8e033f62d4f1ebe221a7c53b3b5ef32836e5196ae6c5be6b3d",
    "x-client-token": "eyJ0aW1lc3RhbXAiOjE3Njc1MDcwMzQsImNsaWVudElkIjoiYWMwY2EwZWQ5ZDJlYTZlMWViNGZjMjcyNGY3NDQwOWMiLCJub25jZSI6Ijk4NTJjYmEyYmZiNDkyMGIyNGIyNjlkMDEwYWYzMzE2In0=",
    "cookie": `_ga=GA1.1.1635932644.1753709572; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Oct+04+2025+19%3A01%3A37+GMT%2B0700+(Western+Indonesia+Time)&version=202409.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=751b5b7d-3c3b-43d1-b6ec-f8d554eec90b&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&intType=3&geolocation=ID%3BJB&AwaitingReconsent=false; OptanonAlertBoxClosed=2025-10-04T12:01:37.558Z; __gads=ID=14e0edf01e74e178:T=1753709582:RT=1759579297:S=ALNI_Ma_iq3-FGjuzPQboYrhebPxp5uuFw; __gpi=UID=000011705516ebee:T=1753709582:RT=1759579297:S=ALNI_MZ8yfXEVZuxiln7GoRqM0rfYh5kJQ; __eoi=ID=670dc6b1daa34b42:T=1753709582:RT=1759579297:S=AA-AfjYxoBxAkWyfYnP9LXpUe63F; _ga_8Z42FRJR0B=GS2.1.s1759579296$o2$g1$t1759579393$j38$l0$h26476166; ingramer_sid=doophhi1pipkv8i5hc0ij7hfl3; move_modal=8f1e82e7d677b8d6604bf6e20b84c4f2ddcd338da20784e2e64b35e6efb2059da%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22move_modal%22%3Bi%3A1%3Bb%3A1%3B%7D; gtm_exp=505d8398cb6e34d5b2bf114213f6b5385a911c3b1c5a25a362cda498e3e406bca%3A2%3A%7Bi%3A0%3Bs%3A7%3A%22gtm_exp%22%3Bi%3A1%3Bs%3A19%3A%22%7B%22AdsProviders3%22%3A2%7D%22%3B%7D; from_landing=21fb3640e438032a01ae19d86f8ad23ba384c0692f22312e7538cf7ab5874468a%3A2%3A%7Bi%3A0%3Bs%3A12%3A%22from_landing%22%3Bi%3A1%3Bs%3A10%3A%22downloader%22%3B%7D; _csrf=707145300c03af5e1d97697e6fb20e53c567f1a6eb353df8ae140eeb974bb63ea%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22x9fYqf3AVFh9PeqHQjBB9XYadrR_gb1W%22%3B%7D; user_timezone=6955b611b116d5b29b93adb8418400d1c3e9dc802d687187112f247d7fa83010a%3A2%3A%7Bi%3A0%3Bs%3A13%3A%22user_timezone%22%3Bi%3A1%3Bs%3A12%3A%22Asia%2FJakarta%22%3B%7D; user:search:history=432141ba0e46e6fef9d8c1f1366c3b8d09c9e5cd7fbda986dd4909a012dc71afa%3A2%3A%7Bi%3A0%3Bs%3A19%3A%22user%3Asearch%3Ahistory%22%3Bi%3A1%3Bs%3A13%3A%22%5B%22bjorka_id%22%5D%22%3B%7D; instagram_downloader=b450c7e7fc5e15875bfc355353bf134a231ee2ba13a85f84c81d08f052f3cb99a%3A2%3A%7Bi%3A0%3Bs%3A20%3A%22instagram_downloader%22%3Bi%3A1%3Bs%3A20%3A%22bjorka_id%7C1767507034%22%3B%7D`
};

    const { data: response } = await axios.post('https://inflact.com/downloader/api/downloader/post/', 
        form, 
        { headers });

    return {
    id: response?.data?.post?.id,
    shortcode: response?.data?.post?.shortcode,
    username: response?.data?.post?.owner?.username,
    caption: response?.data?.post?.edge_media_to_caption?.edges?.[0]?.node?.text,
    taken_at_timestamp: response?.data?.post?.taken_at_timestamp,
    like_count: response?.data?.post?.edge_media_preview_like?.count,
    comment_count: response?.data?.post?.edge_media_to_parent_comment?.count,
    is_video: response?.data?.post?.is_video,
    media_urls: response?.data?.post?.edge_sidecar_to_children?.edges?.map(edge => edge?.node?.url) || [response?.data?.post?.display_url]
};
};

(async () => {
    const data = await inflact('https://www.instagram.com/p/DPWFQ5Hky1O/?utm_source=ig_web_copy_link&igsh=am11azFucmp5bXEz');
    console.log(data);
})();
