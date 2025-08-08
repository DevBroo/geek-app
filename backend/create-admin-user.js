import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { DB_NAME } from './src/constant.js';

dotenv.config();

// Define the User schema (simplified version of your actual schema)
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8 
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  orgName: {
    type: String,
    default: 'GeekLappy Admin',
    trim: true
  },
  contactNumber: {
    type: String,
    default: '9999999999',
    trim: true
  },
  shopAddress: {
    type: Array,
    default: []
  },
  GSTNumber: {
    type: String,
    default: 'ADMIN123456',
    trim: true
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {  
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Function to create admin user
async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    console.log('DB_NAME:', DB_NAME);
    
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log('Connected to MongoDB successfully!');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('No need to create a new admin user.');
    } else {
      // Create new admin user
      const adminUser = new User({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@geeklappy.com',
        password: process.env.ADMIN_PASSWORD || 'GeekLappy@2024#Admin',
        role: 'admin',
        orgName: 'GeekLappy Admin',
        contactNumber: '9999999999',
        GSTNumber: 'ADMIN123456'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createAdminUser();