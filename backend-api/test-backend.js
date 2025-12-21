#!/usr/bin/env node

/**
 * Simple test script to verify backend API functionality
 * Run with: node test-backend.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`Testing ${name}...`, 'blue');
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ ${name} - SUCCESS`, 'green');
      return { success: true, data };
    } else {
      log(`❌ ${name} - FAILED: ${response.status} ${data.error || data.message}`, 'red');
      return { success: false, error: data };
    }
  } catch (error) {
    log(`❌ ${name} - ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('🚀 Starting KMRL Backend API Tests', 'yellow');
  log(`Testing against: ${BASE_URL}`, 'blue');
  console.log();

  const results = [];

  // Test 1: Health Check
  const health = await testEndpoint(
    'Health Check',
    `${BASE_URL}/health`
  );
  results.push(health);

  if (health.success) {
    log(`   Status: ${health.data.status}`, 'green');
    log(`   Services: ${JSON.stringify(health.data.services)}`, 'green');
  }
  console.log();

  // Test 2: AI Health Check (requires auth, might fail)
  const aiHealth = await testEndpoint(
    'AI Health Check',
    `${API_URL}/ai/health`
  );
  results.push(aiHealth);
  console.log();

  // Test 3: Documents endpoint (requires auth, might fail)
  const documents = await testEndpoint(
    'Get Documents',
    `${API_URL}/documents`
  );
  results.push(documents);
  console.log();

  // Test 4: Test text analysis (requires auth and Google AI key)
  const textAnalysis = await testEndpoint(
    'Text Analysis',
    `${API_URL}/ai/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'This is a test document for analyzing the AI capabilities of the KMRL system.',
        fileName: 'test.txt'
      })
    }
  );
  results.push(textAnalysis);
  console.log();

  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  log('📊 Test Summary:', 'yellow');
  log(`   Successful: ${successful}/${total}`, successful === total ? 'green' : 'yellow');
  
  if (successful === total) {
    log('🎉 All tests passed! Backend is ready.', 'green');
  } else if (successful > 0) {
    log('⚠️  Some tests failed. Check configuration.', 'yellow');
  } else {
    log('💥 All tests failed. Backend may not be running.', 'red');
  }

  console.log();
  log('💡 Tips:', 'blue');
  log('   - Make sure backend is running: npm run dev', 'blue');
  log('   - Check environment variables in .env', 'blue');
  log('   - Verify Google AI API key is set', 'blue');
  log('   - Ensure Supabase credentials are correct', 'blue');
}

// Run tests
runTests().catch(error => {
  log(`💥 Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});