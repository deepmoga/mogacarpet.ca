import mysql from 'mysql2/promise';

async function fixProductColors() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mogacarpet'
  });

  // 1. Remove synthetic "Color / Style" colors
  const [res1] = await conn.query(`
    UPDATE products 
    SET colors = NULL 
    WHERE colors LIKE '%Color / Style%';
  `);
  console.log(`Cleaned up ${res1.affectedRows} products that had synthetic "Color / Style" variants.`);

  // 2. Count products that still have real colors (e.g. from attributes or real named colors)
  const [remaining] = await conn.query(`
    SELECT id, name, colors FROM products WHERE colors IS NOT NULL;
  `);
  console.log(`Remaining products with genuine color variations: ${remaining.length}`);
  if (remaining.length > 0) {
    console.log('Sample genuine color product:', remaining[0].name, remaining[0].colors);
  }

  await conn.end();
}

fixProductColors().catch(console.error);
