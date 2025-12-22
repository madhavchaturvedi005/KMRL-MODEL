#!/usr/bin/env node

/**
 * Test environment variable loading
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing Environment Variable Loading...');
console.log('==========================================');

// Test different .env file paths
const envPaths = [
  '.env',
  '../.env',
  join(__dirname, '.env'),
  join(__dirname, '../.env')
];

console.log('\n1. Checking .env file locations:');
envPaths.forEach(path => {
  const exists = existsSync(path);
  console.log(`   ${exists ? '✅' : '❌'} ${path}`);
});

console.log('\n2. Current working directory:', process.cwd());
console.log('3. Script directory:', __dirname);

// Try loading from different paths
console.log('\n4. Testing dotenv loading:');

// Method 1: Default (current working directory)
console.log('\n   Method 1: Default dotenv.config()');
const result1 = dotenv.config();
console.log('   Result:', result1.error ? `❌ ${result1.error.message}` : '✅ Success');

// Method 2: Relative path
console.log('\n   Method 2: Relative path "../.env"');
const result2 = dotenv.config({ path: '../.env' });
console.log('   Result:', result2.error ? `❌ ${result2.error.message}` : '✅ Success');

// Method 3: Absolute path
console.log('\n   Method 3: Absolute path join(__dirname, "../.env")');
const result3 = dotenv.config({ path: join(__dirname, '../.env') });
console.log('   Result:', result3.error ? `❌ ${result3.error.message}` : '✅ Success');

// Check specific environment variables
console.log('\n5. Environment Variables Check:');
const envVars = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_AI_API_KEY'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ❌ ${varName}: not set`);
  }
});

console.log('\n✨ Environment loading test complete!');