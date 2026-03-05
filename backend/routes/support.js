const express = require('express');
const nodemailer = require('nodemailer');
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../db');

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

// ── GET /api/support/my ─────────────────────────────────────────
router.get('/my', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        console.error('Fetch support history error:', error);
        return res.status(500).json({ error: 'Failed to fetch support history.' });
    }
});

// ── POST /api/support ──────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
    try {
        const { category, subject, message } = req.body;
        const user = req.user;

        if (!category || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (!isEmailConfigured()) {
            console.warn('⚠️ Support email simulation (no credentials)');
            return res.json({ message: 'Support request sent (simulation mode).' });
        }

        const transporter = getTransporter();
        const supportEmail = 'admin.qb.ai@gmail.com';

        // 1. Save to DB
        const { error: dbError } = await supabase
            .from('support_tickets')
            .insert([{
                user_id: user.id,
                username: user.username,
                email: user.email,
                category,
                subject,
                message,
                status: 'open'
            }]);

        if (dbError) console.error('Error saving ticket to DB:', dbError);

        // 2. Send emails
        const emailBody = `
            NEW SUPPORT REQUEST
            -------------------
            User: ${user.username} (${user.email})
            Category: ${category}
            Subject: ${subject}
            
            Message:
            ${message}
            
            -------------------
            QuestBridge AI Support Dashboard
        `;

        await transporter.sendMail({
            from: `"QuestBridge Support" <${process.env.EMAIL_USER}>`,
            to: supportEmail,
            replyTo: user.email,
            subject: `[Support] ${category}: ${subject}`,
            text: emailBody,
        });

        // Also send confirmation to user
        await transporter.sendMail({
            from: `"QuestBridge Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Support Request Received: ${subject}`,
            text: `Hello ${user.username},\n\nWe have received your support request regarding "${subject}". Our team will review it and get back to you shortly.\n\nBest regards,\nQuestBridge AI Support`,
        });

        return res.json({ message: 'Your support request has been sent successfully!' });

    } catch (error) {
        console.error('Support request error:', error);
        return res.status(500).json({ error: 'Failed to send support request.', details: error.message });
    }
});

module.exports = router;
