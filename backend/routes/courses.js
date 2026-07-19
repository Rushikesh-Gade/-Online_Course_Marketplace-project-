const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/courses - Get all published courses (with filters)
router.get('/', async (req, res) => {
    try {
        const { category, difficulty, search, sort, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT c.*, u.first_name, u.last_name, cat.name as category_name
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            JOIN categories cat ON c.category_id = cat.id
            WHERE c.status = 'published'
        `;
        const params = [];

        if (category) { query += ' AND c.category_id = ?'; params.push(category); }
        if (difficulty) { query += ' AND c.difficulty = ?'; params.push(difficulty); }
        if (search) { query += ' AND (c.title LIKE ? OR c.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

        if (sort === 'rating') query += ' ORDER BY c.avg_rating DESC';
        else if (sort === 'newest') query += ' ORDER BY c.created_at DESC';
        else if (sort === 'price_asc') query += ' ORDER BY c.price ASC';
        else if (sort === 'price_desc') query += ' ORDER BY c.price DESC';
        else query += ' ORDER BY c.total_students DESC';

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [courses] = await db.query(query, params);
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM courses WHERE status = "published"');

        res.json({ success: true, courses, total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/courses/:id - Get single course details
router.get('/:id', async (req, res) => {
    try {
        const [courses] = await db.query(`
            SELECT c.*, u.first_name, u.last_name, u.bio as instructor_bio, cat.name as category_name
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (courses.length === 0) return res.status(404).json({ success: false, message: 'Course not found.' });

        const course = courses[0];

        // Get sections and lessons
        const [sections] = await db.query('SELECT * FROM sections WHERE course_id = ? ORDER BY position', [req.params.id]);
        for (let section of sections) {
            const [lessons] = await db.query('SELECT * FROM lessons WHERE section_id = ? ORDER BY position', [section.id]);
            section.lessons = lessons;
        }
        course.sections = sections;

        // Get reviews
        const [reviews] = await db.query(`
            SELECT r.*, u.first_name, u.last_name
            FROM reviews r JOIN users u ON r.student_id = u.id
            WHERE r.course_id = ? ORDER BY r.created_at DESC LIMIT 10
        `, [req.params.id]);
        course.reviews = reviews;

        res.json({ success: true, course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/courses/categories/all - Get all categories
router.get('/categories/all', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /api/courses - Create new course (instructor only)
router.post('/', protect, restrictTo('instructor', 'admin'), async (req, res) => {
    try {
        const { title, description, category_id, price, difficulty, language } = req.body;

        if (!title || !description || !category_id) {
            return res.status(400).json({ success: false, message: 'Title, description, and category are required.' });
        }

        const [result] = await db.query(
            'INSERT INTO courses (title, description, instructor_id, category_id, price, difficulty, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, req.user.id, category_id, price || 0, difficulty || 'beginner', language || 'English']
        );

        res.status(201).json({ success: true, message: 'Course created successfully!', courseId: result.insertId });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/courses/instructor/my-courses - Get instructor's courses
router.get('/instructor/my-courses', protect, restrictTo('instructor', 'admin'), async (req, res) => {
    try {
        const [courses] = await db.query(`
            SELECT c.*, cat.name as category_name,
            (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
            FROM courses c
            JOIN categories cat ON c.category_id = cat.id
            WHERE c.instructor_id = ?
            ORDER BY c.created_at DESC
        `, [req.user.id]);

        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
