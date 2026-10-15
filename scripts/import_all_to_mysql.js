import fs from 'fs';
import mysql from 'mysql2/promise';

const CATEGORIES_DATA = [
  {
    id: 'carpets',
    title: 'Carpets & Broadloom',
    slug: 'carpets',
    description: 'High-traffic commercial, plush textured saxony, and stain-resistant residential broadloom.',
    image: '/images/Fort-Wood-Carpet-Joy-Carpets.jpg',
    badge: 'Popular',
    itemCount: '450+ Styles',
  },
  {
    id: 'area-rugs',
    title: 'Luxury Area Rugs',
    slug: 'area-rugs',
    description: 'Handcrafted oriental weaves, contemporary textures, ancient garden collections, oval & round rugs.',
    image: '/images/ANCIENT-GARDEN-57559-9686.jpg',
    badge: 'Designer Pick',
    itemCount: '320+ Designs',
  },
  {
    id: 'vinyl-flooring',
    title: 'Luxury Vinyl Flooring (LVT/SPC)',
    slug: 'vinyl-flooring',
    description: '100% waterproof click planks, herringbone patterns, commercial dry back & loose lay vinyl.',
    image: '/images/Click-Commercial-Tiles-Back-Street-Bavarian-Cream-M731.webp',
    badge: '100% Waterproof',
    itemCount: '180+ Colors',
  },
  {
    id: 'carpet-tiles',
    title: 'Commercial Carpet Tiles',
    slug: 'carpet-tiles',
    description: 'Modular 20″x20″ carpet tiles and 10″x40″ acoustic planks designed for offices, hotels, and retail.',
    image: '/images/Back-Street-Perspective-M461.jpeg',
    badge: 'Heavy Traffic',
    itemCount: '90+ Variations',
  },
  {
    id: 'solid-hardwood',
    title: 'Hardwood & Engineered Wood',
    slug: 'solid-hardwood',
    description: 'Authentic Canadian solid oak, hand-scraped hickory, wire-brushed finish and click engineered planks.',
    image: '/images/slide03.jpg',
    badge: 'Natural Oak',
    itemCount: '140+ Finishes',
  },
  {
    id: 'underpad',
    title: 'Underpad & Acoustic Foam',
    slug: 'underpad',
    description: 'Memory foam, gold foil moisture barriers, and heavy-duty 10mm & 12mm rebond carpet padding.',
    image: '/images/slide02.jpg',
    badge: 'Moisture Barrier',
    itemCount: '25+ Grades',
  },
  {
    id: 'countertop',
    title: 'Countertops & Slabs',
    slug: 'countertop',
    description: 'Custom fabricated Quartz, Granite Groups A/B/C, Marble, Onyx, and Travertine slabs.',
    image: '/images/slide01.jpg',
    badge: 'Fabrication',
    itemCount: '175+ Slabs',
  },
  {
    id: 'stair-runner',
    title: 'Stair Runners & Custom Binding',
    slug: 'stair-runner',
    description: 'Custom measured, bound and serged runners for stairs, hallways, and entry foyers.',
    image: '/images/ANCIENT-GARDEN-57147-9696.jpg',
    badge: 'Custom Sized',
    itemCount: '140+ Runners',
  }
];

async function importAllToMySQL() {
  console.log('Connecting to MySQL database `mogacarpet`...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mogacarpet',
  });

  // 1. Populate Categories
  console.log('1. Populating Categories...');
  for (const cat of CATEGORIES_DATA) {
    await conn.query(`
      INSERT INTO \`categories\` (\`id\`, \`title\`, \`slug\`, \`description\`, \`item_count\`, \`image\`, \`badge\`, \`is_visible\`)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`title\` = VALUES(\`title\`),
        \`description\` = VALUES(\`description\`),
        \`item_count\` = VALUES(\`item_count\`),
        \`image\` = VALUES(\`image\`),
        \`badge\` = VALUES(\`badge\`);
    `, [
      cat.id,
      cat.title,
      cat.slug,
      cat.description,
      cat.itemCount,
      cat.image,
      cat.badge || null,
      true,
    ]);
  }
  console.log(`✅ Inserted/Updated ${CATEGORIES_DATA.length} categories.`);

  // 2. Populate Products
  console.log('\n2. Populating Products from data/all_products.json...');
  const products = JSON.parse(fs.readFileSync('data/all_products.json', 'utf8'));
  console.log(`Read ${products.length} products to insert...`);

  let count = 0;
  for (const p of products) {
    const localFilename = p.image ? p.image.split('/').pop() : '';
    const imagePath = localFilename ? `/images/${localFilename}` : '/images/slide01.jpg';

    const gallery = (p.images || []).map((imgUrl) => {
      const f = imgUrl.split('/').pop();
      return f ? `/images/${f}` : imgUrl;
    });

    const catStr = (p.primaryCategory || '').toLowerCase();
    let catId = 'carpets';
    if (catStr.includes('rug')) catId = 'area-rugs';
    else if (catStr.includes('vinyl')) catId = 'vinyl-flooring';
    else if (catStr.includes('tile')) catId = 'carpet-tiles';
    else if (catStr.includes('hardwood') || catStr.includes('wood')) catId = 'solid-hardwood';
    else if (catStr.includes('underpad')) catId = 'underpad';
    else if (catStr.includes('countertop')) catId = 'countertop';
    else if (catStr.includes('runner')) catId = 'stair-runner';

    const unit = p.name.toLowerCase().includes('tile') || p.name.toLowerCase().includes('vinyl') ? 'sq. ft.' : 'sq. yd.';

    await conn.query(`
      INSERT INTO \`products\` (
        \`id\`, \`wp_id\`, \`sku\`, \`name\`, \`slug\`, \`category_id\`, \`category_label\`,
        \`price\`, \`regular_price\`, \`sale_price\`, \`unit\`, \`rating\`, \`reviews_count\`,
        \`badge\`, \`in_stock\`, \`is_featured\`, \`is_visible\`, \`image\`, \`gallery_images\`,
        \`description\`, \`short_description\`, \`specs\`, \`features\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`slug\` = VALUES(\`slug\`),
        \`category_id\` = VALUES(\`category_id\`),
        \`category_label\` = VALUES(\`category_label\`),
        \`price\` = VALUES(\`price\`),
        \`regular_price\` = VALUES(\`regular_price\`),
        \`sale_price\` = VALUES(\`sale_price\`),
        \`unit\` = VALUES(\`unit\`),
        \`in_stock\` = VALUES(\`in_stock\`),
        \`image\` = VALUES(\`image\`),
        \`gallery_images\` = VALUES(\`gallery_images\`),
        \`description\` = VALUES(\`description\`),
        \`short_description\` = VALUES(\`short_description\`);
    `, [
      String(p.id),
      String(p.id),
      p.sku || null,
      p.name,
      p.slug,
      catId,
      p.primaryCategory || 'Flooring',
      p.price || 0.00,
      p.regularPrice || null,
      p.salePrice || null,
      unit,
      4.9,
      15,
      p.featured ? 'Featured' : null,
      p.inStock ? 1 : 0,
      p.featured ? 1 : 0,
      1,
      imagePath,
      JSON.stringify(gallery),
      p.description || '',
      p.shortDescription || '',
      JSON.stringify(p.attributes || []),
      JSON.stringify(['Direct Mill Certified', 'Certified Installation', 'Brampton In-Stock']),
    ]);

    count++;
    if (count % 250 === 0 || count === products.length) {
      console.log(`Inserted ${count}/${products.length} products...`);
    }
  }

  const [res] = await conn.query('SELECT COUNT(*) as total FROM products;');
  console.log(`\n🎉 Success! Total products now stored in MySQL: ${res[0].total}`);

  await conn.end();
}

importAllToMySQL().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
