import dotenv from 'dotenv';
dotenv.config({
    path: '../.env',
});
import mongoose from 'mongoose';
import { DB_NAME }  from '../constant.js';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MONGO_URI:', process.env.MONGO_URI);
        console.log('DB_NAME:', DB_NAME);
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB connected successfully!`);
        console.log(`🏠 Host: ${connectionInstance.connection.host}`);
        console.log(`🗄️  Database: ${connectionInstance.connection.name}`);
        console.log(`🌐 Connection State: ${connectionInstance.connection.readyState}`);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        if (error.name === 'MongooseServerSelectionError') {
            console.error('💡 Check your MongoDB Atlas connection string and network access settings');
        }
        process.exit(1);
    }
};

export default connectDB;