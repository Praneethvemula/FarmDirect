const { User } = require('./models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

async function createAdmin() {
  try {
    const adminEmail = 'admin@farmlink.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      phone: '0000000000',
      location: 'HQ'
    });

    console.log('Admin account created successfully!');
    console.log('Email: admin@farmlink.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
