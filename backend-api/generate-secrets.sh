#!/bin/bash

# Script to generate secure secrets for KMRL Backend API

echo "🔐 Generating Secure Secrets for KMRL Backend API"
echo "=================================================="
echo ""

# Generate JWT Secret
echo "📝 JWT_SECRET (for signing authentication tokens):"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET"
echo ""

# Generate another secret for session encryption (optional)
echo "📝 SESSION_SECRET (optional, for session encryption):"
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

# Generate API Key (optional, for internal API authentication)
echo "📝 API_KEY (optional, for internal API calls):"
API_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "API_KEY=$API_KEY"
echo ""

echo "=================================================="
echo "✅ Secrets generated successfully!"
echo ""
echo "📋 Copy these values to your .env file or Render dashboard"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "1. Never commit these secrets to Git"
echo "2. Use different secrets for development and production"
echo "3. Store secrets securely (use environment variables)"
echo "4. Rotate secrets regularly (every 90 days recommended)"
echo "5. Never share secrets in plain text"
echo ""
echo "💡 To use in Render:"
echo "   1. Go to your service in Render dashboard"
echo "   2. Click 'Environment' tab"
echo "   3. Add JWT_SECRET with the generated value"
echo ""