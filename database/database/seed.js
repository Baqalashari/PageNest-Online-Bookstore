const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedDatabase() {
  console.log('Seeding Sprint 2 Catalog Data...');
  try {
    // Clear existing catalog data
    await pool.query('TRUNCATE categories, products, variants, skus, assets RESTART IDENTITY CASCADE;');

    // 1. Insert Category Hierarchy
    const catParent = await pool.query(
      `INSERT INTO categories (name, slug) VALUES ('Books', 'books') RETURNING id`
    );
    const parentId = catParent.rows[0].id;

    const catChild = await pool.query(
      `INSERT INTO categories (parent_id, name, slug) VALUES ($1, 'Computer Science', 'computer-science') RETURNING id`,
      [parentId]
    );
    const childId = catChild.rows[0].id;

    // 2. Insert Products
    const prod1 = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, status) 
       VALUES ($1, 'Clean Code', 'clean-code', 'A Handbook of Agile Software Craftsmanship', 'published') RETURNING id`,
      [childId]
    );

    const prod2 = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, status) 
       VALUES ($1, 'The Pragmatic Programmer', 'the-pragmatic-programmer', 'Your Journey To Mastery', 'published') RETURNING id`,
      [childId]
    );

    await pool.query(
      `INSERT INTO products (category_id, name, slug, description, status) 
       VALUES ($1, 'Design Patterns', 'design-patterns', 'Elements of Reusable Object-Oriented Software', 'draft') RETURNING id`,
      [childId]
    );

    // 3. Insert Variants & SKUs for Product 1 (Clean Code)
    const var1 = await pool.query(
      `INSERT INTO variants (product_id, option_name, option_value) VALUES ($1, 'Format', 'Paperback') RETURNING id`,
      [prod1.rows[0].id]
    );
    await pool.query(
      `INSERT INTO skus (variant_id, sku_code, price, stock_quantity) VALUES ($1, 'CC-PB-001', 34.99, 15)`,
      [var1.rows[0].id]
    );

    // 4. Insert Variants & SKUs for Product 2 (Pragmatic Programmer - Multi-variant & Out-of-stock)
    const var2HC = await pool.query(
      `INSERT INTO variants (product_id, option_name, option_value) VALUES ($1, 'Format', 'Hardcover') RETURNING id`,
      [prod2.rows[0].id]
    );
    await pool.query(
      `INSERT INTO skus (variant_id, sku_code, price, stock_quantity) VALUES ($1, 'PP-HC-001', 49.99, 10)`,
      [var2HC.rows[0].id]
    );

    const var2EB = await pool.query(
      `INSERT INTO variants (product_id, option_name, option_value) VALUES ($1, 'Format', 'eBook') RETURNING id`,
      [prod2.rows[0].id]
    );
    await pool.query(
      `INSERT INTO skus (variant_id, sku_code, price, stock_quantity) VALUES ($1, 'PP-EB-001', 24.99, 50)`,
      [var2EB.rows[0].id]
    );

    // Out-of-stock SKU combination
    const var2OOS = await pool.query(
      `INSERT INTO variants (product_id, option_name, option_value) VALUES ($1, 'Format', 'Collector Edition') RETURNING id`,
      [prod2.rows[0].id]
    );
    await pool.query(
      `INSERT INTO skus (variant_id, sku_code, price, stock_quantity, is_active) VALUES ($1, 'PP-CE-001', 99.99, 0, false)`,
      [var2OOS.rows[0].id]
    );

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
