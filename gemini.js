const axios = require("axios");

class Gemini {
  constructor() {
    this.baseURL = "https://labs.shannzx.xyz";
    this.models = {
      "gemini-3-flash-preview": "Gemini 3.0 Flash",
      "gemini-2-5-flash": "Gemini 2.5 Flash", 
      "gemini-2-5-flash-lite": "Gemini 2.5 Flash Lite",
    };
  }

  async sendMessage(message, model = "gemini-3-flash-preview") {
    if (!this.models[model]) {
      throw new Error(
        `Model tidak valid. Pilihan: ${Object.keys(this.models).join(", ")}`,
      );
    }

    const headers = {
      accept: "text/x-component",
      "content-type": "text/plain;charset=UTF-8",
      "next-action": "92d0653dd8223b77442ce76e19b5f956b79afc21",
      "next-router-state-tree":
        "%5B%22%22%2C%7B%22children%22%3A%5B%22chat%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
      origin: "https://labs.shannzx.xyz",
      referer: "https://labs.shannzx.xyz/chat",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
    };

    const response = await axios.post(
      `${this.baseURL}/chat`,
      [message, [], [], model],
      { headers }
    );

    return this.parseResponse(response.data);
  }

  parseResponse(data) {
    const lines = data.split("\n");
    let jsonData = null;
    
    for (const line of lines) {
      if (line.trim() === "") continue;
      
      if (line.includes('"status"') && line.includes('"reply"') && line.includes('"model_used"')) {
        const cleanLine = line.replace(/^[^{]*/, '').replace(/}[^}]*$/, '}');
        
        try {
          jsonData = JSON.parse(cleanLine);
          break;
        } catch (e) {
          continue;
        }
      }
    }
    
    if (!jsonData) {
      for (const line of lines) {
        const match = line.match(/{[^}]*"status"[^}]*}/);
        if (match) {
          try {
            jsonData = JSON.parse(match[0]);
            break;
          } catch (e) {
            continue;
          }
        }
      }
    }
    
    return jsonData || { status: false, model_used: "", reply: "" };
  }

  cleanHTML(text) {
    if (!text) return "";
    return text
      .replace(/<Title>/g, "# ")
      .replace(/<\/Title>/g, "\n")
      .replace(/<SubTitle>/g, "## ")
      .replace(/<\/SubTitle>/g, "\n")
      .replace(/<ListDot>/g, "• ")
      .replace(/<\/ListDot>/g, "\n")
      .replace(/<Bold>/g, "**")
      .replace(/<\/Bold>/g, "**")
      .replace(/<CodeMini>/g, "`")
      .replace(/<\/CodeMini>/g, "`")
      .replace(/<Important>/g, "> ")
      .replace(/<\/Important>/g, "\n")
      .replace(/<thoughtSignature>\$2<\/thoughtSignature>/g, "")
      .trim();
  }
}

(async () => {
  const chat = new Gemini();
  const result = await chat.sendMessage("halo", "gemini-3-flash-preview");
  console.log(chat.cleanHTML(result.reply));
})();
