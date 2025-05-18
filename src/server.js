// const express = require('express');
// const pool = require('./db');
// const userRoutes = require('./userRoutes');
// const cors = require('cors');
// const app = express();
// const port = 3000;

// // Middleware to parse JSON and serve static files
// app.use(express.json());
// app.use(express.static('public'));
// app.use(cors()); // Enable CORS for frontend requests

// // Use user routes
// app.use('/api', userRoutes);

// // Get all categories (ensure distinct category names)
// app.get('/api/categories', async (req, res) => {
//     try {
//         const [rows] = await pool.query(`
//             SELECT DISTINCT category_id, category_name
//             FROM Categories
//             ORDER BY category_name ASC
//         `);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching categories:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all products (for product-listing.html, index.html, search.html)
// app.get('/api/products', async (req, res) => {
//     try {
//         const { category_id, min_price, max_price, search, sort } = req.query;
//         let query = `
//             SELECT p.product_id, p.name, p.price, p.stock, pi.image_url AS primary_image_url, p.category_id, c.category_name
//             FROM Products p
//             LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE 1=1
//         `;
//         const params = [];

//         if (category_id) {
//             query += ' AND p.category_id = ?';
//             params.push(parseInt(category_id));
//         }
//         if (min_price) {
//             query += ' AND p.price >= ?';
//             params.push(parseFloat(min_price));
//         }
//         if (max_price) {
//             query += ' AND p.price <= ?';
//             params.push(parseFloat(max_price));
//         }
//         if (search) {
//             //  i have cheanged this to only search product name
//             query += ' AND p.name LIKE ?';
//             const searchTerm = `%${search}%`;
//             params.push(searchTerm);
//         }

//         // Sorting
//         if (sort) {
//             switch (sort) {
//                 case 'price-low-high':
//                     query += ' ORDER BY p.price ASC';
//                     break;
//                 case 'price-high-low':
//                     query += ' ORDER BY p.price DESC';
//                     break;
//                 case 'newest':
//                     query += ' ORDER BY p.product_id DESC'; // Assuming newer products have higher IDs
//                     break;
//                 default:
//                     query += ' ORDER BY p.product_id ASC';
//             }
//         }

//         const [rows] = await pool.query(query, params);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching products:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get product details (for product details view, if implemented)
// app.get('/api/products/:id', async (req, res) => {
//     try {
//         const productId = parseInt(req.params.id);
//         const [productRows] = await pool.query(`
//             SELECT p.product_id, p.name, p.description, p.price, p.stock, c.category_name
//             FROM Products p
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE p.product_id = ?
//         `, [productId]);

//         if (productRows.length === 0) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         const [imageRows] = await pool.query(`
//             SELECT image_url, is_primary
//             FROM Product_Images
//             WHERE product_id = ?
//             ORDER BY is_primary DESC
//         `, [productId]);

//         res.json({
//             product: productRows[0],
//             images: imageRows
//         });
//     } catch (error) {
//         console.error('Error fetching product details:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Public server running at http://localhost:${port}`);
// });

// const express = require('express');
// const pool = require('./db');
// const userRoutes = require('./userRoutes');
// const cors = require('cors');
// const app = express();
// const port = 3000;

// // Middleware to parse JSON and serve static files
// app.use(express.json());
// app.use(express.static('public'));
// app.use(cors()); // Enable CORS for frontend requests

// // Use user routes
// app.use('/api', userRoutes);

// // Get all categories (ensure distinct category names)
// app.get('/api/categories', async (req, res) => {
//     try {
//         const [rows] = await pool.query(`
//             SELECT DISTINCT category_id, category_name
//             FROM Categories
//             ORDER BY category_name ASC
//         `);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching categories:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all products (for product-listing.html, index.html, search.html)
// app.get('/api/products', async (req, res) => {
//     try {
//         const { category_id, min_price, max_price, search, sort } = req.query;
//         let query = `
//             SELECT p.product_id, p.name, p.price, p.stock, pi.image_url AS primary_image_url, p.category_id, c.category_name
//             FROM Products p
//             LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE 1=1
//         `;
//         const params = [];

//         if (category_id) {
//             query += ' AND p.category_id = ?';
//             params.push(parseInt(category_id));
//         }
//         if (min_price) {
//             query += ' AND p.price >= ?';
//             params.push(parseFloat(min_price));
//         }
//         if (max_price) {
//             query += ' AND p.price <= ?';
//             params.push(parseFloat(max_price));
//         }
//         if (search) {
//             query += ' AND p.name LIKE ?';
//             const searchTerm = `%${search}%`;
//             params.push(searchTerm);
//         }

//         // Sorting
//         if (sort) {
//             switch (sort) {
//                 case 'price-low-high':
//                     query += ' ORDER BY p.price ASC';
//                     break;
//                 case 'price-high-low':
//                     query += ' ORDER BY p.price DESC';
//                     break;
//                 case 'newest':
//                     query += ' ORDER BY p.product_id DESC'; // Assuming newer products have higher IDs
//                     break;
//                 default:
//                     query += ' ORDER BY p.product_id ASC';
//             }
//         }

//         const [rows] = await pool.query(query, params);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching products:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get product details (for product details view, if implemented)
// app.get('/api/products/:id', async (req, res) => {
//     try {
//         const productId = parseInt(req.params.id);
//         const [productRows] = await pool.query(`
//             SELECT p.product_id, p.name, p.description, p.price, p.stock, c.category_name
//             FROM Products p
//             LEFT JOIN Categories c ON*p.category_id = c.category_id
//             WHERE p.product_id = ?
//         `, [productId]);

//         if (productRows.length === 0) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         const [imageRows] = await pool.query(`
//             SELECT image_url, is_primary
//             FROM Product_Images
//             WHERE product_id = ?
//             ORDER BY is_primary DESC
//         `, [productId]);

//         res.json({
//             product: productRows[0],
//             images: imageRows
//         });
//     } catch (error) {
//         console.error('Error fetching product details:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all orders for a specific user
// app.get('/api/orders', async (req, res) => {
//     try {
//         const userId = parseInt(req.query.user_id);
//         if (!userId) {
//             return res.status(400).json({ error: 'user_id is required' });
//         }

//         const [orderRows] = await pool.query(`
//             SELECT 
//                 o.order_id,
//                 o.user_id,
//                 o.subtotal,
//                 o.shipping_cost,
//                 o.tax,
//                 o.total AS total_price,
//                 o.order_status AS status,
//                 o.created_at AS order_date,
//                 o.updated_at AS delivery_date
//             FROM orders o
//             WHERE o.user_id = ?
//             ORDER BY o.created_at DESC
//         `, [userId]);

//         // Fetch order items for each order
//         const orders = await Promise.all(orderRows.map(async (order) => {
//             const [itemRows] = await pool.query(`
//                 SELECT 
//                     oi.order_item_id,
//                     oi.order_id,
//                     oi.product_id,
//                     oi.quantity,
//                     oi.price_at_purchase,
//                     p.name AS product_name,
//                     pi.image_url AS primary_image_url
//                 FROM order_items oi
//                 JOIN products p ON oi.product_id = p.product_id
//                 LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//                 WHERE oi.order_id = ?
//             `, [order.order_id]);

//             return {
//                 ...order,
//                 items: itemRows
//             };
//         }));

//         res.json(orders);
//     } catch (error) {
//         console.error('Error fetching orders:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Public server running at http://localhost:${port}`);
// });

// fine new one 
// const express = require('express');
// const pool = require('./db');
// const userRoutes = require('./userRoutes');
// const cors = require('cors');
// const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
// const app = express();
// const port = 3000;

// // Middleware to parse JSON and serve static files
// app.use(express.json());
// app.use(express.static('public'));
// app.use(cors()); // Enable CORS for frontend requests

// // Use user routes
// app.use('/api', userRoutes);

// // Login endpoint to validate email and password
// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email and password are required' });
//         }

//         // Query the Users table for the email
//         const [users] = await pool.query(`
//             SELECT user_id, email, password
//             FROM Users
//             WHERE email = ?
//         `, [email]);

//         if (users.length === 0) {
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         const user = users[0];

//         // Compare the provided password with the stored hashed password
//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         // Return the user_id on successful login
//         res.json({ user_id: user.user_id });
//     } catch (error) {
//         console.error('Error during login:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all categories (ensure distinct category names)
// app.get('/api/categories', async (req, res) => {
//     try {
//         const [rows] = await pool.query(`
//             SELECT DISTINCT category_id, category_name
//             FROM Categories
//             ORDER BY category_name ASC
//         `);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching categories:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all products (for product-listing.html, index.html, search.html)
// app.get('/api/products', async (req, res) => {
//     try {
//         const { category_id, min_price, max_price, search, sort } = req.query;
//         let query = `
//             SELECT p.product_id, p.name, p.price, p.stock, pi.image_url AS primary_image_url, p.category_id, c.category_name
//             FROM Products p
//             LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE 1=1
//         `;
//         const params = [];

//         if (category_id) {
//             query += ' AND p.category_id = ?';
//             params.push(parseInt(category_id));
//         }
//         if (min_price) {
//             query += ' AND p.price >= ?';
//             params.push(parseFloat(min_price));
//         }
//         if (max_price) {
//             query += ' AND p.price <= ?';
//             params.push(parseFloat(max_price));
//         }
//         if (search) {
//             query += ' AND p.name LIKE ?';
//             const searchTerm = `%${search}%`;
//             params.push(searchTerm);
//         }

//         // Sorting
//         if (sort) {
//             switch (sort) {
//                 case 'price-low-high':
//                     query += ' ORDER BY p.price ASC';
//                     break;
//                 case 'price-high-low':
//                     query += ' ORDER BY p.price DESC';
//                     break;
//                 case 'newest':
//                     query += ' ORDER BY p.product_id DESC'; // Assuming newer products have higher IDs
//                     break;
//                 default:
//                     query += ' ORDER BY p.product_id ASC';
//             }
//         }

//         const [rows] = await pool.query(query, params);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching products:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get product details (for product details view, if implemented)
// app.get('/api/products/:id', async (req, res) => {
//     try {
//         const productId = parseInt(req.params.id);
//         const [productRows] = await pool.query(`
//             SELECT p.product_id, p.name, p.description, p.price, p.stock, c.category_name
//             FROM Products p
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE p.product_id = ?
//         `, [productId]);

//         if (productRows.length === 0) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         const [imageRows] = await pool.query(`
//             SELECT image_url, is_primary
//             FROM Product_Images
//             WHERE product_id = ?
//             ORDER BY is_primary DESC
//         `, [productId]);

//         res.json({
//             product: productRows[0],
//             images: imageRows
//         });
//     } catch (error) {
//         console.error('Error fetching product details:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all orders for a specific user
// app.get('/api/orders', async (req, res) => {
//     try {
//         const userId = parseInt(req.query.user_id);
//         if (!userId) {
//             return res.status(400).json({ error: 'user_id is required' });
//         }

//         const [orderRows] = await pool.query(`
//             SELECT 
//                 o.order_id,
//                 o.user_id,
//                 o.subtotal,
//                 o.shipping_cost,
//                 o.tax,
//                 o.total AS total_price,
//                 o.order_status AS status,
//                 o.created_at AS order_date,
//                 o.updated_at AS delivery_date
//             FROM orders o
//             WHERE o.user_id = ?
//             ORDER BY o.created_at DESC
//         `, [userId]);

//         // Fetch order items for each order
//         const orders = await Promise.all(orderRows.map(async (order) => {
//             const [itemRows] = await pool.query(`
//                 SELECT 
//                     oi.order_item_id,
//                     oi.order_id,
//                     oi.product_id,
//                     oi.quantity,
//                     oi.price_at_purchase,
//                     p.name AS product_name,
//                     pi.image_url AS primary_image_url
//                 FROM order_items oi
//                 JOIN products p ON oi.product_id = p.product_id
//                 LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//                 WHERE oi.order_id = ?
//             `, [order.order_id]);

//             return {
//                 ...order,
//                 items: itemRows
//             };
//         }));

//         res.json(orders);
//     } catch (error) {
//         console.error('Error fetching orders:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Public server running at http://localhost:${port}`);
// });

// const express = require('express');
// const pool = require('./db');
// const userRoutes = require('./userRoutes');
// const cors = require('cors');
// const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
// const app = express();
// const port = 3000;

// // Middleware to parse JSON and serve static files
// app.use(express.json());
// app.use(express.static('public'));
// app.use(cors()); // Enable CORS for frontend requests

// // Use user routes
// app.use('/api', userRoutes);

// // Login endpoint to validate email and password
// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email and password are required' });
//         }

//         // Query the Users table for the email
//         const [users] = await pool.query(`
//             SELECT user_id, email, password
//             FROM Users
//             WHERE email = ?
//         `, [email]);

//         if (users.length === 0) {
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         const user = users[0];

//         // Compare the provided password with the stored hashed password
//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         // Return the user_id on successful login
//         res.json({ user_id: user.user_id });
//     } catch (error) {
//         console.error('Error during login:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all categories (ensure distinct category names)
// app.get('/api/categories', async (req, res) => {
//     try {
//         const [rows] = await pool.query(`
//             SELECT DISTINCT category_id, category_name
//             FROM Categories
//             ORDER BY category_name ASC
//         `);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching categories:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all products (for product-listing.html, index.html, search.html)
// app.get('/api/products', async (req, res) => {
//     try {
//         const { category_id, min_price, max_price, search, sort } = req.query;
//         let query = `
//             SELECT p.product_id, p.name, p.price, p.stock, pi.image_url AS primary_image_url, p.category_id, c.category_name
//             FROM Products p
//             LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE 1=1
//         `;
//         const params = [];

//         if (category_id) {
//             query += ' AND p.category_id = ?';
//             params.push(parseInt(category_id));
//         }
//         if (min_price) {
//             query += ' AND p.price >= ?';
//             params.push(parseFloat(min_price));
//         }
//         if (max_price) {
//             query += ' AND p.price <= ?';
//             params.push(parseFloat(max_price));
//         }
//         if (search) {
//             query += ' AND p.name LIKE ?';
//             const searchTerm = `%${search}%`;
//             params.push(searchTerm);
//         }

//         // Sorting
//         if (sort) {
//             switch (sort) {
//                 case 'price-low-high':
//                     query += ' ORDER BY p.price ASC';
//                     break;
//                 case 'price-high-low':
//                     query += ' ORDER BY p.price DESC';
//                     break;
//                 case 'newest':
//                     query += ' ORDER BY p.product_id DESC'; // Assuming newer products have higher IDs
//                     break;
//                 default:
//                     query += ' ORDER BY p.product_id ASC';
//             }
//         }

//         const [rows] = await pool.query(query, params);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching products:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get product details (for product details view, if implemented)
// app.get('/api/products/:id', async (req, res) => {
//     try {
//         const productId = parseInt(req.params.id);
//         const [productRows] = await pool.query(`
//             SELECT p.product_id, p.name, p.description, p.price, p.stock, c.category_name
//             FROM Products p
//             LEFT JOIN Categories c ON p.category_id = c.category_id
//             WHERE p.product_id = ?
//         `, [productId]);

//         if (productRows.length === 0) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         const [imageRows] = await pool.query(`
//             SELECT image_url, is_primary
//             FROM Product_Images
//             WHERE product_id = ?
//             ORDER BY is_primary DESC
//         `, [productId]);

//         res.json({
//             product: productRows[0],
//             images: imageRows
//         });
//     } catch (error) {
//         console.error('Error fetching product details:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Get all orders for a specific user
// app.get('/api/orders', async (req, res) => {
//     try {
//         const userId = parseInt(req.query.user_id);
//         if (!userId) {
//             return res.status(400).json({ error: 'user_id is required' });
//         }

//         const [orderRows] = await pool.query(`
//             SELECT 
//                 o.order_id,
//                 o.user_id,
//                 o.subtotal,
//                 o.shipping_cost,
//                 o.tax,
//                 o.total AS total_price,
//                 o.order_status AS status,
//                 o.created_at AS order_date,
//                 o.updated_at AS delivery_date
//             FROM orders o
//             WHERE o.user_id = ?
//             ORDER BY o.created_at DESC
//         `, [userId]);

//         // Fetch order items for each order
//         const orders = await Promise.all(orderRows.map(async (order) => {
//             const [itemRows] = await pool.query(`
//                 SELECT 
//                     oi.order_item_id,
//                     oi.order_id,
//                     oi.product_id,
//                     oi.quantity,
//                     oi.price_at_purchase,
//                     p.name AS product_name,
//                     pi.image_url AS primary_image_url
//                 FROM order_items oi
//                 JOIN products p ON oi.product_id = p.product_id
//                 LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//                 WHERE oi.order_id = ?
//             `, [order.order_id]);

//             return {
//                 ...order,
//                 items: itemRows
//             };
//         }));

//         res.json(orders);
//     } catch (error) {
//         console.error('Error fetching orders:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // New endpoint for homepage products (index.html)
// app.get('/api/home-products', async (req, res) => {
//     try {
//         const [rows] = await pool.query(`
//             SELECT p.product_id, p.name, p.price AS price_range, pi.image_url AS primary_image_url
//             FROM Products p
//             LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
//             LIMIT 16
//         `);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching home products:', error.message);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Public server running at http://localhost:${port}`);
// });

const express = require('express');
const pool = require('./db');
const userRoutes = require('./userRoutes');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
const app = express();
const port = 3000;

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));
app.use(cors()); // Enable CORS for frontend requests

// Use user routes
app.use('/api', userRoutes);

// Login endpoint to validate email and password
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Query the Users table for the email
        const [users] = await pool.query(`
            SELECT user_id, email, password
            FROM Users
            WHERE email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return the user_id on successful login
        res.json({ user_id: user.user_id });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get all categories (ensure distinct category names)
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT category_id, category_name
            FROM Categories
            ORDER BY category_name ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get all products (for product-listing.html, index.html, search.html)
app.get('/api/products', async (req, res) => {
    try {
        const { category_id, min_price, max_price, search, sort } = req.query;
        let query = `
            SELECT p.product_id, p.name, p.price, p.stock, pi.image_url AS primary_image_url, p.category_id, c.category_name
            FROM Products p
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
            LEFT JOIN Categories c ON p.category_id = c.category_id
            WHERE 1=1
        `;
        const params = [];

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(parseInt(category_id));
        }
        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(max_price));
        }
        if (search) {
            query += ' AND p.name LIKE ?';
            const searchTerm = `%${search}%`;
            params.push(searchTerm);
        }

        // Sorting
        if (sort) {
            switch (sort) {
                case 'price-low-high':
                    query += ' ORDER BY p.price ASC';
                    break;
                case 'price-high-low':
                    query += ' ORDER BY p.price DESC';
                    break;
                case 'newest':
                    query += ' ORDER BY p.product_id DESC'; // Assuming newer products have higher IDs
                    break;
                default:
                    query += ' ORDER BY p.product_id ASC';
            }
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get product details (for product details view, if implemented)
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [productRows] = await pool.query(`
            SELECT p.product_id, p.name, p.description, p.price, p.stock, c.category_name
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `, [productId]);

        if (productRows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const [imageRows] = await pool.query(`
            SELECT image_url, is_primary
            FROM Product_Images
            WHERE product_id = ?
            ORDER BY is_primary DESC
        `, [productId]);

        res.json({
            product: productRows[0],
            images: imageRows
        });
    } catch (error) {
        console.error('Error fetching product details:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get all orders for a specific user
app.get('/api/orders', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id);
        if (!userId) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const [orderRows] = await pool.query(`
            SELECT 
                o.order_id,
                o.user_id,
                o.subtotal,
                o.shipping_cost,
                o.tax,
                o.total AS total_price,
                o.order_status AS status,
                o.created_at AS order_date,
                o.updated_at AS delivery_date
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [userId]);

        // Fetch order items for each order
        const orders = await Promise.all(orderRows.map(async (order) => {
            const [itemRows] = await pool.query(`
                SELECT 
                    oi.order_item_id,
                    oi.order_id,
                    oi.product_id,
                    oi.quantity,
                    oi.price_at_purchase,
                    p.name AS product_name,
                    pi.image_url AS primary_image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
                WHERE oi.order_id = ?
            `, [order.order_id]);

            return {
                ...order,
                items: itemRows
            };
        }));

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// New endpoint for homepage products (index.html) with random selection
app.get('/api/home-products', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.product_id, p.name, p.price AS price_range, pi.image_url AS primary_image_url, c.category_name
            FROM Products p
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
            LEFT JOIN Categories c ON p.category_id = c.category_id
            ORDER BY RAND()
            LIMIT 16
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching home products:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Public server running at http://localhost:${port}`);
});