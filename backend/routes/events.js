const express = require('express');
const { supabase } = require('../db');
const { requireAuth, requireHost } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { buildCertificateHtml, generateCertificatePdf } = require('../utils/certificate');

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

        // Fetch latest username from DB to ensure it's correct even if JWT is old
        const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', req.user.id)
            .single();

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
                host_name: userData?.username || req.user.username || 'Yuvaraj Perumal V',
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

        // ── Certificate Logic for Virtual/Webinar/Hybrid ────────────────
        const certTypes = ['virtual', 'webinar', 'hybrid'];
        if (certTypes.includes(data.event_type?.toLowerCase()) && isEmailConfigured()) {
            try {
                // 1. Fetch all approved/checked-in participants
                const { data: participants } = await supabase
                    .from('join_requests')
                    .select('id, user_name, user_email, status, created_at')
                    .eq('event_id', req.params.id)
                    .in('status', ['approved', 'checked_in']);

                if (participants && participants.length > 0) {
                    const transporter = getTransporter();
                    const completionDate = new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    // 2. Send certificate email to each participant
                    for (const p of participants) {
                        const certId = `QB-${p.id.split('-')[0].toUpperCase()}-${Math.floor(new Date(p.created_at).getTime() / 1000).toString(16).toUpperCase()}`;
                        const htmlContent = buildCertificateHtml(
                            p.user_name || 'Participant',
                            data.title,
                            completionDate,
                            data.host_name || 'Organizer',
                            certId
                        );

                        // Generate PDF Buffer
                        const pdfBuffer = await generateCertificatePdf(htmlContent);

                        await transporter.sendMail({
                            from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
                            to: p.user_email,
                            subject: `Completion Certificate: ${data.title}`,
                            text: `Congratulations! You have completed the event "${data.title}". Please find your official participation certificate attached as a PDF.`,
                            html: `<p>Congratulations! You have completed the event <b>"${data.title}"</b>.</p><p>Please find your official participation certificate attached to this email.</p>`,
                            attachments: [
                                {
                                    filename: `Certificate_${data.title.replace(/\s+/g, '_')}.pdf`,
                                    content: pdfBuffer
                                }
                            ]
                        });
                    }
                    console.log(`✅ Certificates sent to ${participants.length} participants.`);
                }
            } catch (certError) {
                console.error('Failed to send certificates:', certError);
                // Don't fail the end event action if certificates fail
            }
        }

        return res.status(200).json({ message: 'Event ended and certificates sent.', event: data });
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

// ── PATCH /api/events/fix-host-names  (one-time fix for legacy events) ──
router.patch('/fix-host-names', requireHost, async (req, res) => {
    try {
        // Fetch all events that have empty host_name but have a host_email
        const { data: events, error } = await supabase
            .from('events')
            .select('id, host_id, host_email, host_name')
            .or('host_name.is.null,host_name.eq.');  // null or empty string

        if (error) throw error;

        if (!events || events.length === 0) {
            return res.json({ message: 'No events to fix.', fixed: 0 });
        }

        let fixed = 0;
        for (const event of events) {
            // Try getting the username from users table via host_id
            const { data: userRow } = await supabase
                .from('users')
                .select('username, email')
                .eq('id', event.host_id)
                .single();

            const newHostName = userRow?.username || 'Host';

            if (newHostName) {
                await supabase
                    .from('events')
                    .update({ host_name: newHostName })
                    .eq('id', event.id);
                fixed++;
            }
        }

        return res.json({ message: `Fixed ${fixed} events.`, fixed });
    } catch (error) {
        console.error('Fix host names error:', error);
        return res.status(500).json({ error: 'Failed to fix host names.' });
    }
});


module.exports = router;
