const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/users/profile - Get current user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, first_name, last_name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// PUT /api/users/profile - Update profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { first_name, last_name, bio } = req.body;
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, bio = ? WHERE id = ?',
            [first_name, last_name, bio, req.user.id]
        );
        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/users/dashboard - Get student dashboard stats
router.get('/dashboard', protect, async (req, res) => {
    try {
        const student_id = req.user.id;

        const [enrollments] = await db.query('SELECT COUNT(*) as total FROM enrollments WHERE student_id = ?', [student_id]);
        const [completed] = await db.query('SELECT COUNT(*) as total FROM enrollments WHERE student_id = ? AND completed = TRUE', [student_id]);
        const [certificates] = await db.query('SELECT COUNT(*) as total FROM certificates WHERE student_id = ?', [student_id]);

        res.json({
            success: true,
            stats: {
                enrolled: enrollments[0].total,
                completed: completed[0].total,
                certificates: certificates[0].total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/users/certificates - Get student certificates
router.get('/certificates', protect, async (req, res) => {
    try {
        const [certs] = await db.query(`
            SELECT cert.*, c.title as course_title
            FROM certificates cert
            JOIN courses c ON cert.course_id = c.id
            WHERE cert.student_id = ?
            ORDER BY cert.issued_at DESC
        `, [req.user.id]);
        res.json({ success: true, certificates: certs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/users/notifications - Get user notifications
router.get('/notifications', protect, async (req, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
