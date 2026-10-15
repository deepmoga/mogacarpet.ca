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

async function run() {
  const content = fs.readFileSync('products.csv', 'utf8');
  const records = parseFullCSV(content);
  const header = records[0].map(c => c.trim().replace(/^"|"$/g, ''));
  const idIdx = header.indexOf('ID');
  const catIdx = header.indexOf('Categories');
  const nameIdx = header.indexOf('Name');

  console.log(`Total products in CSV: ${records.length - 1}`);

  // Map each product to its most specific category path and primary root
  const categoryTree = new Map(); // root -> { subcategories: Map(sub -> Set(subsub)) }

  const productCategoryMap = new Map();

  for (let r = 1; r < records.length; r++) {
    const row = records[r];
    const id = row[idIdx]?.trim();
    const name = row[nameIdx]?.trim();
    const catStr = row[catIdx]?.trim();

    if (!id) continue;

    // Split category paths
    const paths = (catStr || 'Uncategorized').split(',').map(s => s.trim()).filter(Boolean);
    
    // Sort paths by depth (most specific first, e.g. "A > B > C" before "A > B" before "A")
    paths.sort((a, b) => {
      const depthA = a.split('>').length;
      const depthB = b.split('>').length;
      return depthB - depthA;
    });

    const primaryPath = paths[0] || 'Uncategorized';
    productCategoryMap.set(id, { name, primaryPath, allPaths: paths });

    // Build tree
    for (const p of paths) {
      const parts = p.split('>').map(s => s.trim()).filter(Boolean);
      const root = parts[0] || 'Uncategorized';
      const sub = parts[1] || null;
      const subsub = parts[2] || null;

      if (!categoryTree.has(root)) {
        categoryTree.set(root, new Map());
      }
      const subMap = categoryTree.get(root);
      if (sub) {
        if (!subMap.has(sub)) {
          subMap.set(sub, new Set());
        }
        if (subsub) {
          subMap.get(sub).add(subsub);
        }
      }
    }
  }

  console.log('\n=== COMPLETE HIERARCHICAL CATEGORY TREE FROM CSV ===');
  for (const [root, subMap] of Array.from(categoryTree.entries()).sort()) {
    console.log(`\n📁 ROOT: ${root}`);
    if (subMap.size === 0) {
      console.log('   (No subcategories)');
    } else {
      for (const [sub, subsubSet] of subMap.entries()) {
        console.log(`   ├── 📂 ${sub}`);
        if (subsubSet.size > 0) {
          for (const subsub of subsubSet) {
            console.log(`   │   └── 📄 ${subsub}`);
          }
        }
      }
    }
  }

  // Connect to DB and check how many match
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mogacarpet'
  });

  const [dbProducts] = await conn.execute('SELECT id, name, category_id, category_label FROM products LIMIT 10');
  console.log('\n=== CURRENT DB SAMPLE BEFORE SYNC ===');
  console.log(dbProducts);

  await conn.end();
}

run().catch(console.error);
