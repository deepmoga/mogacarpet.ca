import fs from 'fs';

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
  console.log('Read products.csv, size:', content.length, 'bytes');
  const records = parseFullCSV(content);
  console.log('Total records parsed:', records.length);

  const header = records[0].map(c => c.trim().replace(/^"|"$/g, ''));
  const catIndex = header.indexOf('Categories');
  console.log('Categories column index:', catIndex);

  const rawCategoryStrings = new Map();

  for (let r = 1; r < records.length; r++) {
    const cols = records[r];
    const catVal = cols[catIndex];
    if (catVal) {
      const trimmed = catVal.trim();
      if (trimmed) {
        // Split by comma outside of angle brackets if any
        // In WooCommerce, categories are comma-separated e.g. "Carpets > Home Theater, Carpets > Print Carpets"
        const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
          rawCategoryStrings.set(p, (rawCategoryStrings.get(p) || 0) + 1);
        }
      }
    }
  }

  console.log(`\nFound ${rawCategoryStrings.size} distinct category paths in CSV:\n`);
  const sorted = Array.from(rawCategoryStrings.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [cat, count] of sorted) {
    console.log(`[${count} products] ${cat}`);
  }
}

run().catch(console.error);
