const cors = require('cors');

const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL  // Production frontend URL (set in .env)
].filter(Boolean);

const corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = cors(corsOptions);
