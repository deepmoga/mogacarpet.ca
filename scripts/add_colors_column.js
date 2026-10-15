import mysql from 'mysql2/promise';

async function addColorsColumn() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'mogacarpet'
    });
    const [cols] = await conn.query('SHOW COLUMNS FROM products LIKE "colors";');
    if (cols.length === 0) {
      console.log('Adding colors column to products table...');
      await conn.query('ALTER TABLE products ADD COLUMN colors LONGTEXT NULL AFTER gallery_images;');
      console.log('✅ Added `colors` column to `products` table.');
    } else {
      console.log('ℹ️ `colors` column already exists in `products` table.');
    }
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error adding column:', err);
    process.exit(1);
  }
}

addColorsColumn();
