const axios = require('axios');
const FormData = require('form-data');

async function teraboxdl(urls) {
  const form = new FormData();
  form.append('action', 'terabox_fetch');
  form.append('url', urls);
  form.append('nonce', '96dddaff35');
  const response = await axios.post('https://terabxdownloader.org/wp-admin/admin-ajax.php', form , {
    headers: {
      "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
      "accept": "*/*",
      "cookie": "_ga_L80XY6CXF1=GS2.1.s1767833860$o1$g0$t1767833860$j60$l0$h0; _ga=GA1.1.1857661406.1767833861",
      "referer": "https://terabxdownloader.org/",
      "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest"
    },
  });

  const result = response.data;
  const data = result.data;
  
  const files = data['📄 Files'] || [];
  
  return {
    status: data['✅ Status'] || "Unknown",
    files: files.map(f => ({
      name: f['📂 Name'] || "",
      downloadLink: f['🔽 Direct Download Link'] || "",
      size: f['📏 Size'] || ""
    })),
    shortLink: data['🔗 ShortLink'] || ""
  };
}

(async () => {
  const data = await teraboxdl('https://www.terabox.com/indonesian/sharing/link?surl=9Oa_cfmGq5CSmmJo2GRDng');
  console.log(data);
})();
