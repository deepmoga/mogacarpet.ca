import fs from 'fs';
import mysql from 'mysql2/promise';

const COLOR_HEX_MAP = {
  'red': '#ff0000',
  'blue': '#1212ff',
  'navy': '#000080',
  'green': '#2e7d32',
  'black': '#1c1c1c',
  'white': '#ffffff',
  'grey': '#757575',
  'gray': '#757575',
  'beige': '#d7c4b7',
  'gold': '#d4af37',
  'brown': '#6d4c41',
  'cream': '#fffdd0',
  'ivory': '#fffff0',
  'silver': '#c0c0c0',
  'charcoal': '#36454f',
  'taupe': '#8b8589',
  'bronze': '#cd7f32',
  'copper': '#b87333',
  'yellow': '#fbc02d',
  'orange': '#f57c00',
  'purple': '#7b1fa2',
  'burgundy': '#800020',
  'burgandy': '#800020',
  'dark grey': '#424242',
  'light blue': '#64b5f6',
  'light grey': '#bdbdbd',
  'cork': '#c49a45',
  'amber': '#ffbf00',
  'sand': '#d8b887',
  'smoke': '#848884',
};

async function populateColors() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mogacarpet'
  });

  const [products] = await conn.query('SELECT id, name, image, gallery_images, specs, description FROM products');
  console.log(`Analyzing ${products.length} products in MySQL...`);

  let updatedCount = 0;

  for (const p of products) {
    let gallery = [];
    try {
      gallery = p.gallery_images ? (typeof p.gallery_images === 'string' ? JSON.parse(p.gallery_images) : p.gallery_images) : [];
    } catch {
      gallery = [];
    }
    if (!Array.isArray(gallery)) gallery = [];

    let specs = [];
    try {
      specs = p.specs ? (typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs) : [];
    } catch {
      specs = [];
    }
    if (!Array.isArray(specs)) specs = [];

    const colors = [];

    // Check 1: Attributes with Color
    const colorAttr = specs.find(a => a && a.name && (a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('colour')));
    if (colorAttr && Array.isArray(colorAttr.values) && colorAttr.values.length > 0) {
      colorAttr.values.forEach((val, idx) => {
        const cleanVal = String(val).trim();
        const lowerVal = cleanVal.toLowerCase();
        
        // Find best matching gallery image
        let matchedImg = gallery.find(img => {
          const lowerImg = String(img).toLowerCase();
          return lowerImg.includes(lowerVal.replace(/\s+/g, '-')) || lowerImg.includes(lowerVal.replace(/\s+/g, ''));
        });

        // If not found by name, fallback to index in gallery or main image
        if (!matchedImg && gallery[idx]) {
          matchedImg = gallery[idx];
        }
        if (!matchedImg) {
          matchedImg = p.image;
        }

        let hex = COLOR_HEX_MAP[lowerVal] || null;
        if (!hex) {
          for (const [k, v] of Object.entries(COLOR_HEX_MAP)) {
            if (lowerVal.includes(k)) {
              hex = v;
              break;
            }
          }
        }

        colors.push({
          name: cleanVal,
          color_code: hex || '#3b82f6',
          image: matchedImg
        });
      });
    }

    // Check 2: If no attribute colors, but multiple gallery images, derive variants from images!
    if (colors.length === 0 && gallery.length > 1) {
      const uniqueImgs = [...new Set(gallery.filter(Boolean))];
      if (uniqueImgs.length > 1) {
        uniqueImgs.forEach((imgUrl, idx) => {
          const filename = imgUrl.split('/').pop() || '';
          const lowerName = filename.toLowerCase();

          let foundColor = null;
          for (const [k, v] of Object.entries(COLOR_HEX_MAP)) {
            if (lowerName.includes(k)) {
              foundColor = { name: k.charAt(0).toUpperCase() + k.slice(1), hex: v };
              break;
            }
          }

          colors.push({
            name: foundColor ? foundColor.name : `Color / Style ${idx + 1}`,
            color_code: foundColor ? foundColor.hex : (idx === 0 ? '#1212ff' : idx === 1 ? '#ff0000' : '#4b5563'),
            image: imgUrl
          });
        });
      }
    }

    // Check 3: Check if the product name itself has a color and related products in same family exist
    // If we have colors, save to MySQL!
    if (colors.length > 0) {
      await conn.query('UPDATE products SET colors = ? WHERE id = ?;', [JSON.stringify(colors), p.id]);
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} products with interactive color swatches & images!`);
  await conn.end();
}

populateColors().catch(err => {
  console.error('Error populating colors:', err);
  process.exit(1);
});
