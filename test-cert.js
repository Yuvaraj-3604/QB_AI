const { generateCertificatePdf } = require('./backend/utils/certificate');

(async () => {
    try {
        const buf = await generateCertificatePdf('<h1>Test</h1>');
        console.log('Success, length:', buf.length);
        console.log('Buffer type:', Buffer.isBuffer(buf), buf.constructor.name);
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
})();
