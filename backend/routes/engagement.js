const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

// ── POST /api/engagement ───────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { participant_email, activity_type, details, score } = req.body;

        if (!participant_email || !activity_type) {
            return res.status(400).json({ error: 'Participant email and activity type are required.' });
        }

        const { data, error } = await supabase
            .from('engagement_logs')
            .insert([{
                participant_email,
                activity_type,
                details: details ? JSON.stringify(details) : null,
                score: score || 0
            }])
            .select('id')
            .single();

        if (error) throw error;

        return res.status(201).json({
            message: 'Engagement logged successfully',
            id: data.id
        });

    } catch (error) {
        console.error('Engagement log error:', error);
        return res.status(500).json({ error: 'Failed to log engagement.' });
    }
});

// ── GET /api/engagement ────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('engagement_logs')
            .select(`
                id,
                participant_email,
                activity_type,
                details,
                score,
                timestamp,
                participants (name)
            `)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Get engagement logs error:', error);
        return res.status(500).json({ error: 'Failed to fetch engagement logs.' });
    }
});

module.exports = router;
