const express = require('express');
const nodemailer = require('nodemailer');
const { supabase } = require('../db');
const { requireAdmin } = require('../middleware/auth');

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

// ── GET /api/admin/stats ───────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        // Platform wide counts
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: hostCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'host');
        const { count: attendeeCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'attendee');
        const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
        const { count: ticketCount } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });
        const { count: openTickets } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open');

        // Recent events
        const { data: recentEvents } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        return res.json({
            users: { total: userCount, hosts: hostCount, attendees: attendeeCount },
            events: { total: eventCount },
            support: { total: ticketCount, open: openTickets },
            recentEvents
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return res.status(500).json({ error: 'Failed to fetch admin statistics.' });
    }
});

// ── GET /api/admin/users ───────────────────────────────────────
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        console.error('Admin users error:', error);
        return res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// ── GET /api/admin/tickets ────────────────────────────────────
router.get('/tickets', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        console.error('Admin tickets error:', error);
        return res.status(500).json({ error: 'Failed to fetch tickets.' });
    }
});

// ── PUT /api/admin/tickets/:id/reply ──────────────────────────
router.put('/tickets/:id/reply', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply) return res.status(400).json({ error: 'Reply content is required.' });

        // First, fetch the original ticket data to get user email and subject
        const { data: originalTicket, error: fetchError } = await supabase
            .from('support_tickets')
            .select('id, user_id, subject, email, username') // Ensure email and username are selected
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!originalTicket) return res.status(404).json({ error: 'Ticket not found.' });

        const { data, error } = await supabase
            .from('support_tickets')
            .update({
                reply,
                status: 'resolved',
                replied_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Send email notification to the user
        if (isEmailConfigured()) {
            try {
                const transporter = getTransporter();
                await transporter.sendMail({
                    from: `"QuestBridge Support" <${process.env.EMAIL_USER}>`,
                    to: originalTicket.email, // Use email from original ticket
                    subject: `Re: ${originalTicket.subject}`, // Use subject from original ticket
                    text: `Hello ${originalTicket.username || 'User'},\n\nAn administrator has replied to your support request regarding "${originalTicket.subject}":\n\n"${reply}"\n\nYour ticket has been marked as resolved.\n\nBest regards,\nQuestBridge AI Support`,
                });
            } catch (mailError) {
                console.error('Failed to send admin reply email:', mailError);
            }
        }

        return res.json({ message: 'Reply sent and ticket resolved.', ticket: data });
    } catch (error) {
        console.error('Admin ticket reply error:', error);
        return res.status(500).json({ error: 'Failed to reply to ticket.' });
    }
});

module.exports = router;
