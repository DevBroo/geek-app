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

    console.log('?? Setting up AdminJS authentication...');
    console.log('?? Admin Email:', process.env.ADMIN_EMAIL);
    console.log('?? Has Admin Password:', !!process.env.ADMIN_PASSWORD);
    console.log('?? Has Cookie Password:', !!process.env.ADMIN_COOKIE_PASSWORD);
    console.log('?? Has Session Secret:', !!process.env.SESSION_SECRET);

    // // ? CRITICAL FIX: Mount AdminJS BEFORE starting server
    // const adminRouter = await buildAdminRouter(server);
    // app.use('/admin', adminRouter);
    // console.log('? AdminJS router mounted at /admin');

    // Initialize Comprehensive WebSocket System
    comprehensiveWsManager.initialize(server);
    console.log('? WebSocket system initialized');
    
    // Start server
    server.listen(PORT, () => {
        console.log('?? ================================');
        console.log("?? Server is running on port ");
        console.log("?? WebSocket server ready on port ");
        console.log("?? AdminJS: http://localhost:/admin");
        console.log('?? ================================');
        console.log('');
        console.log('?? AdminJS Login Credentials:');
        console.log('   ?? Email: admin@geeklappy.com');
        console.log('   ?? Password: GeekLappy@2024#Admin');
        console.log('');
        console.log('?? Features: Products, Orders, Notifications, Wallet');
        console.log('? Real-time: FULLY ENABLED');
    });

    // Initialize AdminJS WebSocket connection after server starts
    setTimeout(() => {
        console.log('?? Initializing AdminJS WebSocket...');
        adminWS.connect().catch(console.error);
    }, 2000);
})
.catch(err => {
    console.error('? Failed to connect to the database:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error("? Unhandled Rejection:" );
    server.close(() => process.exit(1));
});
