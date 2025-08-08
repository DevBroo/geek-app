import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './src/app.js';
import connectDB from './src/db/index.js';
import { buildAdminRouter } from './src/admin/index.js';

// Load environment variables
dotenv.config({ path: '.env' });

async function startServer() {
  try {
    console.log('🚀 Starting Geek Lappy Admin Server...');
    
    // Connect to database
    console.log('📊 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Create HTTP server
    const server = createServer(app);

    // Setup AdminJS
    console.log('👑 Setting up AdminJS...');
    const adminRouter = buildAdminRouter(server);
    app.use('/admin', adminRouter);
    console.log('✅ AdminJS configured successfully');

    const PORT = process.env.PORT || 8080;

    // Start server
    server.listen(PORT, () => {
      console.log('\n🎉 Server started successfully!');
      console.log('=' * 50);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`👑 Admin Panel: http://localhost:${PORT}/admin`);
      console.log('📧 Admin Email: admin@geeklappy.com');
      console.log('🔐 Admin Password: GeekLappy@2024#Admin');
      console.log('=' * 50);
      console.log('✨ System is ready for use!');
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();