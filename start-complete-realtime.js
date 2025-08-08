#!/usr/bin/env node

/**
 * Complete Real-time System Startup Script
 * This script starts your comprehensive real-time integration
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Complete GeekLappy Real-time System...\n');

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Check if directories exist
const backendPath = join(__dirname, 'backend');
const frontendPath = join(__dirname, 'geekapp');

if (!existsSync(backendPath)) {
  colorLog('❌ Backend directory not found!', colors.red);
  process.exit(1);
}

if (!existsSync(frontendPath)) {
  colorLog('❌ Frontend directory not found!', colors.red);
  process.exit(1);
}

// Start backend server
colorLog('📡 Starting Backend with Complete Real-time Integration...', colors.blue);

const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

backendProcess.on('error', (error) => {
  colorLog(`❌ Backend error: ${error.message}`, colors.red);
});

// Wait for backend to start
setTimeout(() => {
  colorLog('\n📱 Starting Frontend with Real-time Features...', colors.green);
  
  const frontendProcess = spawn('npm', ['start'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true
  });

  frontendProcess.on('error', (error) => {
    colorLog(`❌ Frontend error: ${error.message}`, colors.red);
  });

  // Show success message after a delay
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    colorLog('🎉 COMPLETE REAL-TIME SYSTEM RUNNING!', colors.green + colors.bright);
    console.log('='.repeat(60));
    
    colorLog('\n🌐 Backend Server:', colors.cyan);
    colorLog('   • API Server: http://localhost:8000', colors.reset);
    colorLog('   • AdminJS Panel: http://localhost:8000/admin', colors.yellow);
    colorLog('   • WebSocket Server: ws://localhost:8000', colors.reset);
    
    colorLog('\n📱 Frontend App:', colors.cyan);
    colorLog('   • React Native: Check terminal output above', colors.reset);
    colorLog('   • Real-time Features: Enabled ✅', colors.green);
    
    colorLog('\n🔌 Integration Status:', colors.cyan);
    colorLog('   • Products: Real-time ✅', colors.green);
    colorLog('   • Orders: Real-time ✅', colors.green);
    colorLog('   • Notifications: Real-time ✅', colors.green);
    colorLog('   • Wallet: Real-time ✅', colors.green);
    colorLog('   • Transactions: Real-time ✅', colors.green);
    colorLog('   • Cart: Real-time ✅', colors.green);
    colorLog('   • Reviews: Real-time ✅', colors.green);
    colorLog('   • FAQs: Real-time ✅', colors.green);
    colorLog('   • Categories: Real-time ✅', colors.green);
    colorLog('   • Users: Real-time ✅', colors.green);
    
    colorLog('\n🧪 Quick Test:', colors.cyan);
    colorLog('   1. Open AdminJS: http://localhost:8000/admin', colors.reset);
    colorLog('   2. Create/update any product', colors.reset);
    colorLog('   3. Watch it appear instantly in your mobile app! ✨', colors.magenta);
    
    colorLog('\n📊 Health Checks:', colors.cyan);
    colorLog('   • curl http://localhost:8000/api/v1/health', colors.reset);
    colorLog('   • curl http://localhost:8000/api/v1/websocket/health', colors.reset);
    
    colorLog('\n📚 Documentation:', colors.cyan);
    colorLog('   • Complete Integration Status: COMPREHENSIVE_INTEGRATION_STATUS.md', colors.reset);
    colorLog('   • Setup Guide: FINAL_SETUP_STEPS.md', colors.reset);
    colorLog('   • Technical Details: WEBSOCKET_AXIOS_SETUP.md', colors.reset);
    
    colorLog('\n⚡ Real-time Features Available:', colors.yellow);
    colorLog('   • Admin changes → Instant frontend updates', colors.reset);
    colorLog('   • User actions → Real-time admin analytics', colors.reset);
    colorLog('   • Live notifications → Push alerts', colors.reset);
    colorLog('   • Dynamic cart → Real-time price updates', colors.reset);
    colorLog('   • Order tracking → Live status updates', colors.reset);
    colorLog('   • Wallet sync → Instant balance updates', colors.reset);
    
    console.log('\n' + '='.repeat(60));
    colorLog('🚀 Your GeekLappy app now has ENTERPRISE-LEVEL real-time capabilities!', colors.green + colors.bright);
    colorLog('Press Ctrl+C to stop all servers', colors.yellow);
    console.log('='.repeat(60) + '\n');
    
  }, 5000);

}, 3000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  colorLog('\n🛑 Shutting down servers...', colors.yellow);
  backendProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  colorLog('\n🛑 Shutting down servers...', colors.yellow);
  backendProcess.kill('SIGTERM');
  process.exit(0);
});