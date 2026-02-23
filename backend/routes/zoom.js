const express = require('express');
const { createZoomMeeting } = require('../services/zoomService');

const router = express.Router();

// ── POST /api/zoom/create-meeting ──────────────────────────────
router.post('/create-meeting', async (req, res) => {
    try {
        const { topic, startTime, duration } = req.body;

        const meeting = await createZoomMeeting(topic, startTime, duration);

        return res.json({
            message: 'Zoom meeting created successfully',
            meeting_url: meeting.join_url,
            meeting_id: meeting.id,
            password: meeting.password,
            start_url: meeting.start_url
        });

    } catch (error) {
        console.error('Zoom error:', error);
        return res.status(500).json({ error: 'Failed to create Zoom meeting.', details: error.message });
    }
});

module.exports = router;
