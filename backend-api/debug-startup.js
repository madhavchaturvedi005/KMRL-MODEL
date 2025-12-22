#!/usr/bin/env node

/**
 * Debug script to identify startup issues
 */

import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';

console.log('🔍 Debugging KMRL Backend Startup Issues...');
console.log('===========================================');

// Load environment variables first
try {
  dotenv.config();
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.log('❌ Failed to load environment variables:', error.message);
}

// Test 1: Check Node.js version
console.log('\n1. Node.js Version:');
console.log(`   Version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Architecture: ${process.arch}`);

// Test 2: Check environment variables
console.log('\n2. Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? 'set' : 'not set'}`);
console.log(`   GOOGLE_AI_API_KEY: ${process.env.GOOGLE_AI_API_KEY ? 'set' : 'not set'}`);

// Test 3: Check package.json
console.log('\n3. Package Configuration:');
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  console.log(`   Name: ${pkg.name}`);
  console.log(`   Version: ${pkg.version}`);
  console.log(`   Type: ${pkg.type}`);
  console.log(`   Main: ${pkg.main}`);
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Test 4: Check critical dependencies
console.log('\n4. Testing Critical Dependencies:');

const dependencies = [
  'express',
  'cors',
  'dotenv',
  'winston',
  '@supabase/supabase-js',
  '@google/generative-ai'
];

for (const dep of dependencies) {
  try {
    await import(dep);
    console.log(`   ✅ ${dep}: OK`);
  } catch (error) {
    console.log(`   ❌ ${dep}: ${error.message}`);
  }
}

// Test 5: Check file structure
console.log('\n5. File Structure:');

const files = [
  'src/server.js',
  'src/utils/logger.js',
  'src/middleware/errorHandler.js',
  'src/routes/documents.js',
  'src/routes/upload.js',
  'src/routes/ai.js',
  'src/routes/search.js',
  'src/routes/chat.js'
];

for (const file of files) {
  const exists = existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
}

// Test 6: Check logs directory
console.log('\n6. Logs Directory:');
const logsExists = existsSync('logs');
console.log(`   ${logsExists ? '✅' : '❌'} logs directory exists`);

// Test 7: Try importing main modules
console.log('\n7. Testing Module Imports:');

try {
  const { logger } = await import('./src/utils/logger.js');
  console.log('   ✅ Logger: OK');
  logger.info('Logger test successful');
} catch (error) {
  console.log(`   ❌ Logger: ${error.message}`);
}

try {
  await import('./src/middleware/errorHandler.js');
  console.log('   ✅ Error Handler: OK');
} catch (error) {
  console.log(`   ❌ Error Handler: ${error.message}`);
}

// Test 8: Try starting minimal server
console.log('\n8. Testing Minimal Server:');
try {
  const express = (await import('express')).default;
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Test endpoint working' });
  });
  
  const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`   ✅ Minimal server started on port ${port}`);
    server.close();
  });
} catch (error) {
  console.log(`   ❌ Minimal server failed: ${error.message}`);
}

console.log('\n🎯 Debug Complete!');
console.log('\nIf you see any ❌ errors above, those need to be fixed first.');
console.log('If all tests pass, the issue might be in the deployment environment.');