const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'DhandiAdamDosen@gmail.com');
        await page.type('input[type="password"]', ';E:z1!eD3T}A');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
        
        await page.waitForSelector('.group.cursor-pointer', { timeout: 10000 });
        
        await page.evaluate(() => {
            const groups = [...document.querySelectorAll('div')].filter(el => el.innerText?.includes('Grup Investigasi'));
            if(groups.length > 0) groups[groups.length - 1].click();
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        await page.evaluate(() => {
            const header = document.querySelector('div.bg-\\[\\#f0f2f5\\].border-b.border-\\[\\#d1d7db\\]');
            if(header) header.click();
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        const sheetInfo = await page.evaluate(() => {
            const sheet = document.querySelector('[data-slot="sheet-content"]');
            if (!sheet) return 'NOT FOUND';
            
            const style = window.getComputedStyle(sheet);
            return {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                width: style.width,
                transform: style.transform,
                right: style.right,
                zIndex: style.zIndex,
                html: sheet.innerHTML.substring(0, 500)
            };
        });
        
        console.log('SHEET INFO:', sheetInfo);
        
        await browser.close();
    } catch(err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
})();
