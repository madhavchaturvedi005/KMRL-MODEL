#!/usr/bin/env node

/**
 * JWT Secret Generator for KMRL Document Intelligence System
 * 
 * This script generates a secure JWT secret for authentication.
 * Run with: node generate-jwt-secret.js
 */

import crypto from 'crypto';

console.log('🔐 JWT Secret Generator for KMRL Document Intelligence');
console.log('====================================================');
console.log('');

// Generate a secure JWT secret (64 bytes = 128 hex characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated JWT Secret:');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');
console.log('📋 Instructions:');
console.log('1. Copy the JWT_SECRET value above');
console.log('2. Add it to your .env file or Render environment variables');
console.log('3. Never commit this secret to Git');
console.log('4. Use different secrets for development and production');
console.log('');
console.log('🔒 Security Notes:');
console.log('- This secret is used to sign JWT tokens');
console.log('- Keep it secure and never share it');
console.log('- Rotate it regularly (every 90 days recommended)');
console.log('- Use a different secret for each environment');
console.log('');

// Also generate some additional secrets that might be useful
console.log('🎁 Bonus Secrets (optional):');
console.log('');
console.log('Session Secret (32 bytes):');
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log('');
console.log('API Key (32 bytes, base64):');
console.log(`API_KEY=${crypto.randomBytes(32).toString('base64')}`);
console.log('');
console.log('Encryption Key (32 bytes):');
console.log(`ENCRYPTION_KEY=${crypto.randomBytes(32).toString('hex')}`);
console.log('');

console.log('🚀 Ready to deploy to Render!');