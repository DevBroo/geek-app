#!/usr/bin/env node

/**
 * Quick Setup Script for Real-time Axios + WebSocket Integration
 * Run: node setup-realtime.js
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Setting up Real-time Axios + WebSocket Integration...\n');

// Helper function to run commands
function runCommand(command, cwd = process.cwd()) {
  console.log(`📦 Running: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    console.log('✅ Success!\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Helper function to update package.json
function updatePackageJson(filePath, dependencies) {
  if (!existsSync(filePath)) {
    console.log(`⚠️  Package.json not found at ${filePath}`);
    return;
  }

  const packageJson = JSON.parse(readFileSync(filePath, 'utf8'));
  
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  Object.entries(dependencies).forEach(([name, version]) => {
    packageJson.dependencies[name] = version;
    console.log(`➕ Added ${name}@${version}`);
  });

  writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Updated ${filePath}\n`);
}

// Step 1: Install Backend Dependencies
console.log('🔧 Step 1: Installing Backend Dependencies...');
const backendPath = join(__dirname, 'backend');
if (existsSync(backendPath)) {
  updatePackageJson(join(backendPath, 'package.json'), {
    'socket.io': '^4.7.5',
    'socket.io-client': '^4.7.5',
    'node-cache': '^5.1.2'
  });
  runCommand('npm install', backendPath);
} else {
  console.log('⚠️  Backend directory not found, skipping...');
}

// Step 2: Install Frontend Dependencies
console.log('🔧 Step 2: Installing Frontend Dependencies...');
const frontendPath = join(__dirname, 'geekapp');
if (existsSync(frontendPath)) {
  updatePackageJson(join(frontendPath, 'package.json'), {
    'socket.io-client': '^4.7.5',
    '@react-native-async-storage/async-storage': '^1.19.5'
  });
  runCommand('npm install', frontendPath);
} else {
  console.log('⚠️  Frontend directory not found, skipping...');
}

// Step 3: Create Environment Files
console.log('🔧 Step 3: Creating Environment Files...');

const backendEnvPath = join(backendPath, '.env');
if (!existsSync(backendEnvPath)) {
  const envContent = `# Backend Environment Configuration
PORT=8000
JWT_SECRET=your-jwt-secret-key-change-this-in-production
ADMIN_COOKIE_PASSWORD=your-admin-cookie-secret-change-this
SESSION_SECRET=your-session-secret-change-this

# WebSocket Configuration  
WEBSOCKET_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:8081

# Database
MONGODB_URI=mongodb://localhost:27017/geeklappy

# AdminJS
ADMIN_EMAIL=admin@geeklappy.com
ADMIN_PASSWORD=admin123

# API Configuration
API_BASE_URL=http://localhost:8000
INTERNAL_API_KEY=internal-api-key-change-this
`;
  
  writeFileSync(backendEnvPath, envContent);
  console.log('✅ Created backend/.env file');
} else {
  console.log('📝 Backend .env file already exists');
}

const frontendEnvPath = join(frontendPath, '.env.local');
if (existsSync(frontendPath) && !existsSync(frontendEnvPath)) {
  const envContent = `# Frontend Environment Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=http://localhost:8000
`;
  
  writeFileSync(frontendEnvPath, envContent);
  console.log('✅ Created geekapp/.env.local file');
} else {
  console.log('📝 Frontend .env.local file already exists or directory not found');
}

// Step 4: Update Backend App.js to include WebSocket routes
console.log('🔧 Step 4: Checking Backend Configuration...');
const appJsPath = join(backendPath, 'src', 'app.js');
if (existsSync(appJsPath)) {
  const appContent = readFileSync(appJsPath, 'utf8');
  
  if (!appContent.includes('websocket.routes')) {
    console.log('⚠️  Please manually add WebSocket routes to backend/src/app.js:');
    console.log(`
import websocketRoutes from './routes/websocket.routes.js';
app.use('/api/v1/websocket', websocketRoutes);
    `);
  } else {
    console.log('✅ WebSocket routes already configured');
  }
} else {
  console.log('⚠️  Backend app.js not found');
}

// Step 5: Create start scripts
console.log('🔧 Step 5: Creating Start Scripts...');

const startScriptContent = `#!/bin/bash

echo "🚀 Starting GeekLappy Real-time System..."

# Start backend in background
echo "📡 Starting Backend Server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "📱 Starting Frontend..."
cd geekapp && npm start &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "🌐 Backend: http://localhost:8000"
echo "👑 AdminJS: http://localhost:8000/admin"
echo "📱 Frontend: Check Expo output"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
`;

writeFileSync(join(__dirname, 'start-realtime.sh'), startScriptContent);
runCommand('chmod +x start-realtime.sh');

// Step 6: Create test script
const testScriptContent = `#!/bin/bash

echo "🧪 Testing Real-time System..."

# Test backend health
echo "🔍 Testing Backend Health..."
curl -f http://localhost:8000/api/v1/websocket/health || echo "❌ Backend health check failed"

# Test WebSocket
echo "🔍 Testing WebSocket..."
curl -f http://localhost:8000/api/v1/websocket/test || echo "❌ WebSocket test failed"

echo "✅ Test completed!"
`;

writeFileSync(join(__dirname, 'test-realtime.sh'), testScriptContent);
runCommand('chmod +x test-realtime.sh');

console.log('\n🎉 Setup Complete! Here\'s what to do next:\n');

console.log('1️⃣  Start the system:');
console.log('   ./start-realtime.sh');
console.log('   OR manually:');
console.log('   Terminal 1: cd backend && npm run dev');
console.log('   Terminal 2: cd geekapp && npm start\n');

console.log('2️⃣  Open AdminJS:');
console.log('   http://localhost:8000/admin\n');

console.log('3️⃣  Test the real-time flow:');
console.log('   • Create a product in AdminJS');
console.log('   • Watch it appear instantly in your mobile app');
console.log('   • Browse products in app');
console.log('   • See analytics in AdminJS dashboard\n');

console.log('4️⃣  Test the system:');
console.log('   ./test-realtime.sh\n');

console.log('5️⃣  Monitor WebSocket health:');
console.log('   curl http://localhost:8000/api/v1/websocket/health\n');

console.log('📚 Documentation:');
console.log('   • Complete guide: COMPLETE_IMPLEMENTATION_GUIDE.md');
console.log('   • WebSocket setup: WEBSOCKET_AXIOS_SETUP.md');
console.log('   • Data flow: DATAFLOW_SETUP.md\n');

console.log('🛠️  Configuration files created:');
console.log('   • backend/.env (configure your secrets!)');
console.log('   • geekapp/.env.local');
console.log('   • start-realtime.sh');
console.log('   • test-realtime.sh\n');

console.log('⚠️  IMPORTANT: Update your .env files with secure secrets before production!\n');

console.log('🚀 Your real-time GeekLappy system is ready! 🎯');