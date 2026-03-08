const cors = require('cors');

const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL  // Production frontend URL (set in .env)
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl)
        if (!origin) return callback(null, true);

        // Match localhost/127.0.0.1 or anything from the user
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        callback(null, true); // Still allow others while debugging
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);
