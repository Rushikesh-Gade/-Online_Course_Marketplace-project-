const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// POST /api/enrollments - Enroll in a course (free courses)
router.post('/', protect, async (req, res) => {
    try {
        const { course_id } = req.body;
        const student_id = req.user.id;

        // Check course exists and is published
        const [courses] = await db.query('SELECT * FROM courses WHERE id = ? AND status = "published"', [course_id]);
        if (courses.length === 0) return res.status(404).json({ success: false, message: 'Course not found.' });

        const course = courses[0];

        // Check if already enrolled
        const [existing] = await db.query('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [student_id, course_id]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });

        // Only allow free enrollment for free courses
        if (course.price > 0) return res.status(400).json({ success: false, message: 'This course requires payment.' });

        // Create enrollment
        await db.query('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student_id, course_id]);

        // Update student count
        await db.query('UPDATE courses SET total_students = total_students + 1 WHERE id = ?', [course_id]);

        res.status(201).json({ success: true, message: 'Enrolled successfully!' });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/enrollments/my-courses - Get student's enrolled courses
router.get('/my-courses', protect, async (req, res) => {
    try {
        const [enrollments] = await db.query(`
            SELECT e.*, c.title, c.thumbnail, c.total_lectures, c.total_hours,
                   u.first_name, u.last_name, cat.name as category_name
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            JOIN users u ON c.instructor_id = u.id
            JOIN categories cat ON c.category_id = cat.id
            WHERE e.student_id = ?
            ORDER BY e.enrolled_at DESC
        `, [req.user.id]);

        res.json({ success: true, enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// PUT /api/enrollments/progress - Update lesson progress
router.put('/progress', protect, async (req, res) => {
    try {
        const { lesson_id, course_id } = req.body;
        const student_id = req.user.id;

        // Mark lesson as complete
        await db.query(
            'INSERT INTO progress (student_id, lesson_id, course_id, completed, completed_at) VALUES (?, ?, ?, TRUE, NOW()) ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()',
            [student_id, lesson_id, course_id]
        );

        // Calculate new progress percentage
        const [totalLessons] = await db.query(`
            SELECT COUNT(*) as total FROM lessons l
            JOIN sections s ON l.section_id = s.id
            WHERE s.course_id = ?
        `, [course_id]);

        const [completedLessons] = await db.query(
            'SELECT COUNT(*) as completed FROM progress WHERE student_id = ? AND course_id = ? AND completed = TRUE',
            [student_id, course_id]
        );

        const total = totalLessons[0].total;
        const completed = completedLessons[0].completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update enrollment progress
        await db.query('UPDATE enrollments SET progress_percent = ? WHERE student_id = ? AND course_id = ?', [percent, student_id, course_id]);

        // If 100% complete, issue certificate
        if (percent === 100) {
            await db.query(
                'INSERT INTO certificates (student_id, course_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE issued_at = NOW()',
                [student_id, course_id]
            );
            await db.query('UPDATE enrollments SET completed = TRUE, completed_at = NOW() WHERE student_id = ? AND course_id = ?', [student_id, course_id]);
        }

        res.json({ success: true, progress: percent, completed: percent === 100 });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
