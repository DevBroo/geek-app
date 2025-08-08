import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app.js';
import connectDB from './db/index.js';
import { comprehensiveWsManager } from './config/comprehensive-websocket.js';
import { adminWS } from './admin/services/websocket-admin.js';
import { buildAdminRouter } from './admin/index.js'; // Import AdminJS router

dotenv.config({
    path: '../.env'
});

// Create HTTP server
export const server = createServer(app);

connectDB()
.then(async () => {
    const PORT = process.env.PORT || 8000;

    const adminRouter = await buildAdminRouter(server); // Use the imported AdminJS router
    app.use('/admin', adminRouter); // Mount AdminJS router at /admin path
    console.log(`AdminJS mounted at /admin path`);
    console.log(`✅ AdminJS Router created successfully`);

    // Initialize Comprehensive WebSocket System
    comprehensiveWsManager.initialize(server);
    
    // Initialize AdminJS WebSocket connection
    setTimeout(() => {
        adminWS.connect().catch(console.error);
    }, 4000); // Give server time to start
    
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🔌 Comprehensive WebSocket server is ready on port ${PORT}`);
        console.log(`👑 AdminJS available at http://localhost:${PORT}/admin`);
        console.log(`📊 All data types integrated: Products, Orders, Notifications, Wallet, etc.`);
        console.log(`⚡ Real-time features: FULLY ENABLED`);
    });
})
.catch(err => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
});


// Handle unhandled promise rejections (good practice)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
})


// ;(  async () => {
//     const app = express();
//     try {
//         // Define a simple route
//     await mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//         process.exit(1);
//     }
// })();