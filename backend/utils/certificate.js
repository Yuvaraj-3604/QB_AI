const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Cache the logo base64
let logoBase64 = '';
try {
    const logoGap = path.join(__dirname, 'logo.png');
    if (fs.existsSync(logoGap)) {
        logoBase64 = fs.readFileSync(logoGap).toString('base64');
    }
} catch (err) {
    console.error('Failed to load logo for certificate:', err);
}

function buildCertificateHtml(participantName, eventTitle, completionDate, hostName, certId) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background-color: #fcfcfc;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .outer-border {
            width: 1020px;
            height: 720px;
            padding: 20px;
            text-align: center;
            border: 15px solid #1a365d;
            background-color: white;
            position: relative;
            box-sizing: border-box;
        }
        .inner-border {
            width: 100%;
            height: 100%;
            padding: 40px;
            border: 5px solid #d4af37;
            box-sizing: border-box;
            background-image: radial-gradient(circle, #fff 0%, #f9f9f9 100%);
            position: relative;
        }
        .certificate-header {
            color: #1a365d;
            font-size: 50px;
            margin-top: 20px;
            letter-spacing: 5px;
            text-transform: uppercase;
        }
        .certificate-subtitle {
            font-size: 22px;
            font-style: italic;
            color: #666;
            margin-bottom: 30px;
        }
        .presented-to {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
        }
        .participant-name {
            font-size: 64px;
            font-weight: bold;
            color: #d4af37;
            margin: 20px 0;
            display: inline-block;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 10px;
            min-width: 400px;
        }
        .event-info {
            font-size: 20px;
            color: #444;
            line-height: 1.6;
            margin: 30px auto;
            max-width: 700px;
        }
        .event-title {
            font-weight: bold;
            color: #1a365d;
            font-size: 26px;
        }
        .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-around;
            padding: 0 50px;
        }
        .signature-block {
            text-align: center;
            width: 250px;
        }
        .signature-graphic {
            font-family: 'Great Vibes', cursive;
            font-size: 32px;
            color: #1a365d;
            margin-bottom: -10px;
            height: 40px;
        }
        .signature-line {
            border-top: 1px solid #1a365d;
            margin-bottom: 10px;
        }
        .signature-name {
            font-weight: bold;
            color: #1a365d;
            font-size: 18px;
        }
        .signature-title {
            font-size: 14px;
            color: #777;
        }
        .seal {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 120px;
            background: #d4af37;
            border-radius: 50%;
            opacity: 0.2;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 40px;
            color: white;
            z-index: 0;
        }
        .cert-id {
            position: absolute;
            bottom: 10px;
            right: 40px;
            font-size: 12px;
            color: #999;
            font-family: monospace;
        }
        .logo-container {
            position: absolute;
            top: 40px;
            left: 40px;
            width: 150px;
            text-align: left;
        }
        .logo-container img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="outer-border">
        <div class="inner-border">
            ${logoBase64 ? `<div class="logo-container"><img src="data:image/png;base64,${logoBase64}" alt="QuestBridge Logo"></div>` : ''}
            <div class="seal">QB</div>
            <div class="certificate-header">Certificate</div>
            <div class="certificate-subtitle">of Participation</div>
            
            <div class="presented-to">This recognition is proudly awarded to</div>
            <div class="participant-name">${participantName}</div>
            
            <div class="event-info">
                For successful completion and active engagement in the <br>
                <span class="event-title">"${eventTitle}"</span> <br>
                held on ${completionDate}.
            </div>
            
            <div class="footer">
                <div class="signature-block">
                    <div class="signature-graphic">${hostName}</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">${hostName}</div>
                    <div class="signature-title">Event Organizer</div>
                </div>
                <div class="signature-block">
                    <div class="signature-graphic">Admin.QB.AI</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">Super Admin</div>
                    <div class="signature-title">QuestBridge Official</div>
                </div>
            </div>
            <div class="cert-id">Certificate ID: ${certId}</div>
        </div>
    </div>
</body>
</html>
`;
}

async function getBrowser() {
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
    });
}

async function generateCertificatePdf(html) {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1123, height: 794 });
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        const buffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        return buffer;
    } finally {
        await browser.close();
    }
}

const generateBadgePdf = generateCertificatePdf; // kept for backward compat

async function generateBadgePng(html) {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 500, height: 600, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

        const buffer = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: 500, height: 600 },
            omitBackground: true
        });
        return buffer;
    } finally {
        await browser.close();
    }
}

module.exports = {
    buildCertificateHtml,
    generateCertificatePdf,
    generateBadgePdf,
    generateBadgePng
};
