const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
require('dotenv').config();

// POST /api/ai/ask - AI Study Assistant
router.post('/ask', protect, async (req, res) => {
    try {
        const { question, context } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, message: 'Question is required.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // If no API key configured, return a helpful fallback
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.json({
                success: true,
                answer: `Great question! "${question}" — This is a key concept in the course. I recommend reviewing the current lecture section carefully and checking the course notes. For deeper understanding, try searching MDN Web Docs or the official documentation for this topic.`
            });
        }

        // Call Gemini API
        const prompt = `You are a helpful AI study assistant for an online learning platform called LearnHub. 
A student is watching a course and asked: "${question}"
${context ? `Course context: ${context}` : ''}
Please provide a clear, concise educational answer in 2-3 sentences. Be friendly and encouraging.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]) {
            const answer = data.candidates[0].content.parts[0].text;
            res.json({ success: true, answer });
        } else {
            res.json({ success: true, answer: 'I could not generate a response right now. Please try again or refer to the course materials.' });
        }

    } catch (error) {
        console.error('AI error:', error);
        res.json({ success: true, answer: 'I am having trouble connecting right now. Please check the course materials or ask in the Q&A section.' });
    }
});

module.exports = router;
