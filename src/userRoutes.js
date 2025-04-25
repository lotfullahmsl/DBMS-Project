
const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Create a router
const router = express.Router();

// Secret key for JWT (should be stored in environment variable in production)
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Sign-up route
router.post('/signup', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and include a number and a special character' });
    }

    try {
        const [existingUsers] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
            'INSERT INTO Users (email, password, first_name, last_name, created_at) VALUES (?, ?, ?, ?, NOW())',
            [email, hashedPassword, first_name, last_name]
        );

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Sign-in route
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const [users] = await pool.query('SELECT user_id, email, password FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Google Login route
router.post('/auth/google', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'ID token is required' });
    }

    try {
        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        if (!payload.email) {
            return res.status(400).json({ success: false, message: 'Email is required from Google' });
        }

        // Check if user exists
        const [users] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [payload.email]);
        let userId;

        if (users.length > 0) {
            // User exists, use their ID
            userId = users[0].user_id;
        } else {
            // Create a new user
            const [result] = await pool.query(
                'INSERT INTO Users (email, first_name, last_name, created_at) VALUES (?, ?, ?, NOW())',
                [payload.email, payload.given_name, payload.family_name]
            );
            userId = result.insertId;
        }

        // Generate JWT token
        const token = jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;