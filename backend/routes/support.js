const express = require('express');
const nodemailer = require('nodemailer');
const { requireAuth } = require('../middleware/auth');

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
        const supportEmail = 'support@questbridge.ai'; // Or process.env.SUPPORT_EMAIL

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
