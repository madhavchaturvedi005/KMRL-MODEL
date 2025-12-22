# 🚀 KMRL Document Intelligence - Complete Deployment Guide

Complete guide for deploying the KMRL Document Intelligence System with LangChain + Google AI backend to production.

## 📋 Architecture Overview

```
Frontend (Vercel) ←→ Backend API (Render/Railway) ←→ Google AI
                                    ↓
                              Supabase (Database + Storage + Vector Search)
```

## 🔧 Prerequisites

### Required Accounts & Services
1. **Supabase Account** - Database, Storage, Vector Search
2. **Google AI Studio** - AI processing and embeddings
3. **Render Account** - Backend API hosting (Recommended)
4. **Vercel Account** - Frontend hosting
5. **GitHub Account** - Code repository

### Required API Keys
- Supabase URL + Anon Key + Service Role Key
- Google AI API Key
- JWT Secret (generate a secure random string)

## 📦 Phase 1: Supabase Setup

### 1. Create Supabase Project
```bash
# Go to https://supabase.com/dashboard
# Create new project
# Note down: Project URL, anon key, service_role key
```

### 2. Enable pgvector Extension
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run Database Schema
```bash
# Execute the enhanced schema
# File: docs/sql/supabase-enhanced-schema.sql
```

### 4. Set up Storage
```bash
# In Supabase Dashboard:
# 1. Go to Storage
# 2. Create bucket named "documents"
# 3. Set bucket to public
# 4. Configure RLS policies (already in schema)
```

### 5. Configure Authentication
```bash
# In Supabase Dashboard:
# 1. Go to Authentication > Settings
# 2. Enable Email authentication
# 3. Disable email confirmations for testing
# 4. Add test user: admin@kmrl.com / admin123
```

## 🤖 Phase 2: Google AI Setup

### 1. Get Google AI API Key
```bash
# 1. Go to https://aistudio.google.com/
# 2. Create new API key
# 3. Copy the key (starts with AIza...)
# 4. Enable required models:
#    - Gemini 1.5 Flash (for analysis)
#    - Gemini 1.5 Pro (for complex Q&A)
#    - Text Embedding 004 (for embeddings)
```

### 2. Test API Access
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

## 🎨 Phase 3: Backend Deployment (Render - Recommended)

### 1. Prepare Backend
```bash
cd backend-api

# Install dependencies
npm install

# Create production .env
cp .env.example .env
# Edit .env with your actual values
```

### 2. Deploy to Render
```bash
# Run deployment helper
./deploy-render.sh

# Or follow manual steps:
# 1. Go to https://render.com
# 2. Connect GitHub repository
# 3. Create Web Service with these settings:
#    - Repository: your-github-repo
#    - Branch: main
#    - Root Directory: backend-api
#    - Build Command: npm ci --only=production
#    - Start Command: npm start
#    - Environment: Node
```

### 3. Set Environment Variables in Render
```bash
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=your-google-ai-key
JWT_SECRET=your-generated-jwt-secret-64-chars-long
FRONTEND_URL=https://your-frontend.vercel.app
```

**💡 Generate JWT_SECRET:**
```bash
# Run this command to generate a secure JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use the helper script:
cd backend-api && ./generate-secrets.sh
```

### 4. Verify Backend Deployment
```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Should return:
{
  "status": "healthy",
  "services": {
    "supabase": "configured",
    "googleAI": "configured"
  }
}
```

## 🌐 Phase 4: Frontend Deployment (Vercel)

### 1. Update Frontend Configuration
```bash
# Update .env with production values
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_API_URL=https://your-backend.onrender.com
VITE_USE_BACKEND_API=true
VITE_GOOGLE_AI_API_KEY=your-google-ai-key
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_BACKEND_API_URL
vercel env add VITE_USE_BACKEND_API
```

### 3. Update CORS in Backend
```bash
# Update Render environment variable
FRONTEND_URL=https://your-app.vercel.app
```

## 🧪 Phase 5: Testing & Verification

### 1. Test Complete Flow
```bash
# 1. Open frontend: https://your-app.vercel.app
# 2. Login with: admin@kmrl.com / admin123
# 3. Upload a test PDF document
# 4. Verify processing status updates
# 5. Ask questions about the document
# 6. Check AI responses and sources
```

### 2. Monitor Logs
```bash
# Backend logs (Render)
# Check Render dashboard > Logs tab

# Frontend logs (Vercel)
# Check Vercel dashboard > Functions tab
```

### 3. Performance Testing
```bash
# Test document upload
curl -X POST https://your-backend.onrender.com/api/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "document=@test.pdf"

# Test AI processing
curl -X POST https://your-backend.onrender.com/api/ai/process/document-id \
  -H "Authorization: Bearer your-jwt-token"

# Test RAG Q&A
curl -X POST https://your-backend.onrender.com/api/chat/ask/document-id \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'
```

## 🔒 Phase 6: Security & Production Setup

### 1. Secure Environment Variables
```bash
# Never commit .env files
# Use strong JWT secrets (32+ characters)
# Rotate API keys regularly
# Enable Supabase RLS policies
```

### 2. Set up Monitoring
```bash
# Render: Enable metrics and alerts
# Vercel: Monitor function execution
# Supabase: Check database performance
# Google AI: Monitor API usage and costs
```

### 3. Configure Rate Limiting
```bash
# Backend already includes rate limiting:
# - 1000 requests/15min for general API
# - 20 requests/5min for AI endpoints
# - 10 requests/1min for chat endpoints
```

## 📊 Phase 7: Monitoring & Maintenance

### 1. Health Checks
```bash
# Automated health checks
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api/ai/health
```

### 2. Cost Monitoring
- **Google AI**: Monitor token usage in AI Studio
- **Render**: Check compute usage in dashboard
- **Vercel**: Monitor function executions
- **Supabase**: Check database and storage usage

### 3. Performance Optimization
- Monitor document processing times
- Optimize chunk sizes for better search
- Cache frequently accessed documents
- Implement CDN for file downloads

## 🚨 Troubleshooting

### Common Issues

#### 1. Backend API Connection Failed
```bash
# Check Render deployment status
# Check environment variables
# Check logs in Render dashboard
```

#### 2. Google AI API Errors
```bash
# Verify API key
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY"

# Check quota limits in AI Studio
```

#### 3. Supabase Connection Issues
```bash
# Test database connection
curl -H "apikey: your-anon-key" \
     "https://your-project.supabase.co/rest/v1/documents?select=count"

# Check RLS policies
# Ensure pgvector extension is enabled
```

#### 4. File Upload Failures
```bash
# Check storage bucket permissions
# Verify file size limits (50MB max)
# Check supported file formats
```

### Debug Mode
```bash
# Enable debug logging in Render
LOG_LEVEL=debug

# Check detailed logs in Render dashboard
```

## 📈 Scaling Considerations

### For High Volume Usage:
1. **Database**: Upgrade Supabase plan for more connections
2. **Backend**: Scale Render instances or upgrade plan
3. **AI**: Monitor Google AI quotas and costs
4. **Storage**: Implement CDN for file serving
5. **Caching**: Add Redis for frequently accessed data

## 🎯 Success Metrics

### Deployment is successful when:
- ✅ Frontend loads without errors
- ✅ User can login with mock credentials
- ✅ Documents upload successfully
- ✅ AI processing completes within 2-3 minutes
- ✅ RAG Q&A returns relevant answers
- ✅ All health checks pass
- ✅ No console errors in browser
- ✅ Backend logs show successful operations

## 🔄 Alternative Deployment Options

### Backend Alternatives:
1. **Render** (Recommended) - Simple, reliable, great free tier
2. **Railway** - Good for complex deployments, can be tricky
3. **Heroku** - Classic choice, more expensive
4. **DigitalOcean App Platform** - Good performance
5. **AWS/GCP/Azure** - Enterprise-grade, more complex

### Frontend Alternatives:
1. **Vercel** (Recommended) - Optimized for React/Next.js
2. **Netlify** - Great for static sites
3. **GitHub Pages** - Free for public repos
4. **Firebase Hosting** - Good Google integration

## 📞 Support

### Getting Help:
1. Check specific deployment guides:
   - [Render Deployment](RENDER-DEPLOYMENT.md)
   - [Railway Deployment](RAILWAY-DEPLOYMENT.md)
2. Review service-specific logs
3. Test each service individually
4. Verify all environment variables
5. Check API quotas and limits

### Useful Commands:
```bash
# Check backend status
curl -I https://your-backend.onrender.com/health

# Test document upload
curl -X POST https://your-backend.onrender.com/api/upload \
  -F "document=@test.pdf"

# Monitor backend logs
# Use Render dashboard

# Check database connection
# Use Supabase dashboard SQL editor
```

## 💰 Cost Breakdown (Monthly)

### Development/Testing:
- **Supabase**: Free tier (up to 500MB database, 1GB storage)
- **Google AI**: ~$5-10 (depending on usage)
- **Render**: Free tier (750 hours, sleeps after 15min)
- **Vercel**: Free tier (100GB bandwidth)
- **Total**: ~$5-10/month

### Production:
- **Supabase**: Pro plan $25/month
- **Google AI**: ~$20-50/month (depending on volume)
- **Render**: Starter plan $7/month (always-on)
- **Vercel**: Pro plan $20/month
- **Total**: ~$72-102/month

This deployment guide ensures a smooth setup of the complete KMRL Document Intelligence System! 🚀