import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/db/index.js';

// Import your models
import { User } from './src/models/user.model.js';
import { Product } from './src/models/products.model.js';
import { Transaction } from './src/models/transaction.model.js';

dotenv.config({
    path: './.env'
});

const testConnection = async () => {
    try {
        // Connect to database
        await connectDB();
        
        console.log('\n🔍 Testing database connection and models...\n');
        
        // Test 1: Check if models are properly defined
        console.log('📋 Available Models:');
        console.log('- User Model:', User ? '✅' : '❌');
        console.log('- Product Model:', Product ? '✅' : '❌');
        console.log('- Transaction Model:', Transaction ? '✅' : '❌');
        
        // Test 2: Try to create a test product first (simpler validation)
        console.log('\n📦 Creating test product...');
        const testProduct = new Product({
            productTitle: 'Test Product',
            productDescription: 'Test Description',
            originalPrice: 100,
            discountPercentage: 10,
            category: 'Test Category',
            tags: ['test'],
            stock: 50,
            minOrderQuantity: 1,
            maxOrderQuantity: 100,
            isActive: true
        });
        
        const savedProduct = await testProduct.save();
        console.log('✅ Test product created:', savedProduct._id);
        
        // Test 3: Check collections
        console.log('\n📊 Database Collections:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });
        
        // Test 4: Count documents
        console.log('\n📈 Document Counts:');
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const transactionCount = await Transaction.countDocuments();
        
        console.log(`- Users: ${userCount}`);
        console.log(`- Products: ${productCount}`);
        console.log(`- Transactions: ${transactionCount}`);
        
        // Clean up test data
        await Product.findByIdAndDelete(savedProduct._id);
        console.log('\n🧹 Test data cleaned up');
        
        console.log('\n✅ Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the test
testConnection();