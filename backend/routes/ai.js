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

        const nvidiaKey = process.env.NVIDIA_API_KEY;

        const prompt = `You are a helpful AI study assistant for an online learning platform called LearnHub. 
A student is watching a course and asked: "${question}"
${context ? `Course context: ${context}` : ''}
Please provide a clear, concise educational answer in 2-3 sentences. Be friendly and encouraging.`;

        // Try NVIDIA API
        if (nvidiaKey && nvidiaKey.startsWith('nvapi-')) {
            try {
                const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nvidiaKey}`
                    },
                    body: JSON.stringify({
                        model: 'meta/llama-3.1-8b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 200
                    })
                });

                const data = await response.json();
                console.log('NVIDIA API status:', response.status);

                if (data.choices && data.choices[0]) {
                    const answer = data.choices[0].message.content;
                    return res.json({ success: true, answer });
                }

                console.log('NVIDIA response:', JSON.stringify(data));
            } catch (apiError) {
                console.error('NVIDIA API error:', apiError);
            }
        }

        // Smart fallback
        const q = question.toLowerCase();
        let answer = '';

        if (q.includes('what is') || q.includes('explain') || q.includes('define')) {
            answer = `${question} is an important concept in programming. It's a feature that helps developers write cleaner and more efficient code. I recommend checking MDN Web Docs or the course notes for a detailed explanation with examples.`;
        } else if (q.includes('how') || q.includes('why')) {
            answer = `Great question! This concept works by following a specific pattern in code execution. The current lecture covers this in detail — try rewatching and pausing to practice along with the examples shown.`;
        } else if (q.includes('difference') || q.includes('vs') || q.includes('compare')) {
            answer = `Both concepts have their own use cases and strengths. The key difference lies in how they handle data flow and execution. Check the course notes for a side-by-side comparison that will make this much clearer.`;
        } else if (q.includes('error') || q.includes('bug') || q.includes('fix')) {
            answer = `For debugging this issue, first check the browser console for error messages. Make sure all variables are declared correctly and that you're not missing any semicolons or brackets. The course Q&A section is also a great place to get help from other students.`;
        } else {
            answer = `That's a great question about "${question}"! Based on the course content, I suggest reviewing the current lecture section and trying to implement the concept yourself. Hands-on practice is the best way to solidify understanding. Feel free to ask more specific questions!`;
        }

        res.json({ success: true, answer });

    } catch (error) {
        console.error('AI error:', error);
        res.json({ success: true, answer: 'I am having trouble connecting right now. Please check the course materials or ask in the Q&A section.' });
    }
});

module.exports = router;
