const axios = require('axios');

async function viderAi(prompt) {
    const { data } = await axios.post('https://api.vider.ai/api/freev1/task_create/free-ai-image-generator', {
        params: {
            model: "free-ai-image-generator",
            image: "",
            aspectRatio: 1,
            prompt: prompt
        }
    }, {
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://vider.ai"
        }
    });
    return data?.data?.taskId;
};

async function image(id) {
    const { data: response } = await axios.get(`https://api.vider.ai/api/freev1/task_get/${id}`, {
        headers: {
            "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
            "accept": "*/*",
            "origin": "https://vider.ai"
        },
    });
    
    return {
        finished: response?.data?.finish === 1,
        url: response?.data?.result?.file_url,
        data: response?.data
    };
};

(async () => {
    const data = await viderAi('Girls');
    await new Promise(resolve => setTimeout(resolve, 60000));
    let result = await image(data);
    let attempts = 0;
    while (!result.url && attempts < 10) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 15000));
        result = await image(data); 
    }
    console.log(result?.data?.result);
})();
