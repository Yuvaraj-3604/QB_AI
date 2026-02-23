const express = require('express');
const nodemailer = require('nodemailer');
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

// ── POST /api/marketing/send  (campaign to all participants) ───
router.post('/send', async (req, res) => {
    try {
        const { subject, body } = req.body;

        if (!subject || !body) {
            return res.status(400).json({ error: 'Subject and body are required.' });
        }

        const { data: rows, error } = await supabase
            .from('participants')
            .select('email');

        if (error) throw error;

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No recipients found.' });
        }

        const recipients = rows.map(r => r.email);

        if (!isEmailConfigured()) {
            console.warn('⚠️  Email credentials not configured — simulating send');
            return res.json({
                message: 'Simulation successful (email credentials not configured)',
                recipientCount: recipients.length,
                timestamp: new Date().toISOString()
            });
        }

        const transporter = getTransporter();
        await Promise.all(recipients.map(email =>
            transporter.sendMail({
                from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
                to: email,
                subject,
                text: body,
                html: `<div style="font-family:sans-serif;padding:20px">${body.replace(/\n/g, '<br>')}</div>`
            })
        ));

        return res.json({
            message: 'Email campaign sent successfully!',
            recipientCount: recipients.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Marketing send error:', error);
        return res.status(500).json({ error: 'Failed to send email campaign.' });
    }
});

// ── POST /api/marketing/single-send  (one email) ──────────────
router.post('/single-send', async (req, res) => {
    try {
        const { email, subject, body } = req.body;

        if (!email || !subject || !body) {
            return res.status(400).json({ error: 'Email, subject, and body are required.' });
        }

        if (!isEmailConfigured()) {
            return res.json({ message: 'Simulation successful (credentials not set)', email });
        }

        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: body,
            html: `<div style="font-family:sans-serif;padding:20px">${body.replace(/\n/g, '<br>')}</div>`
        });

        return res.json({ message: 'Email sent successfully!', email });

    } catch (error) {
        console.error('Single email error:', error);
        return res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
});

module.exports = router;
