require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');

// ── Route Imports ──────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const requestRoutes = require('./routes/requests');
const participantRoutes = require('./routes/participants');
const engagementRoutes = require('./routes/engagement');
const marketingRoutes = require('./routes/marketing');
const zoomRoutes = require('./routes/zoom');
const downloadRoutes = require('./routes/download');
const aiRoutes = require('./routes/ai');
const supportRoutes = require('./routes/support');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ──────────────────────────────────────────
// 1. Logger (absolute top)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.headers.origin) console.log(`   Origin: ${req.headers.origin}`);
    if (req.method === 'OPTIONS') {
        console.log('   (CORS Pre-flight)');
        // res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
        // return res.sendStatus(204);
    }
    next();
});

// 2. CORS
app.use(corsMiddleware);

// 3. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
    let dbStatus = 'untested';
    let dbError = null;

    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        dbStatus = 'success';
    } catch (err) {
        dbStatus = 'failed';
        dbError = err.message;
    }

    res.json({
        status: 'ok',
        version: '2.0.0',
        service: 'QuestBridge AI Backend (v2)',
        database: 'Supabase (PostgreSQL)',
        db_test: dbStatus,
        db_error: dbError,
        node_env: process.env.NODE_ENV || 'production',
        diagnostics: {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            JWT_SECRET: !!process.env.JWT_SECRET
        },
        timestamp: new Date().toISOString()
    });
});

// ── API Routes (Dual mounting for Vercel/Local compatibility) ──
const mount = (path, router) => {
    app.use(path, router);
    if (path.startsWith('/api')) {
        app.use(path.replace('/api', ''), router);
    }
};

mount('/api/auth', authRoutes);
mount('/api/events', eventRoutes);
mount('/api/requests', requestRoutes);
mount('/api/participants', participantRoutes);
mount('/api/engagement', engagementRoutes);
mount('/api/marketing', marketingRoutes);
mount('/api/zoom', zoomRoutes);
mount('/api/download', downloadRoutes);
mount('/api/ai', aiRoutes);
mount('/api/support', supportRoutes);
mount('/api/admin', adminRoutes);

// ── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
    console.log(`[404] No route matched: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Route not found.',
        path: req.url,
        method: req.method
    });
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.', message: err.message });
});

// ── Start Server ───────────────────────────────────────────────
if (require.main === module) {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 QuestBridge AI Backend`);
        console.log(`   Running on  → http://localhost:${PORT}`);
        console.log(`   Health      → http://localhost:${PORT}/api/health`);
        console.log(`   Database    → Supabase (PostgreSQL)\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Error: Port ${PORT} is already in use.`);
            process.exit(1);
        } else {
            console.error('❌ Server error:', err);
        }
    });
}

module.exports = app;
