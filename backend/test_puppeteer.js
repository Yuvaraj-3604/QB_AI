const puppeteer = require('puppeteer');
(async () => {
    console.log('Starting puppeteer test...');
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });
        console.log('Browser launched.');
        const page = await browser.newPage();
        await page.setContent('<h1>Test</h1>');
        const buffer = await page.screenshot({ type: 'png' });
        console.log('Screenshot taken, buffer length:', buffer.length);
        await browser.close();
        console.log('Test completed successfully.');
    } catch (err) {
        console.error('Puppeteer test failed:', err);
    }
})();
