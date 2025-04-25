
// const express = require('express');
// const pool = require('./db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { OAuth2Client } = require('google-auth-library');

// // Create a router
// const router = express.Router();

// // Secret key for JWT (should be stored in environment variable in production)
// require('dotenv').config();
// const JWT_SECRET = process.env.JWT_SECRET;

// // Google OAuth2 client
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Sign-up route
// router.post('/signup', async (req, res) => {
//     const { email, password, first_name, last_name } = req.body;

//     if (!email || !password || !first_name || !last_name) {
//         return res.status(400).json({ success: false, message: 'All fields are required' });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         return res.status(400).json({ success: false, message: 'Invalid email format' });
//     }

//     const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
//     if (!passwordRegex.test(password)) {
//         return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and include a number and a special character' });
//     }

//     try {
//         const [existingUsers] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
//         if (existingUsers.length > 0) {
//             return res.status(400).json({ success: false, message: 'Email already in use' });
//         }

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         const [result] = await pool.query(
//             'INSERT INTO Users (email, password, first_name, last_name, created_at) VALUES (?, ?, ?, ?, NOW())',
//             [email, hashedPassword, first_name, last_name]
//         );

//         res.status(201).json({ success: true, message: 'User registered successfully' });
//     } catch (error) {
//         console.error('Error during sign-up:', error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// // Sign-in route
// router.post('/signin', async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     try {
//         const [users] = await pool.query('SELECT user_id, email, password FROM Users WHERE email = ?', [email]);
//         if (users.length === 0) {
//             return res.status(401).json({ success: false, message: 'Invalid email or password' });
//         }

//         const user = users[0];
//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return res.status(401).json({ success: false, message: 'Invalid email or password' });
//         }

//         const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
//         res.json({ success: true, token });
//     } catch (error) {
//         console.error('Error during sign-in:', error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// // Google Login route
// router.post('/auth/google', async (req, res) => {
//     const { idToken } = req.body;

//     if (!idToken) {
//         return res.status(400).json({ success: false, message: 'ID token is required' });
//     }

//     try {
//         // Verify the Google ID token
//         const ticket = await googleClient.verifyIdToken({
//             idToken,
//             audience: process.env.GOOGLE_CLIENT_ID
//         });
//         const payload = ticket.getPayload();

//         if (!payload.email) {
//             return res.status(400).json({ success: false, message: 'Email is required from Google' });
//         }

//         // Check if user exists
//         const [users] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [payload.email]);
//         let userId;

//         if (users.length > 0) {
//             // User exists, use their ID
//             userId = users[0].user_id;
//         } else {
//             // Create a new user
//             const [result] = await pool.query(
//                 'INSERT INTO Users (email, first_name, last_name, created_at) VALUES (?, ?, ?, NOW())',
//                 [payload.email, payload.given_name, payload.family_name]
//             );
//             userId = result.insertId;
//         }

//         // Generate JWT token
//         const token = jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: '1h' });
//         res.json({ success: true, token });
//     } catch (error) {
//         console.error('Error during Google login:', error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// module.exports = router;

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

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get user information
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, email, first_name, last_name FROM Users WHERE user_id = ?',
            [req.user.user_id]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

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
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long and include a number and a special character'
        });
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

        // If the user has no password (e.g., Google Sign-In user), they can't sign in with email/password
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: 'This account uses Google Sign-In. Please sign in with Google.'
            });
        }

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

        // Extract user information from the payload
        const { email, given_name, family_name } = payload;

        // Check if user exists
        const [users] = await pool.query('SELECT user_id, first_name, last_name FROM Users WHERE email = ?', [email]);
        let userId;

        if (users.length > 0) {
            // User exists, update their profile if needed
            const user = users[0];
            if (user.first_name !== (given_name || 'Unknown') || user.last_name !== (family_name || 'Unknown')) {
                await pool.query(
                    'UPDATE Users SET first_name = ?, last_name = ? WHERE user_id = ?',
                    [given_name || 'Unknown', family_name || 'Unknown', user.user_id]
                );
            }
            userId = user.user_id;
            console.log('Returning Google Sign-In user found:', { user_id: userId, email });
        } else {
            // Create a new user (no password for Google Sign-In users)
            const [result] = await pool.query(
                'INSERT INTO Users (email, first_name, last_name, created_at) VALUES (?, ?, ?, NOW())',
                [email, given_name || 'Unknown', family_name || 'Unknown']
            );
            userId = result.insertId;
            console.log('New Google Sign-In user created:', { user_id: userId, email });
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