const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create a router
const router = express.Router();

// Secret key for JWT (should be stored in environment variable in production)
const JWT_SECRET = 'your_jwt_secret_key_here';

// Sign-up route (stores data in Users table)
router.post('/signup', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    // Validate input
    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Password requirements (at least 8 characters, 1 number, 1 special character)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and include a number and a special character' });
    }

    try {
        // Check if email already exists
        const [existingUsers] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the Users table
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

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const [users] = await pool.query('SELECT user_id, email, password FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare password with hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;