const { Product } = require('./models');

// Curated high-quality Unsplash photo IDs for each product - vibrant, natural, photorealistic
const imageMap = {
  'Mango':        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=600&fit=crop',
  'Apple':        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=600&fit=crop',
  'Banana':       'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop',
  'Orange':       'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=600&fit=crop',
  'Grapes':       'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&h=600&fit=crop',
  'Pineapple':    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=600&fit=crop',
  'Papaya':       'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&h=600&fit=crop',
  'Watermelon':   'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&h=600&fit=crop',
  'Strawberry':   'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=600&fit=crop',
  'Guava':        'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&h=600&fit=crop',
  'Potato':       'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=600&fit=crop',
  'Tomato':       'https://images.unsplash.com/photo-1546094096-0df4bcabd337?w=600&h=600&fit=crop',
  'Onion':        'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&h=600&fit=crop',
  'Carrot':       'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=600&fit=crop',
  'Cabbage':      'https://images.unsplash.com/photo-1594282486834-1f5f83847c33?w=600&h=600&fit=crop',
  'Cauliflower':  'https://images.unsplash.com/photo-1631209121750-a9f656d08900?w=600&h=600&fit=crop',
  'Spinach':      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=600&fit=crop',
  'Brinjal':      'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&h=600&fit=crop',
  'Cucumber':     'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop',
  'Beans':        'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&h=600&fit=crop',
  'Peas':         'https://images.unsplash.com/photo-1606588260160-0c2707adc2d2?w=600&h=600&fit=crop',
  'Pumpkin':      'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600&h=600&fit=crop',
  'Radish':       'https://images.unsplash.com/photo-1594282418426-f56b4b14d427?w=600&h=600&fit=crop',
  'Beetroot':     'https://images.unsplash.com/photo-1593105544559-ecb03bf3c39a?w=600&h=600&fit=crop',
  'Capsicum':     'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=600&fit=crop',
  'Broccoli':     'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&h=600&fit=crop',
  'Lettuce':      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&h=600&fit=crop',
  'Sweet Corn':   'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&h=600&fit=crop',
  'Bitter Gourd': 'https://images.unsplash.com/photo-1699898822534-f573d8d7c8cd?w=600&h=600&fit=crop',
  'Bottle Gourd': 'https://images.unsplash.com/photo-1628504048168-8c3e6e1ded43?w=600&h=600&fit=crop',
};

async function updateImages() {
  try {
    const products = await Product.findAll();
    if (products.length === 0) {
      console.log('No products found. Please run seed-products.js first.');
      process.exit(1);
    }

    let updated = 0;
    for (const product of products) {
      const imageUrl = imageMap[product.name];
      if (imageUrl) {
        await product.update({ images: [imageUrl] });
        console.log(`✅ Updated image for: ${product.name}`);
        updated++;
      } else {
        console.log(`⚠️  No image mapping found for: ${product.name}`);
      }
    }

    console.log(`\n🎉 Done! Updated ${updated}/${products.length} products with vibrant Unsplash images.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
}

updateImages();
