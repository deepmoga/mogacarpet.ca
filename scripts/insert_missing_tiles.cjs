const fs = require('fs');
const { Client } = require('ssh2');

const prods = JSON.parse(fs.readFileSync('data/all_products.json', 'utf8'));
const missingIds = [
  '862', '863', '864', '865', '866', '867', '868', '869',
  '870', '871', '872', '873', '874', '875', '876', '877',
  '878', '879', '880', '881', '882', '911', '9358'
];

const missingProds = prods.filter(p => missingIds.includes(String(p.id)));
console.log('Found missing products in all_products.json:', missingProds.length);

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const sqlStatements = missingProds.map(p => {
  const localFilename = p.image ? p.image.split('/').pop() : '';
  const imagePath = localFilename ? `/images/${localFilename}` : '/images/slide01.jpg';
  const gallery = (p.images || []).map((imgUrl) => {
    const f = imgUrl.split('/').pop();
    return f ? `/images/${f}` : imgUrl;
  });

  return `INSERT INTO products (
    id, wp_id, sku, name, slug, category_id, category_label,
    price, regular_price, sale_price, unit, rating, reviews_count,
    badge, in_stock, is_featured, is_visible, image, gallery_images,
    description, short_description, specs, features
  ) VALUES (
    ${escapeSql(p.id)},
    ${escapeSql(p.id)},
    ${escapeSql(p.sku || null)},
    ${escapeSql(p.name)},
    ${escapeSql(p.slug)},
    'tiles',
    ${escapeSql(p.primaryCategory || 'Wall Tiles > Mosaic Wall Tiles')},
    ${escapeSql(p.price || 0.00)},
    ${escapeSql(p.regularPrice || null)},
    ${escapeSql(p.salePrice || null)},
    'sq. ft.',
    4.9,
    15,
    NULL,
    ${p.inStock ? 1 : 0},
    0,
    1,
    ${escapeSql(imagePath)},
    ${escapeSql(JSON.stringify(gallery))},
    ${escapeSql(p.description || '')},
    ${escapeSql(p.shortDescription || '')},
    '[]',
    '["Direct Mill Certified","Certified Installation","Brampton In-Stock"]'
  ) ON DUPLICATE KEY UPDATE
    category_id = 'tiles',
    category_label = VALUES(category_label),
    name = VALUES(name),
    unit = 'sq. ft.',
    is_visible = 1;`;
});

const fullSql = sqlStatements.join('\n');
fs.writeFileSync('insert_missing_tiles.sql', fullSql, 'utf8');
console.log('Wrote insert_missing_tiles.sql');

// Now upload and execute via SSH
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/tmp/insert_missing_tiles.sql');
    fs.createReadStream('insert_missing_tiles.sql').pipe(writeStream);
    writeStream.on('close', () => {
      console.log('Uploaded /tmp/insert_missing_tiles.sql');
      conn.exec('mariadb -u mogacarpet -p"9MlpYifiWYottlW" mogacarpet < /tmp/insert_missing_tiles.sql', (err2, stream) => {
        if (err2) throw err2;
        let out = '';
        let errStr = '';
        stream.on('data', d => out += d.toString());
        stream.stderr.on('data', d => errStr += d.toString());
        stream.on('close', (code) => {
          console.log('Execute exit code:', code, errStr);
          conn.exec('mariadb -u mogacarpet -p"9MlpYifiWYottlW" mogacarpet -e "SELECT count(*) FROM products; SELECT id, name, category_id, category_label FROM products WHERE category_id = \'tiles\';"', (err3, stream3) => {
            if (err3) throw err3;
            let out3 = '';
            stream3.on('data', d => out3 += d.toString());
            stream3.on('close', () => {
              console.log('DB Tiles count:\n', out3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
