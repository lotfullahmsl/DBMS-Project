const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pool = require('./db');

const app = express();
const port = 3001;

// Enable CORS for requests from http://localhost:3000
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: './public/images/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

// Add product with discount and images
app.post('/api/admin/products', upload.array('images'), async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const {
            productName,
            productCategory,
            productPrice,
            productStock,
            discountCode,
            discountPercentage,
            discountExpiration,
            productDescription
        } = req.body;

        // Validate inputs
        if (!productName || !productCategory || !productPrice || !productStock || !productDescription) {
            await connection.rollback();
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Normalize category name (trim whitespace)
        const normalizedCategory = productCategory.trim();
        if (!normalizedCategory) {
            await connection.rollback();
            return res.status(400).json({ error: 'Invalid category name' });
        }

        // Always insert a new category to get a new category_id
        const [categoryResult] = await connection.query(
            'INSERT INTO Categories (category_name) VALUES (?)',
            [normalizedCategory]
        );
        const category_id = categoryResult.insertId;
        if (!category_id) {
            throw new Error('Failed to create new category');
        }

        // Insert or get discount
        let discount_id = null;
        if (discountCode && discountPercentage && discountExpiration) {
            const [discountRows] = await connection.query(
                'SELECT discount_id FROM Discounts WHERE discount_code = ?',
                [discountCode]
            );
            if (discountRows.length > 0) {
                discount_id = discountRows[0].discount_id;
                await connection.query(
                    'UPDATE Discounts SET percentage = ?, expiration_date = ? WHERE discount_id = ?',
                    [parseFloat(discountPercentage), discountExpiration, discount_id]
                );
            } else {
                const [discountResult] = await connection.query(
                    'INSERT INTO Discounts (discount_code, percentage, expiration_date) VALUES (?, ?, ?)',
                    [discountCode, parseFloat(discountPercentage), discountExpiration]
                );
                discount_id = discountResult.insertId;
            }
        }

        // Insert product
        const [productResult] = await connection.query(
            'INSERT INTO Products (name, description, price, stock, category_id, discount_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
                productName,
                productDescription,
                parseFloat(productPrice),
                parseInt(productStock),
                category_id,
                discount_id
            ]
        );
        const product_id = productResult.insertId;

        // Handle images
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                const image_url = `/images/${file.filename}`;
                const is_primary = index === 0 ? 1 : 0;
                await connection.query(
                    'INSERT INTO Product_Images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                    [product_id, image_url, is_primary]
                );
            }
        } else if (req.body.productImageUrl) {
            await connection.query(
                'INSERT INTO Product_Images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                [product_id, req.body.productImageUrl, 1]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Product added successfully', product_id });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding product:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ error: 'Failed to add product: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Get all products for admin
app.get('/api/admin/products', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.product_id, 
                p.name, 
                p.price, 
                p.stock, 
                p.description,
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
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
    let connection;
    try {
        const productId = parseInt(req.params.id);

        // Start a transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Get the product's category_id and discount_id before deletion
        const [productRows] = await connection.query(
            'SELECT category_id, discount_id FROM Products WHERE product_id = ?',
            [productId]
        );
        if (productRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }
        const { category_id, discount_id } = productRows[0];

        // Delete the product (cascades to Product_Images)
        const [result] = await connection.query(
            'DELETE FROM Products WHERE product_id = ?',
            [productId]
        );
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if category_id is still referenced by other products
        if (category_id) {
            const [categoryCount] = await connection.query(
                'SELECT COUNT(*) as count FROM Products WHERE category_id = ?',
                [category_id]
            );
            if (categoryCount[0].count === 0) {
                await connection.query(
                    'DELETE FROM Categories WHERE category_id = ?',
                    [category_id]
                );
            }
        }

        // Check if discount_id is still referenced by other products
        if (discount_id) {
            const [discountCount] = await connection.query(
                'SELECT COUNT(*) as count FROM Products WHERE discount_id = ?',
                [discount_id]
            );
            if (discountCount[0].count === 0) {
                await connection.query(
                    'DELETE FROM Discounts WHERE discount_id = ?',
                    [discount_id]
                );
            }
        }

        // Commit the transaction
        await connection.commit();
        res.json({ message: 'Product and related data deleted successfully' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Update product with discount and images
app.put('/api/admin/products/:id', upload.array('images'), async (req, res) => {
    let connection;
    try {
        const productId = parseInt(req.params.id);
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const {
            productName,
            productCategory,
            productPrice,
            productStock,
            discountCode,
            discountPercentage,
            discountExpiration,
            productDescription
        } = req.body;

        // Validate inputs
        if (!productName || !productCategory || !productPrice || !productStock || !productDescription) {
            await connection.rollback();
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Check if product exists
        const [productRows] = await connection.query(
            'SELECT 1 FROM Products WHERE product_id = ?',
            [productId]
        );
        if (productRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        // Normalize category name (trim whitespace)
        const normalizedCategory = productCategory.trim();
        if (!normalizedCategory) {
            await connection.rollback();
            return res.status(400).json({ error: 'Invalid category name' });
        }

        // Always insert a new category to get a new category_id
        const [categoryResult] = await connection.query(
            'INSERT INTO Categories (category_name) VALUES (?)',
            [normalizedCategory]
        );
        const category_id = categoryResult.insertId;
        if (!category_id) {
            throw new Error('Failed to create new category');
        }

        // Insert or get discount
        let discount_id = null;
        if (discountCode && discountPercentage && discountExpiration) {
            const [discountRows] = await connection.query(
                'SELECT discount_id FROM Discounts WHERE discount_code = ?',
                [discountCode]
            );
            if (discountRows.length > 0) {
                discount_id = discountRows[0].discount_id;
                await connection.query(
                    'UPDATE Discounts SET percentage = ?, expiration_date = ? WHERE discount_id = ?',
                    [parseFloat(discountPercentage), discountExpiration, discount_id]
                );
            } else {
                const [discountResult] = await connection.query(
                    'INSERT INTO Discounts (discount_code, percentage, expiration_date) VALUES (?, ?, ?)',
                    [discountCode, parseFloat(discountPercentage), discountExpiration]
                );
                discount_id = discountResult.insertId;
            }
        }

        // Update product
        await connection.query(
            'UPDATE Products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, discount_id = ? WHERE product_id = ?',
            [
                productName,
                productDescription,
                parseFloat(productPrice),
                parseInt(productStock),
                category_id,
                discount_id,
                productId
            ]
        );

        // Handle images: delete existing and insert new ones
        await connection.query(
            'DELETE FROM Product_Images WHERE product_id = ?',
            [productId]
        );
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                const image_url = `/images/${file.filename}`;
                const is_primary = index === 0 ? 1 : 0;
                await connection.query(
                    'INSERT INTO Product_Images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                    [productId, image_url, is_primary]
                );
            }
        } else if (req.body.productImageUrl) {
            await connection.query(
                'INSERT INTO Product_Images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                [productId, req.body.productImageUrl, 1]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Product updated successfully', product_id: productId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating product:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ error: 'Failed to update product: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.listen(port, () => {
    console.log(`Admin server running at http://localhost:${port}`);
});