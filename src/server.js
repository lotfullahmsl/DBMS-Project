const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Get all products (for product-listing.html, index.html)
app.get('/api/products', async (req, res) => {
    try {
        const { category_id, min_price, max_price } = req.query;
        let query = `
            SELECT p.product_id, p.name, p.price, p.stock, pi.image_url AS primary_image_url
            FROM Products p
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
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

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Public server running at http://localhost:${port}`);
});