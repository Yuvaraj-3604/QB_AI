const cors = require('cors');

const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL  // Production frontend URL (set in .env)
].filter(Boolean);

const corsOptions = {
    origin: true, // Allow all origins (mirrors the request's origin)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);
