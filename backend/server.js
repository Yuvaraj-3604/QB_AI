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
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger (dev)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`  ${req.method} ${req.url}`);
        next();
    });
}

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'QuestBridge AI Backend',
        database: 'Supabase (PostgreSQL)',
        timestamp: new Date().toISOString()
    });
});

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 Handler ────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.', message: err.message });
});

// ── Start Server ───────────────────────────────────────────────
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 QuestBridge AI Backend`);
        console.log(`   Running on  → http://localhost:${PORT}`);
        console.log(`   Health      → http://localhost:${PORT}/api/health`);
        console.log(`   Database    → Supabase (PostgreSQL)\n`);
    });
}

module.exports = app;
