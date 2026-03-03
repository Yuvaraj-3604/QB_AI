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

// ── HTML Email Template Builder ────────────────────────────────
function buildHtmlEmail(subject, body) {
    const bodyHtml = body
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n\n/g, '</p><p style="margin:0 0 16px 0;">')
        .replace(/\n/g, '<br>');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#06b6d4);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">QuestBridge AI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Event Management Platform</p>
            </td>
          </tr>

          <!-- Subject Banner -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Message</p>
              <h2 style="margin:4px 0 0;font-size:20px;color:#1e293b;font-weight:700;">${subject}</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151;">
                ${bodyHtml}
              </p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:0 40px 36px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:28px;"/>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                This email was sent by <strong style="color:#6366f1;">QuestBridge AI</strong> on behalf of the event organizer.<br>
                If you have questions, please contact your event host directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} QuestBridge AI &middot; All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── POST /api/marketing/send  (campaign to approved participants) ───
router.post('/send', async (req, res) => {
    try {
        const { subject, body, recipients, hostName } = req.body;

        if (!subject || !body) {
            return res.status(400).json({ error: 'Subject and body are required.' });
        }

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: 'No recipients provided.' });
        }

        if (!isEmailConfigured()) {
            console.warn('⚠️  Email credentials not configured — simulating send');
            return res.json({
                message: 'Simulation successful (email credentials not configured)',
                recipientCount: recipients.length,
                timestamp: new Date().toISOString()
            });
        }

        const transporter = getTransporter();

        await Promise.all(recipients.map(recipient => {
            // Support both {email, name} objects and plain email strings
            const email = typeof recipient === 'object' ? recipient.email : recipient;
            const name = typeof recipient === 'object' ? (recipient.name || 'Attendee') : 'Attendee';
            const orgName = hostName || 'The Organizer';

            // Replace placeholders with real values
            const personalizedBody = body
                .replace(/\[ATTENDEE_NAME\]/g, name)
                .replace(/\[HOST_NAME\]/g, orgName)
                .replace(/\[Name\]/g, name)
                .replace(/\[Your Name\]/g, orgName);

            const personalizedSubject = subject
                .replace(/\[ATTENDEE_NAME\]/g, name)
                .replace(/\[HOST_NAME\]/g, orgName);

            const htmlContent = buildHtmlEmail(personalizedSubject, personalizedBody);

            return transporter.sendMail({
                from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: personalizedSubject,
                text: personalizedBody,
                html: htmlContent
            });
        }));

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
        const htmlContent = buildHtmlEmail(subject, body);

        await transporter.sendMail({
            from: `"QuestBridge AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: body,
            html: htmlContent
        });

        return res.json({ message: 'Email sent successfully!', email });

    } catch (error) {
        console.error('Single email error:', error);
        return res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
});

module.exports = router;
