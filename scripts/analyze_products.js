import fs from 'fs';

// Helper to parse CSV with multi-line quotes
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

const csvText = fs.readFileSync('products.csv', 'utf8');
const rows = parseCSV(csvText);
const headers = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));

console.log('Total rows:', rows.length);
console.log('Headers:', headers);

const typeIdx = headers.indexOf('Type');
const nameIdx = headers.indexOf('Name');
const parentIdx = headers.indexOf('Parent');
const idIdx = headers.indexOf('ID');
const imagesIdx = headers.indexOf('Images');
const attr1NameIdx = headers.indexOf('Attribute 1 name');
const attr1ValIdx = headers.indexOf('Attribute 1 value(s)');
const attr2NameIdx = headers.indexOf('Attribute 2 name');
const attr2ValIdx = headers.indexOf('Attribute 2 value(s)');
const attr3NameIdx = headers.indexOf('Attribute 3 name');
const attr3ValIdx = headers.indexOf('Attribute 3 value(s)');

const typeCounts = {};
const variations = [];
const variables = [];
const samplesWithColor = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < 5) continue;
  const type = r[typeIdx] || 'simple';
  typeCounts[type] = (typeCounts[type] || 0) + 1;

  if (type === 'variation') {
    variations.push({
      id: r[idIdx],
      parent: r[parentIdx],
      name: r[nameIdx],
      images: r[imagesIdx],
      attr1: `${r[attr1NameIdx]}: ${r[attr1ValIdx]}`,
      attr2: `${r[attr2NameIdx]}: ${r[attr2ValIdx]}`,
      attr3: `${r[attr3NameIdx]}: ${r[attr3ValIdx]}`
    });
  } else if (type === 'variable') {
    variables.push({
      id: r[idIdx],
      name: r[nameIdx],
      attr1: `${r[attr1NameIdx]}: ${r[attr1ValIdx]}`,
      attr2: `${r[attr2NameIdx]}: ${r[attr2ValIdx]}`,
      attr3: `${r[attr3NameIdx]}: ${r[attr3ValIdx]}`
    });
  }

  // Check if attributes or name mention color
  const allAttrs = `${r[attr1NameIdx]} ${r[attr1ValIdx]} ${r[attr2NameIdx]} ${r[attr2ValIdx]} ${r[attr3NameIdx]} ${r[attr3ValIdx]}`;
  if (allAttrs.toLowerCase().includes('color') || allAttrs.toLowerCase().includes('colour')) {
    samplesWithColor.push({
      id: r[idIdx],
      type,
      name: r[nameIdx],
      images: r[imagesIdx],
      attrs: allAttrs
    });
  }
}

console.log('Type breakdown:', typeCounts);
console.log('Variable count:', variables.length);
console.log('Variation count:', variations.length);
console.log('Rows with Color in attributes:', samplesWithColor.length);

if (variables.length > 0) {
  console.log('Sample Variable:', variables[0]);
  const parentId = variables[0].id;
  const childVars = variations.filter(v => v.parent === parentId || v.parent === `id:${parentId}`);
  console.log(`Variations for ${parentId}:`, childVars);
}

if (variations.length > 0) {
  console.log('Sample Variation 0:', variations[0]);
  console.log('Sample Variation 1:', variations[1]);
}
