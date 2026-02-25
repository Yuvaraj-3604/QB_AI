const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

// ── CSV helper ─────────────────────────────────────────────────
const toCSV = (fields, rows) => {
    const escape = (val) => {
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };
    const header = fields.join(',');
    const csvRows = rows.map(row => fields.map(f => escape(row[f])).join(','));
    return [header, ...csvRows].join('\n');
};

// ── GET /api/download/participants ─────────────────────────────
router.get('/participants', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const fields = ['id', 'name', 'email', 'organization', 'phone', 'ticket_type', 'status', 'created_at'];
        const csv = toCSV(fields, data || []);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="participants_list.csv"');
        return res.send(csv);
    } catch (error) {
        console.error('Download participants error:', error);
        return res.status(500).json({ error: 'Failed to generate CSV.' });
    }
});

// ── GET /api/download/leaderboard ──────────────────────────────
router.get('/leaderboard', async (req, res) => {
    try {
        const { eventId } = req.query;
        let query = supabase
            .from('engagement_logs')
            .select('participant_email, score');

        // If your table has event_id, you can filter it here
        // if (eventId) query = query.eq('event_id', eventId);

        const { data, error } = await query;

        if (error) throw error;

        const leaderboard = Object.values(
            (data || []).reduce((acc, log) => {
                const email = log.participant_email;
                if (!acc[email]) {
                    acc[email] = {
                        participant_email: email,
                        total_score: 0,
                        activities_completed: 0
                    };
                }
                acc[email].total_score += log.score || 0;
                acc[email].activities_completed += 1;
                return acc;
            }, {})
        ).sort((a, b) => b.total_score - a.total_score);

        const fields = ['participant_email', 'total_score', 'activities_completed'];
        const csv = toCSV(fields, leaderboard);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="event_leaderboard.csv"');
        return res.send(csv);
    } catch (error) {
        console.error('Download leaderboard error:', error);
        return res.status(500).json({ error: 'Failed to generate leaderboard CSV.' });
    }
});

// ── GET /api/download/engagement ───────────────────────────────
router.get('/engagement', async (req, res) => {
    try {
        const { eventId } = req.query;
        let query = supabase
            .from('engagement_logs')
            .select('id, participant_email, activity_type, details, score, timestamp')
            .order('timestamp', { ascending: false });

        // If your table has event_id, you can filter it here
        // if (eventId) query = query.eq('event_id', eventId);

        const { data, error } = await query;
        if (error) throw error;

        const fields = ['id', 'participant_email', 'activity_type', 'details', 'score', 'timestamp'];
        const csv = toCSV(fields, data || []);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="engagement_logs.csv"');
        return res.send(csv);
    } catch (error) {
        console.error('Download engagement error:', error);
        return res.status(500).json({ error: 'Failed to generate engagement CSV.' });
    }
});

// ── GET /api/download/events  (event summary with request counts)
router.get('/events', async (req, res) => {
    try {
        // Read auth token to filter by host
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let hostId = null;

        if (token) {
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'questbridge_secret_key_change_in_production';
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                hostId = decoded.id;
            } catch (e) { }
        }

        let eventsQuery = supabase
            .from('events')
            .select('id, title, status, start_date, host_name, host_email, max_attendees, is_started, created_at')
            .order('created_at', { ascending: false });

        if (hostId) {
            eventsQuery = eventsQuery.eq('host_id', hostId);
        }

        const { data: events, error: evErr } = await eventsQuery;
        if (evErr) throw evErr;

        // Fetch request counts grouped by event
        const { data: reqData, error: reqErr } = await supabase
            .from('join_requests')
            .select('event_id, status');
        if (reqErr) throw reqErr;

        // Build counts map
        const countMap = {};
        (reqData || []).forEach(r => {
            if (!countMap[r.event_id]) countMap[r.event_id] = { total: 0, approved: 0, pending: 0, rejected: 0 };
            countMap[r.event_id].total++;
            countMap[r.event_id][r.status] = (countMap[r.event_id][r.status] || 0) + 1;
        });

        const rows = (events || []).map(ev => ({
            id: ev.id,
            title: ev.title,
            status: ev.status,
            start_date: ev.start_date,
            host_name: ev.host_name,
            host_email: ev.host_email,
            max_attendees: ev.max_attendees,
            is_live: ev.is_started ? 'Yes' : 'No',
            total_requests: countMap[ev.id]?.total || 0,
            approved: countMap[ev.id]?.approved || 0,
            pending: countMap[ev.id]?.pending || 0,
            rejected: countMap[ev.id]?.rejected || 0,
            created_at: ev.created_at
        }));

        const fields = ['id', 'title', 'status', 'start_date', 'host_name', 'host_email',
            'max_attendees', 'is_live', 'total_requests', 'approved', 'pending', 'rejected', 'created_at'];
        const csv = toCSV(fields, rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="events_summary.csv"');
        return res.send(csv);
    } catch (error) {
        console.error('Download events error:', error);
        return res.status(500).json({ error: 'Failed to generate events CSV.' });
    }
});

// ── GET /api/download/requests  (all join requests) ────────────
router.get('/requests', async (req, res) => {
    try {
        const { eventId } = req.query;

        let query = supabase
            .from('join_requests')
            .select(`
                id,
                status,
                ticket_type,
                message,
                created_at,
                user_name,
                user_email,
                events (title)
            `)
            .order('created_at', { ascending: false });

        if (eventId) {
            query = query.eq('event_id', eventId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = (data || []).map(r => ({
            id: r.id,
            event_title: r.events?.title || '',
            user_name: r.user_name,
            user_email: r.user_email,
            status: r.status,
            ticket_type: r.ticket_type,
            message: r.message,
            created_at: r.created_at
        }));

        const fields = ['id', 'event_title', 'user_name', 'user_email', 'status', 'ticket_type', 'message', 'created_at'];
        const csv = toCSV(fields, rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="join_requests.csv"');
        return res.send(csv);
    } catch (error) {
        console.error('Download requests error:', error);
        return res.status(500).json({ error: 'Failed to generate requests CSV.' });
    }
});

module.exports = router;
