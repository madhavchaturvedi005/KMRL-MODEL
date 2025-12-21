#!/bin/bash

# Render deployment script for KMRL Backend API

echo "🎨 Deploying KMRL Backend API to Render..."

# Check if we're in the backend-api directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend-api directory"
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found"
    exit 1
fi

echo "✅ Configuration files found"
echo ""
echo "📋 Next steps for Render deployment:"
echo ""
echo "1. 🌐 Go to https://render.com and sign up/login"
echo "2. 🔗 Connect your GitHub repository"
echo "3. 📁 Create a new Web Service"
echo "4. ⚙️ Configure the service:"
echo "   - Repository: your-github-repo"
echo "   - Branch: main"
echo "   - Root Directory: backend-api"
echo "   - Environment: Node"
echo "   - Build Command: npm ci --only=production"
echo "   - Start Command: npm start"
echo ""
echo "5. 🔧 Set Environment Variables:"
echo "   SUPABASE_URL=your-supabase-url"
echo "   SUPABASE_ANON_KEY=your-anon-key"
echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "   GOOGLE_AI_API_KEY=your-google-ai-key"
echo "   JWT_SECRET=your-jwt-secret"
echo "   FRONTEND_URL=https://your-frontend.vercel.app"
echo ""
echo "6. 🚀 Deploy!"
echo ""
echo "📖 For detailed instructions, see: docs/guides/RENDER-DEPLOYMENT.md"