import fs from 'fs';

const products = JSON.parse(fs.readFileSync('data/all_products.json', 'utf8'));

console.log('--- Inspecting products with multiple images ---');
const multiImageProds = products.filter(p => p.images && p.images.length > 1);
console.log('Count of products with >1 images:', multiImageProds.length);

for (let i = 0; i < Math.min(10, multiImageProds.length); i++) {
  const p = multiImageProds[i];
  console.log(`\nProduct [${p.id}] ${p.name}:`);
  console.log('Images:', p.images);
  if (p.attributes && p.attributes.length) {
    console.log('Attributes:', JSON.stringify(p.attributes));
  }
}

console.log('\n--- Checking products that share base names or have color words in name ---');
const colorWords = ['red', 'blue', 'green', 'black', 'white', 'grey', 'gray', 'beige', 'gold', 'brown', 'cream', 'navy', 'ivory', 'silver', 'charcoal', 'taupe', 'bronze', 'copper', 'terracotta'];

const prodsWithColorWords = products.filter(p => {
  const lower = p.name.toLowerCase();
  return colorWords.some(w => new RegExp(`\\b${w}\\b|[-_]${w}[-_]?`, 'i').test(lower));
});
console.log('Products with color words in name:', prodsWithColorWords.length);
for (let i = 0; i < 5; i++) {
  console.log(`Sample ${i}:`, prodsWithColorWords[i]?.name, prodsWithColorWords[i]?.image);
}
