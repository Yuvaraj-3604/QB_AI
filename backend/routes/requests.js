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

        if (req_data.status !== 'approved' && req_data.status !== 'checked_in') {
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

const { buildCertificateHtml, generateCertificatePdf, generateBadgePdf, generateBadgePng } = require('../utils/certificate');
const { buildBadgeHtml } = require('../utils/badgeTemplate');

// ── POST /api/requests/:id/send-certificate (host sends individual cert) ──
router.post('/:id/send-certificate', requireHost, async (req, res) => {
    try {
        // 1. Fetch request and check ownership via event
        const { data: joinReq, error: reqError } = await supabase
            .from('join_requests')
            .select('*, events(title, host_id, host_name)')
            .eq('id', req.params.id)
            .single();

        if (reqError || !joinReq) return res.status(404).json({ error: 'Request not found.' });
        if (joinReq.events.host_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only send certificates for your own events.' });
        }

        if (!isEmailConfigured()) {
            return res.status(400).json({ error: 'Email system not configured.' });
        }

        // 2. Build and send certificate
        const transporter = getTransporter();
        const completionDate = new Date(joinReq.created_at || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const certId = `QB-${joinReq.id.split('-')[0].toUpperCase()}-${Math.floor(new Date(joinReq.created_at || Date.now()).getTime() / 1000).toString(16).toUpperCase()}`;
        const htmlContent = buildCertificateHtml(
            joinReq.user_name || 'Participant',
            joinReq.events.title,
            completionDate,
            joinReq.events.host_name || 'Organizer',
            certId
        );

        const pdfBuffer = await generateCertificatePdf(htmlContent);

        await transporter.sendMail({
            from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
            to: joinReq.user_email,
            subject: `Participation Certificate: ${joinReq.events.title}`,
            text: `Hello, here is your participation certificate for the event "${joinReq.events.title}" attached as a PDF.`,
            html: `<p>Hello, here is your official participation certificate for the event <b>"${joinReq.events.title}"</b>.</p>`,
            attachments: [
                {
                    filename: `Certificate_${joinReq.events.title.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        return res.json({ message: 'Certificate sent successfully!' });

    } catch (error) {
        console.error('Send certificate error:', error);
        return res.status(500).json({ error: 'Failed to send certificate.' });
    }
});

// ── POST /api/requests/:id/send-badge (host sends individual badge) ──
router.post('/:id/send-badge', requireHost, async (req, res) => {
    try {
        const { data: joinReq, error: reqError } = await supabase
            .from('join_requests')
            .select('*, events(title, host_id, host_name)')
            .eq('id', req.params.id)
            .single();

        if (reqError || !joinReq) return res.status(404).json({ error: 'Request not found.' });
        if (joinReq.events.host_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only send badges for your own events.' });
        }

        if (!isEmailConfigured()) {
            return res.status(400).json({ error: 'Email system not configured.' });
        }

        const transporter = getTransporter();
        const completionDate = new Date(joinReq.created_at || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const certId = `QB-${joinReq.id.split('-')[0].toUpperCase()}-${Math.floor(new Date(joinReq.created_at || Date.now()).getTime() / 1000).toString(16).toUpperCase()}`;

        const badgeHtml = buildBadgeHtml(
            joinReq.user_name || 'Participant',
            'Certified AI Pioneer',
            completionDate,
            certId,
            null,
            joinReq.events
        );

        const badgePngBuffer = await generateBadgePng(badgeHtml);

        await transporter.sendMail({
            from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
            to: joinReq.user_email,
            subject: `Official AI Badge: ${joinReq.events.title}`,
            text: `Hello, here is your official participation badge for the event "${joinReq.events.title}" attached as a PNG image.`,
            html: `
                <div style="font-family: sans-serif; color: #333 text-align: center;">
                    <h2 style="color: #1a365d;">Your Official AI Badge is Here!</h2>
                    <p>Congratulations <b>${joinReq.user_name}</b>!</p>
                    <p>You have successfully earned the official participation badge for <b>"${joinReq.events.title}"</b>.</p>
                    <p>Your badge is attached to this email as a high-quality PNG image.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Official_AI_Badge_${joinReq.user_name?.replace(/\s+/g, '_')}.png`,
                    content: badgePngBuffer
                }
            ]
        });

        return res.json({ message: 'Badge sent successfully!' });

    } catch (error) {
        console.error('Send badge error:', error);
        return res.status(500).json({ error: 'Failed to send badge.' });
    }
});

// ── GET /api/requests/:id/certificate (participant views their own cert) ──
router.get('/:id/certificate', requireAuth, async (req, res) => {
    try {
        const { data: joinReq, error } = await supabase
            .from('join_requests')
            .select('*, events(title, host_name, event_type, status)')
            .eq('id', req.params.id)
            .single();

        if (error || !joinReq) return res.status(404).json({ error: 'Certificate not found.' });

        // Ensure user owns this request
        if (joinReq.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }

        const completionDate = new Date(joinReq.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // Use a deterministic certId based on joinReq.id and created_at
        const certId = `QB-${joinReq.id.split('-')[0].toUpperCase()}-${Math.floor(new Date(joinReq.created_at).getTime() / 1000).toString(16).toUpperCase()}`;
        const htmlContent = buildCertificateHtml(
            joinReq.user_name || 'Participant',
            joinReq.events.title,
            completionDate,
            joinReq.events.host_name || 'Organizer',
            certId
        );

        const pdfBuffer = await generateCertificatePdf(htmlContent);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${joinReq.events.title.replace(/\s+/g, '_')}.pdf`);
        return res.send(pdfBuffer);

    } catch (err) {
        console.error('View cert error:', err);
        return res.status(500).json({ error: 'Failed to generate certificate.' });
    }
});

// ── GET /api/requests/:id/badge (participant views their own badge) ──
router.get('/:id/badge', requireAuth, async (req, res) => {
    try {
        const { data: joinReq, error } = await supabase
            .from('join_requests')
            .select('*, events(title, host_id, host_name, event_type, status)')
            .eq('id', req.params.id)
            .single();

        if (error || !joinReq) return res.status(404).json({ error: 'Badge not found.' });

        // Ensure user owns this request OR is the host of the event
        if (joinReq.user_id !== req.user.id && joinReq.events.host_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }

        const completionDate = new Date(joinReq.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const certId = `QB-${joinReq.id.split('-')[0].toUpperCase()}-${Math.floor(new Date(joinReq.created_at).getTime() / 1000).toString(16).toUpperCase()}`;

        const badgeHtml = buildBadgeHtml(
            joinReq.user_name || 'Participant',
            'Certified AI Pioneer',
            completionDate,
            certId,
            null,
            joinReq.events
        );

        const pngBuffer = await generateBadgePng(badgeHtml);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=Official_AI_Badge_${joinReq.user_name?.replace(/\s+/g, '_')}.png`);
        return res.send(pngBuffer);

    } catch (err) {
        console.error('View badge error:', err);
        return res.status(500).json({ error: 'Failed to generate badge.' });
    }
});

// ── GET /api/requests/verify/:certId (publicly verify a certificate) ──
router.get('/verify/:certId', async (req, res) => {
    try {
        const { certId } = req.params;
        const parts = certId.split('-');

        if (parts.length !== 3 || parts[0] !== 'QB') {
            return res.status(400).json({ error: 'Invalid certificate ID format.' });
        }

        const prefix = parts[1].toLowerCase();
        const hexTime = parts[2].toLowerCase();

        // Fetch all join requests and filter by prefix in memory since UUID doesn't support ILIKE without casting
        const { data: allRequests, error } = await supabase
            .from('join_requests')
            .select('*, events(title, start_date, host_name)');

        if (error || !allRequests) {
            console.error('[Verify] DB Error:', error);
            return res.status(500).json({ error: 'Database error occurred.' });
        }

        const requests = allRequests.filter(r => r.id.toLowerCase().startsWith(prefix));

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Certificate not found.' });
        }

        // Find the request that matches the hex timestamp
        const match = requests.find(r => {
            const rHex = Math.floor(new Date(r.created_at).getTime() / 1000).toString(16).toUpperCase();
            return rHex === hexTime.toUpperCase();
        });

        if (!match) {
            return res.status(404).json({ error: 'Certificate not found or timestamp mismatch.' });
        }

        return res.json({
            isValid: true,
            participantName: match.user_name,
            participantEmail: match.user_email,
            eventName: match.events.title,
            eventDate: match.events.start_date,
            issuedAt: match.created_at
        });

    } catch (err) {
        console.error('Verify cert error:', err);
        return res.status(500).json({ error: 'Failed to verify certificate.' });
    }
});

module.exports = router;
