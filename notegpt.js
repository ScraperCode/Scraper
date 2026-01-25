const axios = require('axios');

class NoteGPTChat {
    constructor() {
        this.base = 'https://notegpt.io';
        this.streamUrl = 'https://notegpt.io/api/v2/chat/stream';
        
        this.conversationId = this.makeId();
        this.cookie = this.makeCookie();
        
        this.headers = {
            'authority': 'notegpt.io',
            'accept': '*/*',
            'content-type': 'application/json',
            'origin': 'https://notegpt.io',
            'referer': 'https://notegpt.io/ai-chat',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'cookie': this.cookie
        };
    }

    makeId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    makeCookie() {
        const anonId = this.makeId();
        const sbox = Buffer.from(`${Math.floor(Date.now()/1000)}|907803882`).toString('base64');
        const gid = `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now()/1000)}`;
        const ga = `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now()/1000 - 2592000)}`;
        
        return `anonymous_user_id=${anonId}; sbox-guid=${sbox}; _gid=${gid}; _ga=${ga}`;
    }

    async chat(message, options = {}) {
        const payload = {
            message: message,
            language: options.lang || 'id',
            model: options.model || 'gpt-4.1-mini',
            tone: options.tone || 'default',
            length: options.length || 'moderate',
            conversation_id: options.convId || this.conversationId
        };
        
        const res = await axios.post(this.streamUrl, payload, { headers: this.headers });
        
        const lines = res.data.split('\n');
        const texts = [];
        
        lines.forEach(line => {
            if (line.startsWith('data: ')) {
                const data = line.substring(6);
                if (data.trim()) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.text) {
                            texts.push(parsed.text);
                        }
                    } catch {}
                }
            }
        });
        
        return {
            success: true,
            response: texts.join(''),
            convId: payload.conversation_id
        };
    }
}

(async () => {
    const ai = new NoteGPTChat();
    const result = await ai.chat('apakah bahlil termasuk instrument?');
    console.log(result.response);
})();
