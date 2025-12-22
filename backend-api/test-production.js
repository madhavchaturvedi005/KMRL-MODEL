#!/usr/bin/env node

/**
 * Test production configuration locally before deploying to Render
 */

import { spawn } from 'child_process';

console.log('🧪 Testing Production Configuration...');
console.log('=====================================');

// Set production environment variables
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '10000'
};

console.log('🚀 Starting server in production mode...');
console.log('   Environment: production');
console.log('   Port: 10000');
console.log('   Press Ctrl+C to stop\n');

// Start the server
const server = spawn('node', ['src/server.js'], {
  env,
  stdio: 'inherit',
  cwd: process.cwd()
});

// Handle server exit
server.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Server stopped gracefully');
  } else {
    console.log(`\n❌ Server exited with code ${code}`);
  }
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping server...');
  server.kill('SIGTERM');
});

// Test health endpoint after a delay
setTimeout(async () => {
  try {
    const response = await fetch('http://localhost:10000/health');
    const data = await response.json();
    
    console.log('\n🔍 Health Check Result:');
    console.log('   Status:', data.status);
    console.log('   Environment:', data.environment);
    console.log('   Services:', data.services);
    
    if (data.status === 'healthy') {
      console.log('\n✅ Production configuration is working!');
      console.log('🚀 Ready for Render deployment');
    } else {
      console.log('\n⚠️  Health check shows issues');
    }
  } catch (error) {
    console.log('\n❌ Health check failed:', error.message);
    console.log('💡 Make sure the server started successfully');
  }
}, 3000);