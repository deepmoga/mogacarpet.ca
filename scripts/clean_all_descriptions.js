import mysql from 'mysql2/promise';

export function cleanDescription(raw) {
  if (!raw) return '';
  let text = String(raw);

  // Unescape literal \r, \n, \t
  text = text.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\\t/g, ' ');

  // Remove accordion triggers and headers from old WP themes
  text = text.replace(/<span[^>]*class=["'][^"']*trigger[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');
  text = text.replace(/<span[^>]*class=["'][^"']*line trigger title[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');

  // Convert block tags to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/?(p|div|tr|li|h[1-6])[^>]*>/gi, '\n');

  // Strip remaining HTML tags (ensuring mathematical <8 or >0.5 are preserved)
  text = text.replace(/<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*>/gi, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#8217;/g, "'")
             .replace(/&#8220;/g, '"')
             .replace(/&#8221;/g, '"')
             .replace(/&#8243;/g, '"')
             .replace(/&nbsp;/g, ' ')
             .replace(/&bull;/g, '•');

  // Join lines where a key ending with colon had its value on the next line
  // (e.g. "Collection:\nImpressions" -> "Collection: Impressions")
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const formattedLines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const cur = rawLines[i];
    const next = rawLines[i + 1];
    if (cur.endsWith(':') && next && !next.includes(':') && next.length < 100) {
      formattedLines.push(`${cur} ${next}`);
      i++; // skip next
    } else {
      formattedLines.push(cur);
    }
  }

  return formattedLines.join('\n');
}

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mogacarpet'
  });

  console.log('Connected to mogacarpet MySQL database...');
  const [rows] = await conn.execute('SELECT id, name, description, short_description FROM products');

  let updatedDescCount = 0;
  let updatedShortDescCount = 0;
  for (const r of rows) {
    const cleanedDesc = cleanDescription(r.description);
    const cleanedShortDesc = cleanDescription(r.short_description);
    
    let needsUpdate = false;
    let newDesc = r.description;
    let newShortDesc = r.short_description;

    if (cleanedDesc !== r.description) {
      newDesc = cleanedDesc;
      needsUpdate = true;
      updatedDescCount++;
    }
    if (cleanedShortDesc !== r.short_description) {
      newShortDesc = cleanedShortDesc;
      needsUpdate = true;
      updatedShortDescCount++;
    }

    if (needsUpdate) {
      await conn.execute('UPDATE products SET description = ?, short_description = ? WHERE id = ?', [newDesc, newShortDesc, r.id]);
    }
  }

  console.log(`Successfully cleaned description for ${updatedDescCount} products, and short_description for ${updatedShortDescCount} products.`);

  // Verify product 13328
  const [testRows] = await conn.execute('SELECT id, name, description FROM products WHERE id = 13328');
  console.log('\n--- VERIFICATION PRODUCT 13328 ---');
  console.log(testRows[0]);

  await conn.end();
}

run().catch(console.error);
