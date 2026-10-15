import mysql from 'mysql2/promise';

const PRODUCTS = [
  {
    id: 'fort-wood',
    name: 'Fort Wood Commercial Carpet – Joy Carpets',
    category: 'carpets',
    categoryName: 'Commercial & Saxony Carpet',
    price: 15.99,
    originalPrice: 21.99,
    unit: 'sq. yd.',
    image: '/images/Fort-Wood-Carpet-Joy-Carpets.jpg',
    rating: 4.9,
    reviewsCount: 38,
    inStock: true,
    badge: 'Best Seller',
    description: 'Heavy duty commercial cut & loop carpet engineered for durability, stain defense, and luxurious underfoot feel in demanding spaces.',
    features: ['StainMaster® Soil Shield', 'Antimicrobial Protection', 'Direct Mill Certified', 'Commercial Lifetime Backing'],
    specs: {
      material: '100% Solution Dyed Nylon',
      backing: 'ActionBac® High Performance',
      trafficRating: 'Severe Commercial / Residential',
      origin: 'USA / Canada'
    }
  },
  {
    id: 'have-a-blast',
    name: 'Have A Blast Fluorescent Carpet – Joy Carpets',
    category: 'carpets',
    categoryName: 'Home Theater & Print Carpet',
    price: 16.99,
    originalPrice: 22.99,
    unit: 'sq. yd.',
    image: '/images/Have-A-Blast-Carpet-Joy-Carpets.jpg',
    rating: 5.0,
    reviewsCount: 24,
    inStock: true,
    badge: 'Fluorescent Glow',
    description: 'Dynamic vibrant pattern that glows under UV blacklight. Perfect for home theaters, family entertainment centers, bowling alleys, and lounges.',
    features: ['Blacklight Reactive Dyes', 'Class 1 Flammability Rating', 'Bound Edge Available', 'Anti-Static Protection'],
    specs: {
      material: 'Stainsmart® BCF Nylon',
      backing: 'Endura-Loc High Density',
      trafficRating: 'Heavy Commercial / Theater',
      origin: 'USA'
    }
  },
  {
    id: 'fun-and-games',
    name: 'Fun and Games Pattern Carpet – Joy Carpets',
    category: 'carpets',
    categoryName: 'Print Carpets',
    price: 16.99,
    originalPrice: 22.50,
    unit: 'sq. yd.',
    image: '/images/Fun-and-Games-Carpet-Joy-Carpets.jpg',
    rating: 4.8,
    reviewsCount: 19,
    inStock: true,
    badge: 'Popular',
    description: 'Vibrant geometric and amusement motifs ideal for recreational spaces, basements, kid gaming zones, and modern entertainment areas.',
    features: ['Fade Resistant Inks', 'Zero VOC Emissions', 'Easy Steam Cleaning', 'Commercial Tufted Construction'],
    specs: {
      material: '100% Premium Polyamide',
      backing: 'Woven Polypropylene',
      trafficRating: 'Heavy Commercial',
      origin: 'USA'
    }
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer Fluorescent Quick-Ship Carpet',
    category: 'carpets',
    categoryName: 'Home Theater Carpets',
    price: 16.99,
    originalPrice: 24.00,
    unit: 'sq. yd.',
    image: '/images/Space-Explorer-Fluorescent-Quick-ship-Carpet-Joy-Carpets.jpg',
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    badge: 'Quick Ship',
    description: 'Cosmic celestial nebula motif glowing intensely under blacklight. Transform any basement or theater into an immersive space galaxy.',
    features: ['Quick-Ship 48-Hour Dispatch', 'Deep Pigment Infusion', 'High Sound Absorption NRC 0.25', 'Pet & Child Friendly'],
    specs: {
      material: 'Solution-Dyed Micro-Nylon',
      backing: 'High Density Acoustic Felt',
      trafficRating: 'High Residential & Commercial',
      origin: 'USA'
    }
  },
  {
    id: 'ancient-garden-royal',
    name: 'Ancient Garden Royal Medallion Area Rug',
    category: 'area-rugs',
    categoryName: 'Luxury Area Rugs',
    price: 349.00,
    originalPrice: 520.00,
    unit: 'rug (5x8)',
    image: '/images/ANCIENT-GARDEN-57559-9686.jpg',
    rating: 5.0,
    reviewsCount: 56,
    inStock: true,
    badge: 'Hand Crafted',
    description: 'Museum-worthy traditional Persian medallion craftsmanship woven with ultra-fine silk-sheen fibers for sublime softness and heirloom durability.',
    features: ['High-Density 1.5 Million Points/m²', 'Non-Shedding Micro Poly-Silk', 'Intricate Border & Fringe Finishing', 'Stain Resistant Weave'],
    specs: {
      material: 'Turkish Poly-Silk & Wool Blend',
      backing: '100% Natural Jute',
      trafficRating: 'Living Room / Dining Room',
      origin: 'Imported Authentic Weave'
    }
  },
  {
    id: 'ancient-garden-classic',
    name: 'Ancient Garden Vintage Botanical Rug',
    category: 'area-rugs',
    categoryName: 'Luxury Area Rugs',
    price: 299.00,
    originalPrice: 450.00,
    unit: 'rug (5x7)',
    image: '/images/ANCIENT-GARDEN-57559-9656.jpg',
    rating: 4.9,
    reviewsCount: 31,
    inStock: true,
    badge: 'Exclusive',
    description: 'Subtle antique patina with regal floral motifs designed to anchor formal living spaces, executive master bedrooms, and warm sitting areas.',
    features: ['Lustrous Antique Wash Effect', 'Odor & Allergen Free', 'Fade-Proof Mineral Colors', 'Easy Spot-Clean Maintenance'],
    specs: {
      material: 'Heat-set Polypropylene & Wool',
      backing: 'Reinforced Jute Weft',
      trafficRating: 'High Residential',
      origin: 'Imported Artisanal'
    }
  },
  {
    id: 'ancient-garden-emerald',
    name: 'Ancient Garden Imperial Ornamental Runner',
    category: 'area-rugs',
    categoryName: 'Stair & Hallway Runners',
    price: 189.00,
    originalPrice: 279.00,
    unit: 'runner (2.5x10)',
    image: '/images/ANCIENT-GARDEN-57147-9696.jpg',
    rating: 4.8,
    reviewsCount: 17,
    inStock: true,
    badge: 'Custom Length',
    description: 'Refined ornamental runner perfectly proportioned for entry hallways, staircases, and corridors. High density weave resists heavy foot traffic.',
    features: ['Serged Edges on all 4 Sides', 'Stair Clip Compatible', 'Comfort Cushioned Pile', 'Rich Saturated Colors'],
    specs: {
      material: '100% Resilient Poly-Blend',
      backing: 'Slip-Resistant Textured Jute',
      trafficRating: 'Hallways & Stairs',
      origin: 'Artisan Collection'
    }
  },
  {
    id: 'commercial-tiles-bavarian',
    name: 'Back Street Bavarian Cream Commercial LVT',
    category: 'vinyl-flooring',
    categoryName: 'Luxury Vinyl Flooring',
    price: 2.89,
    originalPrice: 3.99,
    unit: 'sq. ft.',
    image: '/images/Click-Commercial-Tiles-Back-Street-Bavarian-Cream-M731.webp',
    rating: 4.9,
    reviewsCount: 63,
    inStock: true,
    badge: '100% Waterproof',
    description: 'Commercial grade stone composite click tile with authentic travertine texture. 100% impervious to water, spills, and heavy commercial loads.',
    features: ['20mil Ceramic Bead Wear Layer', 'Integrated Acoustic IXPE Pad', 'Uniclic® Patented Locking Joint', 'Scratch & Dent Proof'],
    specs: {
      material: 'Stone Plastic Composite (SPC)',
      backing: 'Attached 1.5mm Acoustic IXPE Pad',
      trafficRating: 'Heavy Commercial / Hospital / Office',
      origin: 'Canada Certified'
    }
  },
  {
    id: 'commercial-tiles-basset',
    name: 'Back Street Basset Slate Click Tile',
    category: 'vinyl-flooring',
    categoryName: 'Luxury Vinyl Flooring',
    price: 2.99,
    originalPrice: 4.25,
    unit: 'sq. ft.',
    image: '/images/Click-Commercial-Tiles-Back-Street-Basset-M751.webp',
    rating: 4.9,
    reviewsCount: 45,
    inStock: true,
    badge: 'Hot Seller',
    description: 'Chic modern charcoal slate aesthetic with realistic grout line definition. Effortless click installation directly over concrete or subfloors.',
    features: ['Zero Acclimation Required', 'Pet-Proof & Scratch Resistant', 'Radiant Heat Compatible', 'FloorScore® Certified Clean Air'],
    specs: {
      material: 'Rigid Core Polymer Composite',
      backing: 'Sound Dampening Foam Underlayment',
      trafficRating: 'Heavy Commercial / Kitchens / Basements',
      origin: 'Canada / USA'
    }
  },
  {
    id: 'carpet-tiles-perspective',
    name: 'Perspective Architectural Carpet Tile 20″x20″',
    category: 'carpet-tiles',
    categoryName: 'Commercial Carpet Tiles',
    price: 3.49,
    originalPrice: 4.99,
    unit: 'sq. ft.',
    image: '/images/Back-Street-Perspective-M461.jpeg',
    rating: 4.8,
    reviewsCount: 29,
    inStock: true,
    badge: 'Modular 20x20',
    description: 'Precision engineered modular carpet squares. Replace damaged individual tiles in seconds without replacing the whole floor.',
    features: ['Quarter-Turn Or Ashlar Installation', 'Dimensional Stability Guarantee', 'CRI Green Label Plus Certified', 'Stain Resistant Solution Dye'],
    specs: {
      material: '100% Nylon 6 Loop',
      backing: 'Modified Bitumen / PVC-Free',
      trafficRating: 'Offices, Schools, Commercial Hubs',
      origin: 'Commercial Grade'
    }
  },
  {
    id: 'roll-the-dice',
    name: 'Roll The Dice Vegas Carpet – Joy Carpets',
    category: 'carpets',
    categoryName: 'Themed & Hospitality Carpet',
    price: 15.99,
    originalPrice: 21.00,
    unit: 'sq. yd.',
    image: '/images/Roll-the-Dice-Carpet-Joy-Carpets.jpg',
    rating: 4.9,
    reviewsCount: 22,
    inStock: true,
    badge: 'Casino & Lounge',
    description: 'Authentic casino dice and lucky card motif crafted for game rooms, finished man-caves, clubhouses, and upscale gaming venues.',
    features: ['Stain Repel Treatment', 'Heavy Density Pile', 'Fade-Free Color Retention', 'Flame Retardant Certified'],
    specs: {
      material: 'Solution-Dyed Continuous Filament Nylon',
      backing: 'Woven Synthetic Secondary',
      trafficRating: 'High Commercial',
      origin: 'USA'
    }
  },
  {
    id: 'atlantic-city',
    name: 'Atlantic City Board Carpet – Joy Carpets',
    category: 'carpets',
    categoryName: 'Hospitality & Commercial',
    price: 15.99,
    originalPrice: 20.50,
    unit: 'sq. yd.',
    image: '/images/Atlantic-City-Carpet-Joy-Carpets.jpg',
    rating: 4.7,
    reviewsCount: 16,
    inStock: true,
    badge: 'Hospitality Grade',
    description: 'Refined modern geometric hospitality loop carpet engineered to withstand thousands of foot steps daily while retaining plush appearance.',
    features: ['High Soil Concealment Pattern', 'Anti-Fray Tight Tufting', 'Commercial Warranty 15 Years', 'Easy Vacuuming & Maintenance'],
    specs: {
      material: '100% Solution Dyed Polyamide',
      backing: 'ActionBac® Double Backing',
      trafficRating: 'Heavy Commercial / Corridors',
      origin: 'USA'
    }
  }
];

async function insertCurated() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mogacarpet'
  });

  console.log(`Upserting ${PRODUCTS.length} curated products...`);

  for (const p of PRODUCTS) {
    const specsJson = JSON.stringify(p.specs || {});
    const featuresJson = JSON.stringify(p.features || []);

    await conn.query(`
      INSERT INTO \`products\` (
        \`id\`, \`name\`, \`slug\`, \`category_id\`, \`category_label\`,
        \`price\`, \`regular_price\`, \`unit\`, \`rating\`, \`reviews_count\`,
        \`badge\`, \`in_stock\`, \`is_featured\`, \`is_visible\`, \`image\`,
        \`description\`, \`short_description\`,
        \`specs\`, \`features\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`category_id\` = VALUES(\`category_id\`),
        \`category_label\` = VALUES(\`category_label\`),
        \`price\` = VALUES(\`price\`),
        \`regular_price\` = VALUES(\`regular_price\`),
        \`unit\` = VALUES(\`unit\`),
        \`badge\` = VALUES(\`badge\`),
        \`image\` = VALUES(\`image\`),
        \`description\` = VALUES(\`description\`),
        \`specs\` = VALUES(\`specs\`),
        \`features\` = VALUES(\`features\`);
    `, [
      p.id,
      p.name,
      p.id,
      p.category,
      p.categoryName,
      p.price,
      p.originalPrice || null,
      p.unit,
      p.rating,
      p.reviewsCount,
      p.badge || null,
      p.inStock ? 1 : 0,
      1,
      1,
      p.image,
      p.description,
      p.description.slice(0, 160),
      specsJson,
      featuresJson,
    ]);
  }

  console.log('✅ Curated products inserted successfully!');
  await conn.end();
}

insertCurated().catch(console.error);
