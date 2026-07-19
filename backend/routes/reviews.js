const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// POST /api/reviews - Submit a review
router.post('/', protect, async (req, res) => {
    try {
        const { course_id, rating, comment } = req.body;
        const student_id = req.user.id;

        // Check if enrolled
        const [enrollment] = await db.query(
            'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );
        if (enrollment.length === 0) return res.status(403).json({ success: false, message: 'You must be enrolled to review this course.' });

        // Insert or update review
        await db.query(
            'INSERT INTO reviews (student_id, course_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, comment = ?, updated_at = NOW()',
            [student_id, course_id, rating, comment, rating, comment]
        );

        // Recalculate average rating
        const [avgResult] = await db.query(
            'SELECT AVG(rating) as avg, COUNT(*) as total FROM reviews WHERE course_id = ?',
            [course_id]
        );
        await db.query(
            'UPDATE courses SET avg_rating = ?, total_reviews = ? WHERE id = ?',
            [avgResult[0].avg, avgResult[0].total, course_id]
        );

        res.json({ success: true, message: 'Review submitted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/reviews/:courseId - Get reviews for a course
router.get('/:courseId', async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT r.*, u.first_name, u.last_name
            FROM reviews r JOIN users u ON r.student_id = u.id
            WHERE r.course_id = ? ORDER BY r.created_at DESC
        `, [req.params.courseId]);
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
