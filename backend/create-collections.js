import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/db/index.js';

// Import all your models to ensure they're registered
import './src/models/user.model.js';
import './src/models/products.model.js';
import './src/models/transaction.model.js';
import './src/models/category.model.js';
import './src/models/cart.model.js';
import './src/models/orders.model.js';
import './src/models/wallet.model.js';
import './src/models/address.model.js';
import './src/models/notifications.model.js';
import './src/models/reviewsAndRatings.model.js';

dotenv.config({
    path: './.env'
});

const createCollections = async () => {
    try {
        await connectDB();
        
        console.log('\n🏗️  Creating collections in MongoDB Atlas...\n');
        
        // Get all registered models
        const models = mongoose.models;
        const modelNames = Object.keys(models);
        
        console.log(`📋 Found ${modelNames.length} models:`, modelNames);
        
        // Create empty collections for each model
        for (const modelName of modelNames) {
            try {
                const model = models[modelName];
                await model.createCollection();
                console.log(`✅ Collection '${modelName.toLowerCase()}s' created`);
            } catch (error) {
                if (error.code === 48) {
                    console.log(`📝 Collection '${modelName.toLowerCase()}s' already exists`);
                } else {
                    console.log(`⚠️  Collection '${modelName.toLowerCase()}s': ${error.message}`);
                }
            }
        }
        
        // List all collections in the database
        console.log('\n📊 Collections in your database:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}`);
        });
        
        // Database stats
        console.log('\n📈 Database Stats:');
        const stats = await mongoose.connection.db.stats();
        console.log(`- Database: ${stats.db}`);
        console.log(`- Collections: ${stats.collections}`);
        console.log(`- Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
        
        console.log('\n✅ All collections created successfully!');
        console.log('🌐 You can now check your MongoDB Atlas dashboard to see the collections.');
        
    } catch (error) {
        console.error('❌ Error creating collections:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the collection creation
createCollections();