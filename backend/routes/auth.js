const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine role (only student or instructor allowed on register)
        const userRole = role === 'instructor' ? 'instructor' : 'student';

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, userRole, true]
        );

        // Get the created user
        const [users] = await db.query('SELECT id, first_name, last_name, email, role FROM users WHERE id = ?', [result.insertId]);
        const user = users[0];

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Find user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// GET /api/auth/me - Get current logged in user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Not authorized.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query('SELECT id, first_name, last_name, email, role, avatar, bio FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

        res.json({ success: true, user: users[0] });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token.' });
    }
});

module.exports = router;
