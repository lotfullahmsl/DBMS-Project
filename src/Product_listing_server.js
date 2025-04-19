require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002']
}));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.static(path.join(__dirname, '../public')));

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
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
        `);
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`Fetching product with ID: ${id}`);
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
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
            WHERE p.product_id = ?
        `, [id]);
        console.log('Query result:', products);
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(products[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.listen(port, () => {
    console.log(`Product Listing server running on http://localhost:${port}`);
});