const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');
require('dotenv').config();

// Initialize Stripe (only if key is configured)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_key_here') {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// POST /api/payments/create-order - Create payment intent
router.post('/create-order', protect, async (req, res) => {
    try {
        const { course_ids } = req.body;
        const student_id = req.user.id;

        if (!course_ids || course_ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No courses selected.' });
        }

        // Get course details and calculate total
        const placeholders = course_ids.map(() => '?').join(',');
        const [courses] = await db.query(
            `SELECT id, title, price FROM courses WHERE id IN (${placeholders}) AND status = 'published'`,
            course_ids
        );

        if (courses.length === 0) {
            return res.status(404).json({ success: false, message: 'No valid courses found.' });
        }

        // Check if already enrolled in any
        for (const course of courses) {
            const [existing] = await db.query(
                'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
                [student_id, course.id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: `You are already enrolled in "${course.title}".` });
            }
        }

        const totalAmount = courses.reduce((sum, c) => sum + parseFloat(c.price), 0);

        // If Stripe is configured, create payment intent
        if (stripe && totalAmount > 0) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Convert to paise
                currency: 'inr',
                metadata: { student_id: student_id.toString(), course_ids: course_ids.join(',') }
            });

            return res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                amount: totalAmount,
                courses
            });
        }

        // If no Stripe key or free courses, process directly
        if (totalAmount === 0) {
            await processEnrollment(student_id, courses, 0, 'free');
            return res.json({ success: true, message: 'Enrolled successfully in free courses!', redirect: 'dashboard-student.html' });
        }

        // Demo mode - process without real payment
        await processEnrollment(student_id, courses, totalAmount, 'demo');
        res.json({ success: true, message: 'Payment processed successfully! (Demo mode)', redirect: 'dashboard-student.html' });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: 'Payment failed. Please try again.' });
    }
});

// POST /api/payments/confirm - Confirm payment and enroll
router.post('/confirm', protect, async (req, res) => {
    try {
        const { payment_intent_id, course_ids } = req.body;
        const student_id = req.user.id;

        // Verify payment with Stripe
        if (stripe) {
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({ success: false, message: 'Payment not completed.' });
            }
        }

        const placeholders = course_ids.map(() => '?').join(',');
        const [courses] = await db.query(`SELECT id, title, price FROM courses WHERE id IN (${placeholders})`, course_ids);

        const totalAmount = courses.reduce((sum, c) => sum + parseFloat(c.price), 0);
        await processEnrollment(student_id, courses, totalAmount, 'stripe', payment_intent_id);

        res.json({ success: true, message: 'Payment confirmed! You are now enrolled.', redirect: 'dashboard-student.html' });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to confirm payment.' });
    }
});

// Helper: process enrollment after payment
async function processEnrollment(student_id, courses, totalAmount, method, stripeId = null) {
    // Create order
    const [orderResult] = await db.query(
        'INSERT INTO orders (student_id, total_amount, payment_method, payment_status, stripe_payment_id) VALUES (?, ?, ?, ?, ?)',
        [student_id, totalAmount, method, 'completed', stripeId]
    );
    const order_id = orderResult.insertId;

    for (const course of courses) {
        // Create order item
        await db.query('INSERT INTO order_items (order_id, course_id, price) VALUES (?, ?, ?)', [order_id, course.id, course.price]);

        // Create enrollment
        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE enrolled_at = NOW()',
            [student_id, course.id]
        );

        // Update student count
        await db.query('UPDATE courses SET total_students = total_students + 1 WHERE id = ?', [course.id]);

        // Credit instructor earnings (70% revenue share)
        const [courseData] = await db.query('SELECT instructor_id FROM courses WHERE id = ?', [course.id]);
        if (courseData.length > 0 && course.price > 0) {
            const instructorEarning = parseFloat(course.price) * 0.70;
            await db.query(
                'INSERT INTO instructor_earnings (instructor_id, course_id, order_id, amount) VALUES (?, ?, ?, ?)',
                [courseData[0].instructor_id, course.id, order_id, instructorEarning]
            );
        }
    }
}

// GET /api/payments/history - Get student's order history
router.get('/history', protect, async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, GROUP_CONCAT(c.title SEPARATOR ', ') as courses
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN courses c ON oi.course_id = c.id
            WHERE o.student_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
