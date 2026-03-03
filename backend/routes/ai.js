const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// ── GET /api/ai/quiz ──────────────────────────────────────────
router.post('/quiz', requireAuth, async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required.' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey.startsWith('gsk_...')) {
            return res.status(500).json({ error: 'GROQ API key is missing or invalid. Please configure it in .env' });
        }

        const prompt = `You are a creative and unhinged AI event coordinator.
Create a 3-question multiple-choice quiz about the event titled "${topic}". 
The questions should be "crazy", funny, and unconventional but relevant to the event name.
Return ONLY a valid JSON array of objects. 
Provide exactly 4 options per question.
Follow this exact schema for each object in the array:
{
    "id": number,
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "answer": number // this is the index (0-3) of the correct option
}
Do not write anything else, only the JSON.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.9,
            })
        });

        if (!response.ok) {
            const errDetails = await response.text();
            throw new Error(`GROQ API error: ${response.status} ${errDetails}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '[]';

        // Try parsing JSON out of content
        let jsonStr = content;
        // In case the model wraps it in markdown code blocks
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const questions = JSON.parse(jsonStr);
        return res.status(200).json(questions);

    } catch (error) {
        console.error('GROQ Quiz Generation Error:', error);
        return res.status(500).json({ error: 'Failed to generate AI quiz.' });
    }
});

// ── POST /api/ai/generate-email ────────────────────────────
router.post('/generate-email', requireAuth, async (req, res) => {
    try {
        const { eventDetails, templateType, hostName } = req.body;
        const organizerName = hostName
            || eventDetails.host_name
            || 'The Organizer';

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || !apiKey.startsWith('gsk_') || apiKey.includes('...')) {
            return res.status(500).json({ error: 'GROQ API key is missing or invalid.' });
        }

        const prompt = `You are a professional event marketing AI.
Generate a professional ${templateType} email for an event with the following details:
Event Title: ${eventDetails.title}
Event Type: ${eventDetails.event_type}
Date: ${eventDetails.start_date}
Location: ${eventDetails.location || 'Virtual'}
Description: ${eventDetails.description || 'No description'}
Organizer / Host Name: ${organizerName}

IMPORTANT RULES:
- Start the greeting with exactly: "Dear [ATTENDEE_NAME],"
- Use "${organizerName}" as the actual organizer name wherever relevant in the body.
- End the sign-off with exactly: "Best regards,\n${organizerName}"
- Do NOT use any bracket placeholders except [ATTENDEE_NAME].
- The body should be professional, engaging, and encourage action.

Return EXACTLY a JSON object with this schema:
{
  "subject": "string",
  "body": "string"
}
Do not include markdown blocks, just the raw JSON.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errDetails = await response.text();
            throw new Error(`GROQ API error: ${response.status} ${errDetails}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '{}';

        return res.status(200).json(JSON.parse(content));
    } catch (error) {
        console.error('GROQ Email Generation Error:', error);
        return res.status(500).json({ error: 'Failed to generate email content.' });
    }
});

module.exports = router;

