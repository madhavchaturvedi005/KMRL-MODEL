# 🚂 Railway Deployment Guide - KMRL Backend API

Complete guide for deploying the KMRL Document Intelligence Backend API to Railway.

## 🔧 Prerequisites

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
2. **Railway CLI** - Install the Railway CLI
3. **Environment Variables** - Prepare your API keys and credentials

## 📦 Step 1: Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Verify installation
railway --version
```

## 🔐 Step 2: Login to Railway

```bash
# Login to Railway
railway login

# Verify login
railway whoami
```

## 🚀 Step 3: Deploy Backend

### Option A: Using the Deployment Script (Recommended)

```bash
# Navigate to backend directory
cd backend-api

# Run deployment script
./deploy-railway.sh
```

### Option B: Manual Deployment

```bash
# Navigate to backend directory
cd backend-api

# Create new Railway project
railway new

# Deploy
railway up
```

## ⚙️ Step 4: Configure Environment Variables

Set these environment variables in your Railway dashboard:

### Required Variables:
```bash
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

### Optional Variables:
```bash
# File Upload Configuration
MAX_FILE_SIZE=52428800
SUPPORTED_FORMATS=pdf,doc,docx,txt,csv,xlsx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=info
```

## 🔧 Step 5: Set Environment Variables via CLI

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=your-supabase-url
railway variables set SUPABASE_ANON_KEY=your-anon-key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
railway variables set GOOGLE_AI_API_KEY=your-google-ai-key
railway variables set JWT_SECRET=your-jwt-secret
railway variables set FRONTEND_URL=https://your-frontend.vercel.app

# Verify variables
railway variables
```

## 🏥 Step 6: Verify Deployment

### Check Deployment Status
```bash
# Check deployment status
railway status

# View logs
railway logs

# Get deployment URL
railway domain
```

### Test Health Endpoint
```bash
# Test health check (replace with your Railway URL)
curl https://your-app.railway.app/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "supabase": "configured",
    "googleAI": "configured"
  }
}
```

### Test API Endpoints
```bash
# Test documents endpoint (requires auth)
curl https://your-app.railway.app/api/documents

# Test AI health
curl https://your-app.railway.app/api/ai/health
```

## 🔄 Step 7: Update Frontend Configuration

Update your frontend `.env` file with the Railway backend URL:

```bash
# Frontend .env
VITE_BACKEND_API_URL=https://your-app.railway.app
VITE_USE_BACKEND_API=true
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails with Bun Error
**Problem**: Railway tries to use `bun install` instead of `npm`

**Solution**: 
- Ensure `nixpacks.toml` is present in backend-api directory
- Use `railway.json` with `NIXPACKS` builder
- Remove any `bun.lockb` files from backend directory

#### 2. Environment Variables Not Set
**Problem**: API returns configuration errors

**Solution**:
```bash
# Check current variables
railway variables

# Set missing variables
railway variables set VARIABLE_NAME=value
```

#### 3. Health Check Fails
**Problem**: Deployment shows as unhealthy

**Solution**:
```bash
# Check logs
railway logs

# Common issues:
# - Missing environment variables
# - Database connection issues
# - Port configuration problems
```

#### 4. CORS Errors
**Problem**: Frontend can't connect to backend

**Solution**:
```bash
# Set correct frontend URL
railway variables set FRONTEND_URL=https://your-frontend.vercel.app

# Redeploy
railway up
```

#### 5. Database Connection Issues
**Problem**: Supabase connection fails

**Solution**:
- Verify Supabase URL and keys
- Check if Supabase project is active
- Ensure RLS policies are configured correctly

## 📊 Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
railway logs --tail

# Filter logs
railway logs --filter error
```

### Restart Service
```bash
# Restart the service
railway restart
```

### Update Deployment
```bash
# Redeploy after code changes
railway up
```

### Scale Service
```bash
# View current resources
railway status

# Railway automatically scales based on usage
```

## 💰 Cost Optimization

### Railway Pricing
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- **Usage**: Based on CPU, RAM, and network

### Optimization Tips
1. **Use efficient Docker image** (Node.js Alpine)
2. **Minimize dependencies** (production only)
3. **Implement proper logging levels**
4. **Use health checks** for faster recovery
5. **Monitor resource usage** in Railway dashboard

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Rotate API keys regularly
- Use service role keys only for backend

### Network Security
- Configure CORS properly
- Use HTTPS only
- Implement rate limiting
- Monitor for suspicious activity

## 📈 Performance Optimization

### Railway Configuration
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Application Optimization
- Use connection pooling for database
- Implement caching for frequent queries
- Optimize Docker image size
- Use compression middleware

## 🎯 Success Checklist

- [ ] Railway CLI installed and authenticated
- [ ] Backend deployed successfully
- [ ] All environment variables configured
- [ ] Health check endpoint returns 200
- [ ] API endpoints respond correctly
- [ ] Frontend can connect to backend
- [ ] Document upload works
- [ ] AI processing functions
- [ ] Database operations work
- [ ] Logs show no errors

## 📞 Support

### Railway Support
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

### Useful Commands
```bash
# Get help
railway help

# Check service status
railway status

# View environment variables
railway variables

# Connect to database (if using Railway DB)
railway connect

# Open Railway dashboard
railway open
```

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect Railway to your GitHub repository
2. Enable automatic deployments on push to main
3. Configure branch-based deployments
4. Set up environment-specific variables

### Deployment Workflow
```bash
# Development workflow
git add .
git commit -m "Update backend"
git push origin main

# Railway automatically deploys
# Monitor deployment in Railway dashboard
```

This guide ensures a smooth deployment of your KMRL Backend API to Railway! 🚀