#!/usr/bin/env node

/**
 * Test script to verify Supabase and Google AI credentials
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

console.log('🔑 Testing Backend API Credentials...');
console.log('=====================================');

// Test 1: Check environment variables
console.log('\n1. Environment Variables:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   GOOGLE_AI_API_KEY: ${process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Missing'}`);

// Test 2: Supabase Connection
console.log('\n2. Testing Supabase Connection:');
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test database connection
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ❌ Database Error: ${error.message}`);
      if (error.message.includes('JWT')) {
        console.log('   💡 Hint: Check if SUPABASE_SERVICE_ROLE_KEY is complete and valid');
      }
    } else {
      console.log('   ✅ Database connection successful');
    }

    // Test storage connection
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    if (storageError) {
      console.log(`   ❌ Storage Error: ${storageError.message}`);
    } else {
      console.log(`   ✅ Storage connection successful (${buckets.length} buckets)`);
    }

  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }
} else {
  console.log('   ⏭️  Skipped - Missing Supabase credentials');
}

// Test 3: Google AI Connection
console.log('\n3. Testing Google AI Connection:');
if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== '') {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Test with a simple request
    const result = await model.generateContent('Say "Hello" if you can respond.');
    const response = await result.response;
    const text = response.text();

    if (text && text.toLowerCase().includes('hello')) {
      console.log('   ✅ Google AI connection successful');
      console.log(`   📝 Test response: "${text.substring(0, 50)}..."`);
    } else {
      console.log('   ⚠️  Google AI responded but unexpectedly');
      console.log(`   📝 Response: "${text.substring(0, 100)}..."`);
    }

  } catch (error) {
    console.log(`   ❌ Google AI Error: ${error.message}`);
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('   💡 Hint: Check if GOOGLE_AI_API_KEY is valid');
      console.log('   🔗 Get key from: https://makersuite.google.com/app/apikey');
    }
  }
} else {
  console.log('   ⏭️  Skipped - Missing Google AI API key');
}

// Test 4: Overall Status
console.log('\n4. Overall Status:');
const supabaseOk = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleAiOk = process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== '';

if (supabaseOk && googleAiOk) {
  console.log('   🎉 All credentials configured! Backend should work fully.');
} else if (supabaseOk || googleAiOk) {
  console.log('   ⚠️  Partial configuration - some features will be disabled.');
} else {
  console.log('   ❌ Missing critical credentials - backend will have limited functionality.');
}

console.log('\n📋 Next Steps:');
if (!supabaseOk) {
  console.log('   1. Get Supabase service role key from dashboard');
}
if (!googleAiOk) {
  console.log('   2. Get Google AI API key from makersuite.google.com');
}
if (supabaseOk && googleAiOk) {
  console.log('   1. Start the backend: npm start');
  console.log('   2. Test health endpoint: curl http://localhost:3001/health');
  console.log('   3. Deploy to Render with same environment variables');
}

console.log('\n✨ Credential test complete!');