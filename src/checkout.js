// const pool = require('./db');
// require('dotenv').config();

// // Middleware to validate checkout data
// const validateCheckoutData = (req, res, next) => {
//     const { shippingData, billingData, paymentData, orderData } = req.body;
//     if (!shippingData || !billingData || !paymentData || !orderData) {
//         return res.status(400).json({ error: 'Missing required checkout data' });
//     }
//     next();
// };

// // Main checkout handler
// const handleCheckout = async (req, res) => {
//     const userId = req.user.user_id; // Extracted from JWT by authenticateToken
//     const { shippingData, billingData, paymentData, orderData } = req.body;

//     try {
//         const connection = await pool.getConnection();
//         await connection.beginTransaction();

//         try {
//             // Insert shipping address
//             const [shippingResult] = await connection.query(
//                 'INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, zip_code, phone, address_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//                 [userId, shippingData.firstName, shippingData.lastName, shippingData.address, shippingData.city, shippingData.state, shippingData.zip, shippingData.phone, 'shipping']
//             );
//             const shippingAddressId = shippingResult.insertId;

//             // Insert billing address
//             const [billingResult] = await connection.query(
//                 'INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, zip_code, phone, address_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//                 [userId, billingData.firstName, billingData.lastName, billingData.address, billingData.city, billingData.state, billingData.zip, billingData.phone, 'billing']
//             );
//             const billingAddressId = billingResult.insertId;

//             // Insert payment
//             let paymentId;
//             if (paymentData.method === 'Credit Card') {
//                 const [paymentResult] = await connection.query(
//                     'INSERT INTO payments (user_id, card_number, name_on_card, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)',
//                     [userId, paymentData.cardNumber, paymentData.nameOnCard, paymentData.expiryDate, paymentData.cvv]
//                 );
//                 paymentId = paymentResult.insertId;
//             } else {
//                 const [paymentResult] = await connection.query(
//                     'INSERT INTO payments (user_id, card_number, name_on_card, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)',
//                     [userId, 'N/A', paymentData.nameOnCard || paymentData.method || 'N/A', 'N/A', 'N/A']
//                 );
//                 paymentId = paymentResult.insertId;
//             }

//             // Insert order
//             const [orderResult] = await connection.query(
//                 'INSERT INTO orders (user_id, shipping_address_id, billing_address_id, payment_id, subtotal, shipping_cost, tax, total, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//                 [userId, shippingAddressId, billingAddressId, paymentId, orderData.subtotal, orderData.shipping, orderData.tax, orderData.total, 'pending']
//             );
//             const orderId = orderResult.insertId;

//             // Insert order items with fallback for productId
//             for (const item of orderData.items) {
//                 await connection.query(
//                     'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
//                     [orderId, item.productId || null, item.quantity, item.price]
//                 );
//             }

//             // Remove items from cart
//             await connection.query('DELETE FROM CartItems WHERE user_id = ?', [userId]);

//             await connection.commit();
//             connection.release();
//             res.status(200).json({ message: 'Order placed successfully', orderId });
//         } catch (error) {
//             await connection.rollback();
//             connection.release();
//             throw error;
//         }
//     } catch (error) {
//         console.error('Checkout error:', error);
//         res.status(500).json({ error: 'Failed to process order' });
//     }
// };

// module.exports = { validateCheckoutData, handleCheckout };

const pool = require('./db');
require('dotenv').config();

// Middleware to validate checkout data
const validateCheckoutData = (req, res, next) => {
    const { shippingData, billingData, paymentData, orderData } = req.body;
    if (!shippingData || !billingData || !paymentData || !orderData) {
        return res.status(400).json({ error: 'Missing required checkout data' });
    }
    next();
};

// Main checkout handler
const handleCheckout = async (req, res) => {
    const userId = req.user.user_id; // Extracted from JWT by authenticateToken
    const { shippingData, billingData, paymentData, orderData } = req.body;

    // Debug log to inspect paymentData
    console.log('Received paymentData:', paymentData);

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert shipping address
            const [shippingResult] = await connection.query(
                'INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, zip_code, phone, address_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, shippingData.firstName, shippingData.lastName, shippingData.address, shippingData.city, shippingData.state, shippingData.zip, shippingData.phone, 'shipping']
            );
            const shippingAddressId = shippingResult.insertId;

            // Insert billing address
            const [billingResult] = await connection.query(
                'INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, zip_code, phone, address_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, billingData.firstName, billingData.lastName, billingData.address, billingData.city, billingData.state, billingData.zip, billingData.phone, 'billing']
            );
            const billingAddressId = billingResult.insertId;

            // Insert payment
            let paymentId;
            if (paymentData.method === 'Credit Card') {
                const [paymentResult] = await connection.query(
                    'INSERT INTO payments (user_id, card_number, name_on_card, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)',
                    [userId, paymentData.cardNumber, paymentData.nameOnCard, paymentData.expiryDate, paymentData.cvv]
                );
                paymentId = paymentResult.insertId;
            } else {
                const [paymentResult] = await connection.query(
                    'INSERT INTO payments (user_id, card_number, name_on_card, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)',
                    [userId, 'N/A', paymentData.nameOnCard || paymentData.method || 'N/A', 'N/A', 'N/A']
                );
                paymentId = paymentResult.insertId;
            }

            // Insert order
            const [orderResult] = await connection.query(
                'INSERT INTO orders (user_id, shipping_address_id, billing_address_id, payment_id, subtotal, shipping_cost, tax, total, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, shippingAddressId, billingAddressId, paymentId, orderData.subtotal, orderData.shipping, orderData.tax, orderData.total, 'pending']
            );
            const orderId = orderResult.insertId;

            // Insert order items with fallback for productId
            for (const item of orderData.items) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                    [orderId, item.productId || null, item.quantity, item.price]
                );
            }

            // Remove items from cart
            await connection.query('DELETE FROM CartItems WHERE user_id = ?', [userId]);

            await connection.commit();
            connection.release();
            res.status(200).json({ message: 'Order placed successfully', orderId });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to process order' });
    }
};

module.exports = { validateCheckoutData, handleCheckout };