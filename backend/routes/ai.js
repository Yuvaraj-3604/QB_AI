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

module.exports = router;
