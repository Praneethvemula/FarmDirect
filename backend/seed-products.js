const { User, Product } = require('./models');
const bcrypt = require('bcryptjs');

const items = [
  // Fruits
  { name: 'Mango', category: 'Fruits', price: 150 },
  { name: 'Apple', category: 'Fruits', price: 120 },
  { name: 'Banana', category: 'Fruits', price: 40 },
  { name: 'Orange', category: 'Fruits', price: 60 },
  { name: 'Grapes', category: 'Fruits', price: 90 },
  { name: 'Pineapple', category: 'Fruits', price: 50 },
  { name: 'Papaya', category: 'Fruits', price: 45 },
  { name: 'Watermelon', category: 'Fruits', price: 30 },
  { name: 'Strawberry', category: 'Fruits', price: 250 },
  { name: 'Guava', category: 'Fruits', price: 60 },
  // Vegetables
  { name: 'Potato', category: 'Vegetables', price: 30 },
  { name: 'Tomato', category: 'Vegetables', price: 40 },
  { name: 'Onion', category: 'Vegetables', price: 55 },
  { name: 'Carrot', category: 'Vegetables', price: 65 },
  { name: 'Cabbage', category: 'Vegetables', price: 30 },
  { name: 'Cauliflower', category: 'Vegetables', price: 40 },
  { name: 'Spinach', category: 'Vegetables', price: 20 },
  { name: 'Brinjal', category: 'Vegetables', price: 45 }, // Eggplant
  { name: 'Cucumber', category: 'Vegetables', price: 35 },
  { name: 'Beans', category: 'Vegetables', price: 80 },
  { name: 'Peas', category: 'Vegetables', price: 100 },
  { name: 'Pumpkin', category: 'Vegetables', price: 25 },
  { name: 'Radish', category: 'Vegetables', price: 30 },
  { name: 'Beetroot', category: 'Vegetables', price: 45 },
  { name: 'Capsicum', category: 'Vegetables', price: 70 },
  { name: 'Broccoli', category: 'Vegetables', price: 150 },
  { name: 'Lettuce', category: 'Vegetables', price: 60 },
  { name: 'Sweet corn', category: 'Vegetables', price: 40 },
  { name: 'Bitter melon', category: 'Vegetables', price: 30 }, // for Bitter Gourd
  { name: 'Calabash', category: 'Vegetables', price: 25 }, // for Bottle Gourd
];

const ogNames = {
  'Sweet corn': 'Sweet Corn',
  'Bitter melon': 'Bitter Gourd',
  'Calabash': 'Bottle Gourd'
};

const IMAGE_MAP = {
  Mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80',
  Apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?auto=format&fit=crop&w=400&q=80',
  Banana: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=400&q=80',
  Orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80',
  Grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80',
  Pineapple: 'https://images.unsplash.com/photo-1550258114-b0d24756fd5d?auto=format&fit=crop&w=400&q=80',
  Papaya: 'https://images.unsplash.com/photo-1526613098279-e72bbe4ce795?auto=format&fit=crop&w=400&q=80',
  Watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
  Strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
  Guava: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80',
  Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
  Tomato: 'https://images.unsplash.com/photo-1558818498-28c3e002b655?auto=format&fit=crop&w=400&q=80',
  Onion: 'https://images.unsplash.com/photo-1508747703725-7197771375a0?auto=format&fit=crop&w=400&q=80',
  Carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
  Cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80',
  Cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80',
  Spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
  Brinjal: 'https://images.unsplash.com/photo-1615485290382-441e4d019cb5?auto=format&fit=crop&w=400&q=80',
  Cucumber: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80',
  Beans: 'https://images.unsplash.com/photo-1567375639149-e82cc3888c03?auto=format&fit=crop&w=400&q=80',
  Peas: 'https://images.unsplash.com/photo-1559058789-672da06263d8?auto=format&fit=crop&w=400&q=80',
  Pumpkin: 'https://images.unsplash.com/photo-1506815444479-bfdb1e96c566?auto=format&fit=crop&w=400&q=80',
  Radish: 'https://images.unsplash.com/photo-1590779033100-9f60702a0532?auto=format&fit=crop&w=400&q=80',
  Beetroot: 'https://images.unsplash.com/photo-1601039641847-7857ec9d4d71?auto=format&fit=crop&w=400&q=80',
  Capsicum: 'https://images.unsplash.com/photo-1563513307168-a4262ed77fd5?auto=format&fit=crop&w=400&q=80',
  Broccoli: 'https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&w=400&q=80',
  Lettuce: 'https://images.unsplash.com/photo-1622206141380-e1903f9fcf3a?auto=format&fit=crop&w=400&q=80',
  'Sweet corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
  'Bitter melon': 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=400&q=80',
  Calabash: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80'
};

async function seed() {
  try {
    let farmer = await User.findOne({ where: { email: 'demo_farmer@example.com' } });
    if (!farmer) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      farmer = await User.create({
        name: 'Demo Farmer',
        email: 'demo_farmer@example.com',
        password: hashedPassword,
        role: 'Farmer',
        phone: '1234567890',
        location: 'Demo Farm'
      });
      console.log('Created Demo Farmer account.');
    }

    // Clear existing products for a clean seed
    await Product.destroy({ where: {}, truncate: false }); 
    console.log('Cleared existing products.');

    console.log('Using curated images and creating products...');
    for (const item of items) {
      const imageUrl = IMAGE_MAP[item.name] || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=400&q=80';
      const displayName = ogNames[item.name] || item.name;
      
      await Product.create({
        farmerId: farmer.id,
        name: displayName,
        category: item.category,
        description: `Fresh, locally sourced ${displayName}.`,
        price: item.price,
        unit: 'kg',
        stock: 50,
        images: [imageUrl]
      });
      console.log(`Added ${displayName} with image: ${imageUrl}`);
    }

    console.log('All 30 products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
