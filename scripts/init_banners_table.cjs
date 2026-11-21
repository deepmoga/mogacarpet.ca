const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
  const database = process.env.DB_NAME || 'mogacarpet';
  const port = Number(process.env.DB_PORT) || 3306;

  console.log(`Connecting to MySQL ${user}@${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({ host, user, password, database, port });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) DEFAULT '',
      image_url TEXT NOT NULL,
      link_url TEXT DEFAULT '',
      alt_text VARCHAR(255) DEFAULT '',
      display_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM banners');
  if (rows[0].cnt === 0) {
    console.log('Seeding initial default banners...');
    await conn.query(`
      INSERT INTO banners (title, image_url, link_url, alt_text, display_order, is_active)
      VALUES 
        ('Grand Flooring Event', '/images/slide01.jpg', '/shop', 'Moga Carpet & Flooring Special Offers', 1, 1),
        ('Commercial & Residential Excellence', '/images/slide02.jpg', '/category/vinyl-flooring', 'High-Performance Vinyl Planks & Carpet Tiles', 2, 1),
        ('Timeless Luxury & Comfort', '/images/slide03.jpg', '/products', 'Authentic Canadian Wood & Underpad', 3, 1)
    `);
  }

  const [banners] = await conn.query('SELECT id, title, image_url, link_url, is_active, display_order FROM banners');
  console.log(`Success! Total banners in DB: ${banners.length}`);
  console.log(banners);

  await conn.end();
}

main().catch(err => {
  console.error('Error initializing banners table:', err);
  process.exit(1);
});
