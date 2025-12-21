#!/bin/bash

# Railway deployment script for KMRL Backend API

echo "🚀 Deploying KMRL Backend API to Railway..."

# Check if we're in the backend-api directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend-api directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway whoami || railway login

# Create new project or link existing one
echo "🔗 Setting up Railway project..."
if [ ! -f ".railway" ]; then
    echo "Creating new Railway project..."
    railway new
else
    echo "Using existing Railway project..."
fi

# Set environment variables
echo "⚙️ Setting environment variables..."
echo "Please make sure to set these environment variables in Railway dashboard:"
echo "- NODE_ENV=production"
echo "- SUPABASE_URL=your-supabase-url"
echo "- SUPABASE_ANON_KEY=your-supabase-anon-key"
echo "- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "- GOOGLE_AI_API_KEY=your-google-ai-key"
echo "- JWT_SECRET=your-jwt-secret"
echo "- FRONTEND_URL=your-frontend-url"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Check your Railway dashboard for the deployment URL"
echo "🏥 Health check: https://your-app.railway.app/health"