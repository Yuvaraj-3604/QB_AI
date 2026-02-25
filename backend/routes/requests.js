const express = require('express');
const nodemailer = require('nodemailer');
const { supabase } = require('../db');
const { requireAuth, requireHost, requireAttendee } = require('../middleware/auth');

const router = express.Router();

const getTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const isEmailConfigured = () =>
    process.env.EMAIL_USER &&
    !process.env.EMAIL_USER.includes('your-email');

// ── POST /api/requests  (attendee requests to join an event) ──
router.post('/', requireAuth, async (req, res) => {
    try {
        const { event_id, message } = req.body;

        if (!event_id) {
            return res.status(400).json({ error: 'Event ID is required.' });
        }

        // Check the event exists and is published
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, title, status, max_attendees')
            .eq('id', event_id)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        if (event.status === 'cancelled' || event.status === 'completed') {
            return res.status(400).json({ error: 'This event is no longer accepting requests.' });
        }

        const { data, error } = await supabase
            .from('join_requests')
            .insert([{
                event_id,
                user_id: req.user.id,
                user_name: req.user.username || req.user.email,
                user_email: req.user.email,
                message: message || '',
                status: 'pending',
                ticket_type: 'general'
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'You have already requested to join this event.' });
            }
            throw error;
        }

        return res.status(201).json({ message: 'Join request sent successfully!', request: data });

    } catch (error) {
        console.error('Create request error:', error);
        return res.status(500).json({ error: 'Failed to send join request.' });
    }
});

// ── GET /api/requests/all (host views all their requests) ───
router.get('/all', requireHost, async (req, res) => {
    try {
        const { data: events } = await supabase
            .from('events')
            .select('id')
            .eq('host_id', req.user.id);

        if (!events || events.length === 0) {
            return res.status(200).json([]);
        }

        const eventIds = events.map(e => e.id);

        const { data, error } = await supabase
            .from('join_requests')
            .select(`
                *,
                events (title),
                users:user_id(username, email)
            `)
            .in('event_id', eventIds)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);
    } catch (error) {
        console.error('Get all requests error:', error);
        return res.status(500).json({ error: 'Failed to fetch all requests.' });
    }
});

// ── GET /api/requests/event/:eventId  (host views requests) ───
router.get('/event/:eventId', requireHost, async (req, res) => {
    try {
        // Verify host owns this event
        const { data: event } = await supabase
            .from('events')
            .select('host_id')
            .eq('id', req.params.eventId)
            .single();

        if (!event || event.host_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only view requests for your own events.' });
        }

        const { data, error } = await supabase
            .from('join_requests')
            .select(`
                *,
                users:user_id(username, email)
            `)
            .eq('event_id', req.params.eventId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Get requests error:', error);
        return res.status(500).json({ error: 'Failed to fetch requests.' });
    }
});

// ── GET /api/requests/my  (attendee views own requests) ───────
router.get('/my', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('join_requests')
            .select(`
                *,
                events (id, title, start_date, location, event_type, cover_image,
                        zoom_meeting_url, is_started, status, host_name)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Get my requests error:', error);
        return res.status(500).json({ error: 'Failed to fetch your requests.' });
    }
});

// ── GET /api/requests/participation/:eventId  (approved check) ─
router.get('/participation/:eventId', requireAuth, async (req, res) => {
    try {
        const { data: req_data, error } = await supabase
            .from('join_requests')
            .select(`
                *,
                events (id, title, start_date, end_date, location, event_type,
                        cover_image, zoom_meeting_url, zoom_meeting_id,
                        zoom_password, is_started, status, host_name, description)
            `)
            .eq('event_id', req.params.eventId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !req_data) {
            return res.status(404).json({ error: 'No approved request found for this event.' });
        }

        if (req_data.status !== 'approved') {
            return res.status(403).json({ error: 'Your request has not been approved yet.', status: req_data.status });
        }

        return res.status(200).json(req_data);

    } catch (error) {
        console.error('Get participation error:', error);
        return res.status(500).json({ error: 'Failed to fetch participation details.' });
    }
});

// ── PUT /api/requests/:id  (host approves/rejects) ────────────
router.put('/:id', requireHost, async (req, res) => {
    try {
        const { status, ticket_type } = req.body;

        if (!['approved', 'rejected', 'checked_in'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "approved", "rejected", or "checked_in".' });
        }

        // Verify the request belongs to one of the host's events
        const { data: joinReq } = await supabase
            .from('join_requests')
            .select('event_id')
            .eq('id', req.params.id)
            .single();

        if (!joinReq) return res.status(404).json({ error: 'Request not found.' });

        const { data: event } = await supabase
            .from('events')
            .select('host_id, title, description, start_date, location, host_name, advisor_name, contact, instruction, event_type, virtual_link')
            .eq('id', joinReq.event_id)
            .single();

        if (!event || event.host_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only manage requests for your own events.' });
        }

        const updates = { status };
        if (ticket_type) updates.ticket_type = ticket_type;

        const { data, error } = await supabase
            .from('join_requests')
            .update(updates)
            .eq('id', req.params.id)
            .select('*, users!join_requests_user_id_fkey(email)')
            .single();

        if (error) throw error;

        // Send confirmation email if approved
        if (status === 'approved' && isEmailConfigured()) {
            try {
                const transporter = getTransporter();
                const formattedDate = event.start_date
                    ? new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'TBD';

                let bodyText = `Hello ${data.user_name || 'Attendee'},

Your request to join "${event.title}" has been APPROVED.

Event Details:
- Date & Time: ${formattedDate}
- Host Name: ${event.host_name || 'N/A'}`;

                if (event.event_type === 'in_person' || event.event_type === 'hybrid') {
                    if (event.location) bodyText += `\n- Location: ${event.location}`;
                }

                if (event.event_type === 'in_person') {
                    if (event.advisor_name) bodyText += `\n- Advisor Name: ${event.advisor_name}`;
                    if (event.contact) bodyText += `\n- Contact: ${event.contact}`;
                }

                if (event.event_type !== 'in_person' && event.virtual_link) {
                    bodyText += `\n- Streaming Link: ${event.virtual_link}`;
                }

                bodyText += `\n\nDescription:\n${event.description || 'N/A'}`;

                if (event.event_type === 'in_person' && event.instruction) {
                    bodyText += `\n\nInstructions for Attendees:\n${event.instruction}`;
                }

                bodyText += `\n\nWe look forward to seeing you there!\n\nBest regards,\nQuestBridge AI Team`;

                const userEmail = data.users?.email || data.user_email;
                if (userEmail) {
                    await transporter.sendMail({
                        from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
                        to: userEmail,
                        subject: `Request Approved: ${event.title}`,
                        text: bodyText,
                        html: `<div style="font-family:sans-serif;padding:20px;line-height:1.6;">${bodyText.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}</div>`
                    });
                }
            } catch (err) {
                console.error("Failed to send approval email:", err);
                // We do not fail the request approval if email fails.
            }
        }

        return res.status(200).json({ message: `Request ${status}.`, request: data });

    } catch (error) {
        console.error('Update request error:', error);
        return res.status(500).json({ error: 'Failed to update request.' });
    }
});

module.exports = router;
