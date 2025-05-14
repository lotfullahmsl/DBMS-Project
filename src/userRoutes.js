const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Create a router
const router = express.Router();

// Load environment variables
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Google OAuth2 client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"
    console.log('Received authorization header:', authHeader);
    console.log('Extracted token:', token);

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        console.log('Token verified, user:', user);
        req.user = user;
        next();
    });
};

// Get user information
router.get('/user', authenticateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            console.log('Invalid user object:', req.user);
            return res.status(400).json({ success: false, message: 'Invalid user session' });
        }
        console.log('Fetching user data for user_id:', req.user.user_id);
        const [users] = await pool.query(
            'SELECT user_id, email, first_name, last_name, profile_picture FROM Users WHERE user_id = ?',
            [req.user.user_id]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Update user profile
router.post('/profile/update', authenticateToken, async (req, res) => {
    const { first_name, last_name, profile_picture, current_password, password } = req.body;

    if (!first_name || !last_name) {
        return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }

    if (profile_picture) {
        try {
            new URL(profile_picture);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid profile picture URL' });
        }
    }

    try {
        const [users] = await pool.query(
            'SELECT password FROM Users WHERE user_id = ?',
            [req.user.user_id]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        let hashedPassword = user.password;

        if (password) {
            if (!user.password) {
                return res.status(403).json({
                    success: false,
                    message: 'This account uses Google Sign-In. Password updates are not supported.'
                });
            }

            if (!current_password) {
                return res.status(400).json({ success: false, message: 'Current password is required to update password' });
            }

            const match = await bcrypt.compare(current_password, user.password);
            if (!match) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters long and include a number and a special character'
                });
            }

            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        await pool.query(
            'UPDATE Users SET first_name = ?, last_name = ?, profile_picture = ?, password = ? WHERE user_id = ?',
            [first_name, last_name, profile_picture || null, hashedPassword, req.user.user_id]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Delete user account
router.delete('/profile/delete', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM Users WHERE user_id = ?',
            [req.user.user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
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
        console.error('Error during sign-up:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
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
        console.error('Error during sign-in:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Google Login route
router.post('/auth/google', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'ID token is required' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        if (!payload.email) {
            return res.status(400).json({ success: false, message: 'Email is required from Google' });
        }

        const { email, given_name, family_name } = payload;

        const [users] = await pool.query('SELECT user_id, first_name, last_name FROM Users WHERE email = ?', [email]);
        let userId;

        if (users.length > 0) {
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
            const [result] = await pool.query(
                'INSERT INTO Users (email, first_name, last_name, created_at) VALUES (?, ?, ?, NOW())',
                [email, given_name || 'Unknown', family_name || 'Unknown']
            );
            userId = result.insertId;
            console.log('New Google Sign-In user created:', { user_id: userId, email });
        }

        const token = jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during Google login:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Get cart items for the logged-in user
router.get('/cart', authenticateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            console.log('Invalid user object:', req.user);
            return res.status(400).json({ success: false, message: 'Invalid user session' });
        }
        console.log('Fetching cart for user_id:', req.user.user_id);
        const [cartItems] = await pool.query(
            'SELECT ci.cart_item_id, ci.product_id, ci.quantity, ci.added_at, p.name, p.price, pi.image_url ' +
            'FROM CartItems ci ' +
            'LEFT JOIN Products p ON ci.product_id = p.product_id ' +
            'LEFT JOIN product_images pi ON p.product_id = pi.product_id ' +
            'WHERE ci.user_id = ?',
            [req.user.user_id]
        );
        console.log('Cart items fetched:', cartItems);
        res.json({ success: true, cartItems: cartItems || [] });
    } catch (error) {
        console.error('Error fetching cart items:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Add item to cart
router.post('/cart/add', authenticateToken, async (req, res) => {
    const { product_id, quantity } = req.body;

    if (!product_id || quantity === undefined || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Product ID and valid quantity are required' });
    }

    try {
        if (!req.user || !req.user.user_id) {
            return res.status(400).json({ success: false, message: 'Invalid user session' });
        }
        console.log('Adding item to cart for user_id:', req.user.user_id, 'product_id:', product_id, 'quantity:', quantity);
        const [products] = await pool.query(
            'SELECT product_id, stock FROM Products WHERE product_id = ?',
            [product_id]
        );
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (products[0].stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        const [existingItems] = await pool.query(
            'SELECT quantity FROM CartItems WHERE user_id = ? AND product_id = ?',
            [req.user.user_id, product_id]
        );

        if (existingItems.length > 0) {
            const newQuantity = existingItems[0].quantity + quantity;
            if (products[0].stock < newQuantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock for additional quantity' });
            }
            await pool.query(
                'UPDATE CartItems SET quantity = ? WHERE user_id = ? AND product_id = ?',
                [newQuantity, req.user.user_id, product_id]
            );
        } else {
            await pool.query(
                'INSERT INTO CartItems (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())',
                [req.user.user_id, product_id, quantity]
            );
        }

        res.json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding item to cart:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Update item quantity in cart
router.put('/cart/update', authenticateToken, async (req, res) => {
    const { cart_item_id, quantity } = req.body;

    if (!cart_item_id || quantity === undefined || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Cart item ID and valid quantity are required' });
    }

    try {
        if (!req.user || !req.user.user_id) {
            return res.status(400).json({ success: false, message: 'Invalid user session' });
        }
        console.log('Updating quantity for cart_item_id:', cart_item_id, 'to:', quantity, 'for user_id:', req.user.user_id);
        const [existingItems] = await pool.query(
            'SELECT product_id, quantity FROM CartItems WHERE cart_item_id = ? AND user_id = ?',
            [cart_item_id, req.user.user_id]
        );
        if (existingItems.length === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found or unauthorized' });
        }

        const [products] = await pool.query(
            'SELECT stock FROM Products WHERE product_id = ?',
            [existingItems[0].product_id]
        );
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (products[0].stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        await pool.query(
            'UPDATE CartItems SET quantity = ? WHERE cart_item_id = ? AND user_id = ?',
            [quantity, cart_item_id, req.user.user_id]
        );

        res.json({ success: true, message: 'Quantity updated successfully' });
    } catch (error) {
        console.error('Error updating quantity:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Remove item from cart
router.delete('/cart/remove', authenticateToken, async (req, res) => {
    const { cart_item_id } = req.body;

    if (!cart_item_id) {
        return res.status(400).json({ success: false, message: 'Cart item ID is required' });
    }

    try {
        if (!req.user || !req.user.user_id) {
            return res.status(400).json({ success: false, message: 'Invalid user session' });
        }
        console.log('Removing cart_item_id:', cart_item_id, 'for user_id:', req.user.user_id);
        const [result] = await pool.query(
            'DELETE FROM CartItems WHERE cart_item_id = ? AND user_id = ?',
            [cart_item_id, req.user.user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found or unauthorized' });
        }

        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing item from cart:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

const { validateCheckoutData, handleCheckout } = require('./checkout');
router.post('/checkout', authenticateToken, validateCheckoutData, handleCheckout);

module.exports = router;

// module.exports = router;