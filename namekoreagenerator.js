const puppeteer = require('puppeteer');

async function getKoreanName(customName = '') {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    page.setDefaultNavigationTimeout(15000);
    
    try {
        await page.goto('https://namegenerators.com/id/korean/', {
            waitUntil: 'domcontentloaded'
        });
    } catch (error) {
    }
    
    const result = await page.evaluate((inputName) => {
        const nameInput = document.getElementById('name');
        const generateBtn = document.getElementById('generate');
        const resultDiv = document.getElementById('result');
        const genderSwitch = document.getElementById('gender-switch');
        
        if (!nameInput || !generateBtn || !resultDiv) {
            return { name: 'Elements not found', gender: 'unknown' };
        }
        
        if (inputName && inputName.trim() !== '') {
            nameInput.value = inputName;
        }
        
        let gender = 'random';
        if (genderSwitch) {
            if (genderSwitch.className.includes('g1')) gender = 'male';
            if (genderSwitch.className.includes('g2')) gender = 'female';
        }
        
        generateBtn.click();
        
        return new Promise(resolve => {
            let attempts = 0;
            const maxAttempts = 30;
            
            const checkInterval = setInterval(() => {
                attempts++;
                const currentText = resultDiv.textContent.trim();
                
                if (currentText !== '👇' && currentText !== '') {
                    clearInterval(checkInterval);
                    resolve({ 
                        name: currentText, 
                        gender: gender,
                        input: inputName 
                    });
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    resolve({ 
                        name: 'Timeout', 
                        gender: gender,
                        input: inputName 
                    });
                }
            }, 100);
        });
    }, customName);
    
    await browser.close();
    return result;
}

(async () => {
    const result = await getKoreanName('Rizki');
    console.log([result]);
})();
