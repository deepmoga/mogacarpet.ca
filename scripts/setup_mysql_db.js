import mysql from 'mysql2/promise';

async function setupDatabase() {
  console.log('Connecting to MySQL on localhost:3306...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    multipleStatements: true,
  });

  console.log('Ensuring database mogacarpet exists...');
  await conn.query('CREATE DATABASE IF NOT EXISTS `mogacarpet` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  await conn.query('USE `mogacarpet`;');

  console.log('Creating database schema tables...');
  const schemaSql = `
    -- 1. Categories Table
    CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` VARCHAR(100) PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`slug\` VARCHAR(255) NOT NULL UNIQUE,
      \`description\` TEXT NULL,
      \`item_count\` VARCHAR(100) NULL,
      \`image\` TEXT NOT NULL,
      \`badge\` VARCHAR(50) NULL,
      \`is_visible\` BOOLEAN DEFAULT TRUE,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- 2. Products Table
    CREATE TABLE IF NOT EXISTS \`products\` (
      \`id\` VARCHAR(100) PRIMARY KEY,
      \`wp_id\` VARCHAR(100) NULL,
      \`sku\` VARCHAR(100) NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`slug\` VARCHAR(255) NOT NULL,
      \`category_id\` VARCHAR(100) NULL,
      \`category_label\` VARCHAR(255) NULL,
      \`price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      \`regular_price\` DECIMAL(10, 2) NULL,
      \`sale_price\` DECIMAL(10, 2) NULL,
      \`unit\` VARCHAR(50) DEFAULT 'sq. yd.',
      \`rating\` DECIMAL(3, 2) DEFAULT 5.0,
      \`reviews_count\` INT DEFAULT 0,
      \`badge\` VARCHAR(50) NULL,
      \`in_stock\` BOOLEAN DEFAULT TRUE,
      \`is_featured\` BOOLEAN DEFAULT FALSE,
      \`is_visible\` BOOLEAN DEFAULT TRUE,
      \`image\` TEXT NOT NULL,
      \`gallery_images\` JSON NULL,
      \`description\` LONGTEXT NULL,
      \`short_description\` TEXT NULL,
      \`specs\` JSON NULL,
      \`features\` JSON NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (\`category_id\`),
      INDEX idx_slug (\`slug\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- 3. Quotes & Measurement Requests Table
    CREATE TABLE IF NOT EXISTS \`quotes\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`quote_number\` VARCHAR(100) NOT NULL UNIQUE,
      \`customer_name\` VARCHAR(255) NOT NULL,
      \`customer_phone\` VARCHAR(100) NOT NULL,
      \`customer_email\` VARCHAR(255) NULL,
      \`city\` VARCHAR(100) DEFAULT 'Brampton',
      \`category\` VARCHAR(100) NULL,
      \`approx_sqft\` VARCHAR(50) NULL,
      \`service_type\` VARCHAR(100) NULL,
      \`status\` ENUM('New', 'Contacted', 'Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'New',
      \`estimated_total\` DECIMAL(10, 2) NULL,
      \`notes\` TEXT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- 4. Settings Table
    CREATE TABLE IF NOT EXISTS \`settings\` (
      \`key_name\` VARCHAR(191) PRIMARY KEY,
      \`value_text\` LONGTEXT,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await conn.query(schemaSql);

  const defaultSettings = [
    ['admin_username', 'admin'],
    ['admin_password', 'admin123'],
    ['site_title', 'Moga Carpet & Flooring'],
    ['tagline', 'Your one stop flooring shop'],
    ['logo_url', '/images/cropped-web-logo-moga-carpet-flooring-5.png'],
    ['contact_phone', '1-905-848-2222'],
    ['contact_email', 'info@mogacarpet.ca'],
    ['contact_address', '1-8550 Torbram Road, Brampton, ON, Canada (Second Floor)'],
    ['business_hours', 'Monday to Saturday 11:00 AM – 5:00 PM (Preferred By Appointment)'],
    ['google_maps_url', 'https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8'],
    ['announcement_text', 'Free Installation on Select Carpets & Vinyl Planks across the GTA!'],
  ];

  for (const [k, v] of defaultSettings) {
    await conn.query(
      'INSERT INTO settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_name = key_name;',
      [k, v]
    );
  }

  console.log('✅ Database schema verified and created in MySQL!');
  const [tables] = await conn.query('SHOW TABLES;');
  console.log('Tables in mogacarpet:', tables.map(t => Object.values(t)[0]));

  await conn.end();
}

setupDatabase().catch(err => {
  console.error('❌ Failed to setup database:', err);
  process.exit(1);
});
