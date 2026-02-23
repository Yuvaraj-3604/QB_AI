const express = require('express');
const { supabase } = require('../db');
const { requireAuth, requireHost } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/events  (public — all published events) ──────────
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);
    } catch (error) {
        console.error('Get events error:', error);
        return res.status(500).json({ error: 'Failed to fetch events.' });
    }
});

// ── GET /api/events/my  (host: their own events) ──────────────
router.get('/my', requireHost, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('host_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);
    } catch (error) {
        console.error('Get my events error:', error);
        return res.status(500).json({ error: 'Failed to fetch your events.' });
    }
});

// ── GET /api/events/:id ────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Event not found.' });
        return res.status(200).json(data);
    } catch (error) {
        console.error('Get event error:', error);
        return res.status(500).json({ error: 'Failed to fetch event.' });
    }
});

// ── POST /api/events  (host only) ─────────────────────────────
router.post('/', requireHost, async (req, res) => {
    try {
        const {
            title, description, event_type, status, start_date, end_date,
            location, virtual_link, max_attendees, cover_image,
            category, ticket_price, is_free,
            advisor_name, contact, instruction
        } = req.body;

        if (!title) return res.status(400).json({ error: 'Title is required.' });

        const { data, error } = await supabase
            .from('events')
            .insert([{
                title,
                description: description || '',
                event_type: event_type || 'in_person',
                status: status || 'published',
                start_date, end_date,
                location: location || '',
                virtual_link: virtual_link || '',
                max_attendees: max_attendees || 100,
                cover_image: cover_image || '',
                category: category || 'conference',
                ticket_price: ticket_price || 0,
                is_free: is_free !== false,
                advisor_name: advisor_name || '',
                contact: contact || '',
                instruction: instruction || '',
                host_id: req.user.id,
                host_name: req.user.username || '',
                host_email: req.user.email,
                is_started: false
            }])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ error: 'Failed to create event.' });
    }
});

// ── PUT /api/events/:id  (host only — update event) ───────────
router.put('/:id', requireHost, async (req, res) => {
    try {
        // Verify ownership
        const { data: event } = await supabase
            .from('events')
            .select('host_id')
            .eq('id', req.params.id)
            .single();

        if (!event || event.host_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own events.' });
        }

        const { data, error } = await supabase
            .from('events')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json(data);
    } catch (error) {
        console.error('Update event error:', error);
        return res.status(500).json({ error: 'Failed to update event.' });
    }
});

// ── POST /api/events/:id/start  (host starts event with Zoom) ─
router.post('/:id/start', requireHost, async (req, res) => {
    try {
        const { zoom_meeting_url, zoom_meeting_id, zoom_password } = req.body;

        const { data: event } = await supabase
            .from('events')
            .select('host_id')
            .eq('id', req.params.id)
            .single();

        if (!event || event.host_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only start your own events.' });
        }

        const { data, error } = await supabase
            .from('events')
            .update({
                is_started: true,
                status: 'ongoing',
                zoom_meeting_url: zoom_meeting_url || '',
                zoom_meeting_id: zoom_meeting_id || '',
                zoom_password: zoom_password || ''
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ message: 'Event started!', event: data });
    } catch (error) {
        console.error('Start event error:', error);
        return res.status(500).json({ error: 'Failed to start event.' });
    }
});

// ── POST /api/events/:id/end  (host ends event) ───────────────
router.post('/:id/end', requireHost, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .update({ is_started: false, status: 'completed' })
            .eq('id', req.params.id)
            .eq('host_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ message: 'Event ended.', event: data });
    } catch (error) {
        console.error('End event error:', error);
        return res.status(500).json({ error: 'Failed to end event.' });
    }
});

// ── DELETE /api/events/:id  (host only) ───────────────────────
router.delete('/:id', requireHost, async (req, res) => {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id)
            .eq('host_id', req.user.id);

        if (error) throw error;
        return res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Delete event error:', error);
        return res.status(500).json({ error: 'Failed to delete event.' });
    }
});

module.exports = router;
