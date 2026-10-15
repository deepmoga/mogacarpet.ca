import fs from 'fs';

const products = JSON.parse(fs.readFileSync('data/all_products.json', 'utf8'));

// Common color map for hex
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
};

// Check products that have images with color names or attributes with colors
let populatedCount = 0;
const samples = [];

for (const p of products) {
  const colors = [];
  const gallery = p.images || [];

  // Check 1: Attributes with Color
  if (p.attributes && p.attributes.length) {
    const colorAttr = p.attributes.find(a => a.name.toLowerCase().includes('color') || a.name.toLowerCase().includes('colour'));
    if (colorAttr && colorAttr.values && colorAttr.values.length) {
      colorAttr.values.forEach((val, idx) => {
        const cleanVal = val.trim();
        // try to match with an image in gallery if any has this color name
        const matchedImg = gallery.find(img => img.toLowerCase().includes(cleanVal.toLowerCase().replace(/\s+/g, '-')) || img.toLowerCase().includes(cleanVal.toLowerCase()));
        colors.push({
          name: cleanVal,
          color_code: COLOR_HEX_MAP[cleanVal.toLowerCase()] || '#4a5568',
          image: matchedImg ? (matchedImg.startsWith('http') ? `/images/${matchedImg.split('/').pop()}` : matchedImg) : (gallery[idx] ? (gallery[idx].startsWith('http') ? `/images/${gallery[idx].split('/').pop()}` : gallery[idx]) : p.image)
        });
      });
    }
  }

  // Check 2: If no attribute colors, but gallery has multiple distinct images, check if filenames contain color words or distinct variants
  if (colors.length === 0 && gallery.length > 1) {
    // Unique images
    const uniqueImgs = [...new Set(gallery.map(img => img.split('/').pop()))];
    if (uniqueImgs.length > 1) {
      uniqueImgs.forEach((filename, idx) => {
        const lowerName = filename.toLowerCase();
        // Check for color words in filename
        let foundColor = Object.keys(COLOR_HEX_MAP).find(c => lowerName.includes(c));
        const colorName = foundColor 
          ? foundColor.charAt(0).toUpperCase() + foundColor.slice(1)
          : `Variant ${idx + 1}`;
        
        colors.push({
          name: colorName,
          color_code: foundColor ? COLOR_HEX_MAP[foundColor] : (idx === 0 ? '#1212ff' : idx === 1 ? '#ff0000' : '#4a5568'),
          image: `/images/${filename}`
        });
      });
    }
  }

  if (colors.length > 0) {
    populatedCount++;
    if (samples.length < 5) {
      samples.push({
        id: p.id,
        name: p.name,
        colors
      });
    }
  }
}

console.log('Total products with detected/derivable colors:', populatedCount);
console.log('Samples:', JSON.stringify(samples, null, 2));
