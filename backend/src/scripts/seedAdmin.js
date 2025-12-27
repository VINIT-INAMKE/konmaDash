import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('To reset password, delete this user first and run the script again.');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      fullName: 'System Administrator',
      isActive: true
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('==========================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('==========================================');
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
