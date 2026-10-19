const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Parse .env.local if present
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mogacarpet',
    port: Number(process.env.DB_PORT) || 3306,
  });

  console.log('Connected to MySQL. Updating carpet product units...');

  const [result] = await conn.query(`
    UPDATE products 
    SET unit = 'sq. ft.' 
    WHERE (category_id = 'carpets' OR category_id = 'carpet-tiles' OR category_label LIKE '%carpet%' OR category_id LIKE '%carpet%') 
      AND (unit IN ('sq. yd.', 'sq.yd.', 'sq yd') OR unit IS NULL OR unit = '');
  `);

  console.log(`Successfully updated ${result.affectedRows} carpet products to 'sq. ft.'`);

  const [carpetSummary] = await conn.query(`
    SELECT category_id, unit, count(*) as count 
    FROM products 
    WHERE category_id IN ('carpets', 'carpet-tiles') 
    GROUP BY category_id, unit;
  `);
  console.log('Carpet categories current units:', carpetSummary);

  const [otherSummary] = await conn.query(`
    SELECT category_id, unit, count(*) as count 
    FROM products 
    WHERE category_id NOT IN ('carpets', 'carpet-tiles') 
    GROUP BY category_id, unit;
  `);
  console.log('Other categories (untouched):', otherSummary);

  await conn.end();
}

main().catch((err) => {
  console.error('Error updating carpet units:', err);
  process.exit(1);
});
