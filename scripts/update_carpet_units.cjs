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

  console.log('Connected to MySQL. Updating all products with sq. yd. to sq. ft....');

  const [result] = await conn.query(`
    UPDATE products 
    SET unit = 'sq. ft.' 
    WHERE unit IN ('sq. yd.', 'sq.yd.', 'sq yd') 
       OR unit LIKE '%yd%' 
       OR unit IS NULL 
       OR unit = '';
  `);

  console.log(`Successfully updated ${result.affectedRows} products to 'sq. ft.'`);

  const [unitSummary] = await conn.query(`
    SELECT unit, count(*) as count 
    FROM products 
    GROUP BY unit;
  `);
  console.log('Current database units breakdown:', unitSummary);

  await conn.end();
}

main().catch((err) => {
  console.error('Error updating carpet units:', err);
  process.exit(1);
});
