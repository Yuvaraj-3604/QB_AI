const { generateCertificatePdf } = require('./utils/certificate');

(async () => {
    try {
        const buf = await generateCertificatePdf('<h1>Test</h1>');
        console.log('Success, buffer length:', buf.length);
        console.log('Buffer type:', Buffer.isBuffer(buf), buf.constructor.name);
    } catch (e) {
        console.error('Generation Error:', e);
    }
    process.exit(0);
})();
