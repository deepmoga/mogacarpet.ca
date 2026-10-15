import { query } from '../lib/db.ts';

async function checkSchema() {
  const cols = await query('DESCRIBE products;');
  console.log('Columns in products table:');
  console.log(cols);
  process.exit(0);
}

checkSchema().catch(e => {
  console.error(e);
  process.exit(1);
});
