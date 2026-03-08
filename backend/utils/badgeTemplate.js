function buildBadgeHtml(name, role, date, certId, colors = null, event = null) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: 500px 600px;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 600px;
            width: 500px;
            background-color: transparent;
            overflow: hidden;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        svg {
            width: 500px;
            height: 600px;
        }
    </style>
</head>
<body>
    <svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color: #1e1b4b; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #312e81; stop-opacity: 1" />
            </linearGradient>

            <filter id="textShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.5" />
            </filter>
        </defs>

        <!-- Outer Shield Border -->
        <path d="M 50 20 L 450 20 L 450 480 L 250 580 L 50 480 Z" fill="url(#shieldGradient)" stroke="#4338ca" stroke-width="4" />

        <!-- Inner Content Area -->
        <path d="M 65 35 L 435 35 L 435 465 L 250 560 L 65 465 Z" fill="white" />

        <!-- Header Section - Centered Logo & Branding -->
        <g transform="translate(250, 80)">
            <!-- Simulated QB Cube Logo - Centered -->
            <g transform="translate(-40, -45) scale(0.8)">
                <path d="M 10 30 L 50 10 L 90 30 L 90 70 L 50 90 L 10 70 Z" fill="#1e293b" />
                <path d="M 10 30 L 50 10 L 90 30 L 50 45 Z" fill="#334155" />
                <path d="M 50 45 L 90 30 L 90 70 L 50 90 Z" fill="#0f172a" />
                <text x="25" y="65" fill="white" font-size="32" font-weight="900">Q</text>
                <text x="55" y="75" fill="rgba(255,255,255,0.6)" font-size="24" font-weight="900">B</text>
                
                <g opacity="0.6">
                    <path d="M 90 50 L 120 50 M 90 65 L 115 65" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" />
                    <circle cx="120" cy="50" r="3" fill="#0ea5e9" />
                    <circle cx="115" cy="65" r="3" fill="#0ea5e9" />
                </g>
            </g>

            <!-- Header Text - Below Logo -->
            <text x="0" y="65" text-anchor="middle" font-size="24" font-weight="900" fill="#1e293b" style="letter-spacing: 1px">
                QUESTBRIDGE <tspan fill="#4338ca">AI</tspan>
            </text>
        </g>

        <line x1="120" y1="165" x2="380" y2="165" stroke="#f1f5f9" stroke-width="1" />

        <!-- Event Details -->
        <text x="250" y="210" text-anchor="middle" fill="#64748b" font-size="14" font-weight="bold" style="letter-spacing: 1px; text-transform: uppercase">Official Recognition</text>
        <text x="250" y="245" text-anchor="middle" fill="#1e293b" font-size="20" font-weight="bold">${event?.title || 'QB AI Event'}</text>

        <!-- Participant Name -->
        <g transform="translate(0, 30)">
            <text x="250" y="320" text-anchor="middle" fill="#2563eb" font-size="42" font-weight="bold">${name}</text>
            <line x1="150" y1="345" x2="350" y2="345" stroke="#dbeafe" stroke-width="3" />
        </g>

        <!-- Footer Branding -->
        <g transform="translate(250, 475)">
            <text x="0" y="0" text-anchor="middle" fill="#1e293b" font-size="24" font-weight="bold" style="font-style: italic">
                Certified by <tspan fill="#4338ca">intel</tspan>ligent AI
            </text>
            <text x="0" y="35" text-anchor="middle" fill="#64748b" font-size="12" font-weight="bold" style="letter-spacing: 3px">
                PARTICIPANT BADGE
            </text>
        </g>
    </svg>
</body>
</html>`;
}

module.exports = { buildBadgeHtml };
