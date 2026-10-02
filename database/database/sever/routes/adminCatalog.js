const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to verify JWT and Admin role
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized access' });
  // JWT verification logic here...
  req.user = { id: 1, role: 'admin' };
  next();
};

router.use(authenticateAdmin);

// 1. POST /api/v1/admin/categories
router.post('/categories', async (req, res) => {
  const { name, slug, parent_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, parent_id || null]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ status: 'error', code: 'DUPLICATE_SLUG', message: 'Category slug already exists.' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. GET /api/v1/admin/categories
router.get('/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
  res.json({ status: 'success', data: result.rows });
});

// 3. POST /api/v1/admin/products
router.post('/products', async (req, res) => {
  const { name, slug, category_id, description, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, slug, category_id, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, slug, category_id, description, status || 'draft']
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ status: 'error', code: 'DUPLICATE_SLUG', message: 'Product slug already exists.' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. GET /api/v1/admin/products
router.get('/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
  res.json({ status: 'success', data: result.rows });
});

// 5. PATCH /api/v1/admin/products/:id
router.patch('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), status = COALESCE($2, status), description = COALESCE($3, description) WHERE id = $4 RETURNING *',
      [name, status, description, id]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 6. POST /api/v1/admin/products/:id/skus
router.post('/products/:id/skus', async (req, res) => {
  const { variant_id, sku_code, price, stock_quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO skus (variant_id, sku_code, price, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [variant_id, sku_code, price, stock_quantity]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ status: 'error', code: 'DUPLICATE_SKU', message: 'SKU code already exists.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ status: 'error', code: 'INVALID_STOCK', message: 'Stock or price cannot be negative.' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 7. PATCH /api/v1/admin/skus/:id
router.patch('/skus/:id', async (req, res) => {
  const { id } = req.params;
  const { price, stock_quantity, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE skus SET price = COALESCE($1, price), stock_quantity = COALESCE($2, stock_quantity), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *',
      [price, stock_quantity, is_active, id]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
