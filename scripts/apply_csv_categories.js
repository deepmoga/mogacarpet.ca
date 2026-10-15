import fs from 'fs';
import mysql from 'mysql2/promise';

function parseFullCSV(csvText) {
  const records = [];
  let row = [];
  let entry = '';
  let insideQuote = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      if (insideQuote && csvText[i + 1] === '"') {
        entry += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(entry);
      entry = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
      row.push(entry);
      entry = '';
      if (row.length > 1 || row[0] !== '') {
        records.push(row);
      }
      row = [];
    } else {
      entry += char;
    }
  }
  if (entry || row.length > 0) {
    row.push(entry);
    records.push(row);
  }
  return records;
}

// Function that determines the Root Department and Full Normalized Category Path
export function resolveCategory(rawCategoryString) {
  if (!rawCategoryString) {
    return { rootId: 'carpets', rootTitle: 'Carpets & Broadloom', fullPath: 'Carpets' };
  }

  const paths = rawCategoryString.split(',').map(s => s.trim()).filter(Boolean);
  
  // Sort paths by specificity (longest path first)
  paths.sort((a, b) => b.length - a.length);

  const bestPath = paths[0];

  // Map to root
  const lower = bestPath.toLowerCase();

  // 1. Carpets & Broadloom
  if (lower.startsWith('carpet') || lower.includes('kane') || lower.includes('gym flor')) {
    if (lower.includes('carpet tile')) {
      return { rootId: 'carpet-tiles', rootTitle: 'Commercial Carpet Tiles', fullPath: bestPath };
    }
    return { rootId: 'carpets', rootTitle: 'Carpets & Broadloom', fullPath: bestPath.startsWith('Carpets') ? bestPath : `Carpets > ${bestPath}` };
  }

  // 2. Area Rugs
  if (lower.startsWith('area rug') || lower.includes('oval rug') || lower.includes('round rug')) {
    return { rootId: 'area-rugs', rootTitle: 'Luxury Area Rugs', fullPath: bestPath.startsWith('Area Rugs') ? bestPath : `Area Rugs > ${bestPath}` };
  }

  // 3. Stair Runner
  if (lower.startsWith('stair runner') || lower.includes('runner')) {
    return { rootId: 'stair-runner', rootTitle: 'Stair Runners & Custom Binding', fullPath: bestPath };
  }

  // 4. Vinyl Flooring
  if (lower.includes('vinyl') || lower.includes('lvt')) {
    return { rootId: 'vinyl-flooring', rootTitle: 'Luxury Vinyl Flooring (LVT/SPC)', fullPath: bestPath.startsWith('Vinyl Flooring') ? bestPath : `Vinyl Flooring > ${bestPath}` };
  }

  // 5. Hardwood & Engineered Wood
  if (lower.includes('hardwood') || lower.includes('engineered') || lower.includes('laminate') || lower.includes('oak')) {
    return { rootId: 'solid-hardwood', rootTitle: 'Hardwood & Engineered Wood', fullPath: bestPath.startsWith('Engineered Wood') || bestPath.startsWith('Solid Hardwood') || bestPath.startsWith('Laminate') ? bestPath : `Hardwood > ${bestPath}` };
  }

  // 6. Floor & Wall Tiles
  if (lower.includes('tile') || lower.includes('ceramic')) {
    return { rootId: 'tiles', rootTitle: 'Floor & Wall Tiles', fullPath: bestPath };
  }

  // 7. Countertop
  if (lower.includes('countertop') || lower.includes('granite') || lower.includes('melamine') || lower.includes('quartz')) {
    return { rootId: 'countertop', rootTitle: 'Countertops & Slabs', fullPath: bestPath.startsWith('Countertop') ? bestPath : `Countertop > ${bestPath}` };
  }

  // 8. Underpad & Mouldings / Accessories
  if (lower.includes('underpad') || lower.includes('moulding') || lower.includes('baseboard') || lower.includes('accessor') || lower.includes('matt')) {
    return { rootId: 'underpad', rootTitle: 'Underpad & Mouldings', fullPath: bestPath };
  }

  return { rootId: 'carpets', rootTitle: 'Carpets & Broadloom', fullPath: bestPath };
}

async function run() {
  const content = fs.readFileSync('products.csv', 'utf8');
  const records = parseFullCSV(content);
  const header = records[0].map(c => c.trim().replace(/^"|"$/g, ''));
  const idIdx = header.indexOf('ID');
  const catIdx = header.indexOf('Categories');
  const nameIdx = header.indexOf('Name');

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mogacarpet'
  });

  console.log('Syncing categories for products from CSV...');

  let updated = 0;
  for (let r = 1; r < records.length; r++) {
    const row = records[r];
    const id = row[idIdx]?.trim();
    const rawCat = row[catIdx]?.trim();

    if (!id || !rawCat) continue;

    const { rootId, fullPath } = resolveCategory(rawCat);

    const [res] = await conn.execute(
      'UPDATE products SET category_id = ?, category_label = ? WHERE id = ?',
      [rootId, fullPath, id]
    );

    if (res.affectedRows > 0) {
      updated++;
    }
  }

  console.log(`Updated ${updated} products in MySQL with authentic category paths from CSV.`);

  // Verify categories distribution in DB
  const [dist] = await conn.execute(
    'SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id ORDER BY count DESC'
  );
  console.log('\n=== PRODUCTS DISTRIBUTION BY CATEGORY ID ===');
  console.log(dist);

  // Check some samples
  const [samples] = await conn.execute(
    'SELECT id, name, category_id, category_label FROM products WHERE id IN (10001, 13328, 10982, 10622, 10761, 10830) ORDER BY id'
  );
  console.log('\n=== VERIFICATION SAMPLES ===');
  console.log(samples);

  await conn.end();
}

run().catch(console.error);
