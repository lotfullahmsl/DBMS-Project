require('dotenv').config(); // Load .env file
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors'); // Add CORS

const app = express();
const port = 3002;

// Enable CORS for http://localhost:3000
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, '../public'))); // Adjusted path since server is in src/

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT 
                p.product_id,
                p.name,
                p.price,
                p.description,
                p.stock,
                c.category_name,
                d.discount_code,
                d.percentage AS discount_percentage,
                d.expiration_date,
                pi.image_url AS primary_image_url
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.category_id
            LEFT JOIN Discounts d ON p.discount_id = d.discount_id
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
        `);
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Product Listing server running on http://localhost:${port}`);
});