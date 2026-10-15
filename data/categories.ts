export interface SubSubcategory {
  name: string;
  slug: string;
  itemCount?: string;
}

export interface Subcategory {
  name: string;
  slug: string;
  itemCount?: string;
  subcategories?: SubSubcategory[];
}

export interface Category {
  id: string;
  name: string;
  shortTitle?: string;
  slug: string;
  description: string;
  image: string;
  badge?: string;
  itemCount: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'carpets',
    name: 'Carpets & Broadloom',
    shortTitle: 'Carpets',
    slug: 'carpets',
    description: 'High-traffic commercial, plush textured saxony, home theater, and stain-resistant residential broadloom.',
    image: '/images/Fort-Wood-Carpet-Joy-Carpets.jpg',
    badge: 'Popular',
    itemCount: '488+ Styles',
    subcategories: [
      { name: 'Print Carpets', slug: 'print-carpets' },
      { name: 'Home Theater', slug: 'home-theater' },
      { name: 'Commercial Cutpile', slug: 'commercial-cutpile' },
      { name: 'Commercial Level Loop', slug: 'commercial-level-loop' },
      { name: 'Textured Saxony', slug: 'textured-saxony' },
      { name: 'Textured Berber', slug: 'textured-berber' },
      { name: 'Canadian Berber', slug: 'canadian-berber' },
      { name: 'Luxary Nylon', slug: 'luxary-nylon' },
      { name: 'Motel Rooms Cut & Loop', slug: 'motel-rooms-cut-loop' },
      { 
        name: 'Carpet Tiles', 
        slug: 'carpet-tiles',
        subcategories: [
          { name: 'Stonewall Collection', slug: 'stonewall' },
          { name: 'Modular 20x20', slug: 'modular-20x20' },
          { name: 'Planks 10x40', slug: 'planks-10x40' }
        ]
      },
      { name: 'Kane Carpet', slug: 'kane-carpet' },
      { name: 'Gym Flooring', slug: 'gym-flooring' }
    ]
  },
  {
    id: 'area-rugs',
    name: 'Luxury Area Rugs',
    shortTitle: 'Area Rugs',
    slug: 'area-rugs',
    description: 'Ancient garden weaves, contemporary textures, designer shags, oval & round rugs.',
    image: '/images/ANCIENT-GARDEN-57559-9686.jpg',
    badge: 'Designer Pick',
    itemCount: '286+ Designs',
    subcategories: [
      { name: 'Ancient Garden', slug: 'ancient-garden' },
      { name: 'Alba', slug: 'alba' },
      { name: 'Allure', slug: 'allure' },
      { name: 'Arctic', slug: 'arctic' },
      { name: 'Casper', slug: 'casper' },
      { name: 'Castello', slug: 'castello' },
      { name: 'Como', slug: 'como' },
      { name: 'Puffy', slug: 'puffy' },
      { name: 'Quartz', slug: 'quartz' },
      { name: 'Vegas', slug: 'vegas' },
      { name: 'Oval Rugs', slug: 'oval-rugs' },
      { name: 'Round Rugs', slug: 'round-rugs' },
      { name: 'Clearance Rugs', slug: 'clearance-rugs' }
    ]
  },
  {
    id: 'vinyl-flooring',
    name: 'Luxury Vinyl Flooring (LVT/SPC)',
    shortTitle: 'Vinyl Flooring',
    slug: 'vinyl-flooring',
    description: '100% waterproof click planks, tiles, loose lay, glue down & commercial vinyl.',
    image: '/images/Click-Commercial-Tiles-Back-Street-Bavarian-Cream-M731.webp',
    badge: '100% Waterproof',
    itemCount: '76+ Colors',
    subcategories: [
      { name: 'Click Vinyl Planks', slug: 'click-vinyl-planks' },
      { name: 'Click Vinyl Tiles', slug: 'vinyl-click-tiles' },
      { name: 'Commercial Tiles LVT', slug: 'commercial-tiles-lvt' },
      { name: 'Vinyl Glue Down', slug: 'vinyl-glue-down' },
      { name: 'Vinyl Loose Lay', slug: 'vinyl-loose-lay' },
      { name: 'Vinyl Treads & Base', slug: 'vinyl-treads-base' },
      { name: 'Clearance Vinyl', slug: 'clearance-vinyl' }
    ]
  },
  {
    id: 'solid-hardwood',
    name: 'Hardwood & Engineered Wood',
    shortTitle: 'Hardwood',
    slug: 'solid-hardwood',
    description: 'Solid Canadian oak, wire-brushed engineered hardwood, click engineered and laminate.',
    image: '/images/slide03.jpg',
    badge: 'Natural Oak',
    itemCount: '78+ Finishes',
    subcategories: [
      {
        name: 'Solid Hardwood',
        slug: 'solid-hardwood',
        subcategories: [
          { name: 'Solid Oak Flooring', slug: 'solid-oak-flooring' }
        ]
      },
      {
        name: 'Engineered Wood',
        slug: 'engineered-wood',
        subcategories: [
          { name: 'Engineered Wire Brushed 7"-7.5"', slug: 'engineered-wire-brushed-7' },
          { name: 'Engineered Wire Brushed 6"', slug: 'engineered-wire-brushed-6' },
          { name: 'Engineered Hand Scraped 6"', slug: 'engineered-hand-scraped-6' },
          { name: 'Engineered Hickory 7"-7.5"', slug: 'engineered-hickory-7' }
        ]
      },
      { name: 'Click Engineered', slug: 'click-engineered' },
      { name: 'Clearance Hardwood', slug: 'clearance-hardwood' },
      {
        name: 'Laminate',
        slug: 'laminate',
        subcategories: [
          { name: 'Laminate Better', slug: 'laminate-better' }
        ]
      }
    ]
  },
  {
    id: 'stair-runner',
    name: 'Stair Runners & Custom Binding',
    shortTitle: 'Stair Runners',
    slug: 'stair-runner',
    description: 'Custom measured and serged stair & hallway runners with authentic old website patterns.',
    image: '/images/ANCIENT-GARDEN-57147-9696.jpg',
    badge: 'Custom Sized',
    itemCount: '141+ Runners',
    subcategories: [
      { name: 'Aincient Garden Runners', slug: 'ancient-garden-runners' },
      { name: 'Brilliant Runner', slug: 'brilliant-runner' },
      { name: 'Imperial Runner', slug: 'imperial-runner' },
      { name: 'Legacy Runner', slug: 'legacy-runner' }
    ]
  },
  {
    id: 'tiles',
    name: 'Floor & Wall Tiles',
    shortTitle: 'Tiles',
    slug: 'tiles',
    description: 'Porcelain floor tiles, mosaic wall tiles, and Dura Ceramic 16x16.',
    image: '/images/Back-Street-Perspective-M461.jpeg',
    badge: 'Premium Porcelain',
    itemCount: '41+ Styles',
    subcategories: [
      { 
        name: 'Floor Tiles', 
        slug: 'floor-tiles',
        subcategories: [
          { name: 'Porcelain Floor Tiles', slug: 'porcelain-floor-tiles' }
        ]
      },
      { 
        name: 'Wall Tiles', 
        slug: 'wall-tiles',
        subcategories: [
          { name: 'Mosaic Wall Tiles', slug: 'mosaic-wall-tiles' }
        ]
      },
      { name: 'Dura Ceramic 16x16', slug: 'dura-ceramic-16x16' }
    ]
  },
  {
    id: 'countertop',
    name: 'Countertops & Slabs',
    shortTitle: 'Countertops',
    slug: 'countertop',
    description: 'Custom fabricated Quartz, Granite Group C, and Melamine countertop surfaces.',
    image: '/images/slide01.jpg',
    badge: 'Custom Slabs',
    itemCount: '175+ Slabs',
    subcategories: [
      { name: 'Quartz', slug: 'quartz' },
      { name: 'Granite Group C', slug: 'granite-group-c' },
      { name: 'Melamine', slug: 'melamine' }
    ]
  },
  {
    id: 'underpad',
    name: 'Underpad & Mouldings',
    shortTitle: 'Underpad & Trim',
    slug: 'underpad',
    description: 'Carpet underpad, crown mouldings (5", 7", 9"), baseboard, and flooring accessories.',
    image: '/images/slide02.jpg',
    badge: 'Accessories',
    itemCount: '31+ Products',
    subcategories: [
      { name: 'Underpad', slug: 'underpad' },
      {
        name: 'Crown Mouldings',
        slug: 'crown-mouldings',
        subcategories: [
          { name: 'Crown Mouldings 5"', slug: 'crown-mouldings-5' },
          { name: 'Crown Mouldings 7"', slug: 'crown-mouldings-7' },
          { name: 'Crown Mouldings 9"', slug: 'crown-mouldings-9' }
        ]
      },
      { name: 'Baseboard', slug: 'baseboard' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Commercial Matts', slug: 'commercial-matts' }
    ]
  }
];

// Helper to get flat list of all categories, subcategories and sub-subcategories for select/filter inputs
export interface FlatCategoryOption {
  id: string;
  name: string;
  path: string;
  level: number;
  rootId: string;
}

export function getFlattenedCategories(): FlatCategoryOption[] {
  const result: FlatCategoryOption[] = [];

  for (const cat of CATEGORIES) {
    result.push({
      id: cat.id,
      name: cat.name,
      path: cat.name,
      level: 0,
      rootId: cat.id
    });

    for (const sub of cat.subcategories) {
      const subPath = `${cat.name} > ${sub.name}`;
      result.push({
        id: sub.slug,
        name: sub.name,
        path: subPath,
        level: 1,
        rootId: cat.id
      });

      if (sub.subcategories && sub.subcategories.length > 0) {
        for (const subsub of sub.subcategories) {
          result.push({
            id: subsub.slug,
            name: subsub.name,
            path: `${subPath} > ${subsub.name}`,
            level: 2,
            rootId: cat.id
          });
        }
      }
    }
  }

  return result;
}
