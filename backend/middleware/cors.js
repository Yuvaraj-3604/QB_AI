const cors = require('cors');

const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',
    process.env.FRONTEND_URL  // Production frontend URL (set in .env)
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = cors(corsOptions);
