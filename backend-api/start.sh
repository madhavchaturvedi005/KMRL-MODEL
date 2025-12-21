#!/bin/bash

# KMRL Document Intelligence Backend Startup Script

echo "🚀 Starting KMRL Document Intelligence Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your actual configuration values."
    echo "   Required: SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_AI_API_KEY"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

# Check environment variables
echo "🔍 Checking configuration..."

if grep -q "your-google-ai-api-key-here" .env; then
    echo "⚠️  Google AI API key not configured in .env file"
    echo "   Please set GOOGLE_AI_API_KEY in .env"
fi

if grep -q "your-supabase-" .env; then
    echo "⚠️  Supabase credentials not configured in .env file"
    echo "   Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env"
fi

# Start the server
echo "🌟 Starting server..."
echo "📍 Backend will be available at: http://localhost:${PORT:-3001}"
echo "🔗 Health check: http://localhost:${PORT:-3001}/health"
echo "📚 API docs: http://localhost:${PORT:-3001}/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run in development mode with auto-restart
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi