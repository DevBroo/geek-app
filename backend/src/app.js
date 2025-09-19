import express from 'express';
import cookieParser from 'cookie-parser';   
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import admin from 'adminjs';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { performanceMonitor } from './utils/performance-monitor.js';


dotenv.config({
    path: '../.env'
});


const app = express();

// MongoDB connection is handled in index.js through connectDB()

app.use(cors({
    origin: [process.env.CORS_ORIGIN || 
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8080/admin',
        'http://localhost:19006', 
        'http://localhost:3001', 
        'http://localhost:3002',
    ],
    credentials: true
}));;


app.use(express.json({
    limit: '50mb'
}));

app.use(express.urlencoded({
    limit: '50mb',
    extended: true 
}));

app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan('dev')); //Logger middleware
app.use(performanceMonitor.middleware()); // Performance monitoring


// --- Serve AdminJS Static Assets ---
// This is crucial for AdminJS to load its own frontend assets and your custom components.
// It tells Express to serve files from `backend/src/admin/components` at the `/admin/static` URL.
// The `__dirname` part ensures that we're always pointing to the correct directory regardless of where this script is run from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/admin/static', express.static(path.join(__dirname, 'admin', 'components')));


// Routes imports 

import userRouter from './routes/user.routes.js';
import productRouter from './routes/product.routes.js';
import orderRouter from './routes/orders.routes.js';
import categoryRouter from './routes/category.routes.js';
import cartRouter from './routes/cart.routes.js';
import reviewRouter from './routes/reviewsAndRatings.routes.js';
import notificationRouter from './routes/notification.routes.js';
import paymentRouter from './routes/payment.routes.js';
import walletRouter from './routes/wallet.routes.js';
import dashboard from './routes/dashboard.routes.js';
import websocketRouter from './routes/websocket.routes.js';
import healthRouter from './routes/health.routes.js';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/wallets', walletRouter);
app.use('/api/v1/dashboard', dashboard);
app.use('/api/v1/websocket', websocketRouter);
app.use('/api/v1/health', healthRouter);

// System performance endpoint
app.get('/api/v1/system/health', (req, res) => {
  const health = performanceMonitor.getSystemHealth();
  const suggestions = performanceMonitor.getOptimizationSuggestions();
  
  res.json({
    ...health,
    optimizationSuggestions: suggestions,
    timestamp: new Date().toISOString()
  });
});



// --- AdminJS Integration ---
// import { createServer } from 'http';
// const server = createServer(app);
// import { buildAdminRouter } from './admin/index.js'; // Import AdminJS build function

// const adminRouter = buildAdminRouter(server); // Use the imported AdminJS router
// app.use('/admin', adminRouter); // Mount AdminJS at the /admin path
// Import AdminJS build function
// import { buildAdminRouter } from './admin/index.js'; // Path to your AdminJS router

// Mount AdminJS - Must be done before global error handler but after regular API routes
// app.use('/admin', buildAdminRouter()); // Mount AdminJS at the /admin path



//*** Admin ***/

// MongoDB connection is handled in index.js through connectDB()

// // Mount AdminJS
// app.use(admin.options.rootPath, adminRouter);

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running: http://localhost:${PORT}${admin.options.rootPath}`);
// });



export default app ;