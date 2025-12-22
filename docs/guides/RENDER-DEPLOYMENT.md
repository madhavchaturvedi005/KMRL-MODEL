# 🎨 Render Deployment Guide - KMRL Backend API

Complete guide for deploying the KMRL Document Intelligence Backend API to Render.

## 🌟 Why Render?

- **Simple Setup**: No complex configuration needed
- **Automatic Deployments**: Git-based deployments
- **Free Tier**: Great for development and testing
- **Node.js Optimized**: Built-in Node.js support
- **No Docker Required**: Direct Node.js deployment

## 🔧 Prerequisites

1. **Render Account** - Sign up at [render.com](https://render.com)
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **Environment Variables** - Prepare your API keys and credentials

## 🚀 Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Verify your email address

## 🔗 Step 2: Connect GitHub Repository

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `KMRL-MODEL`

## ⚙️ Step 3: Configure Web Service

### Basic Configuration:
```
Name: kmrl-backend-api
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend-api
```

### Build & Deploy Settings:
```
Build Command: npm ci --only=production
Start Command: npm start
```

### Advanced Settings:
```
Node Version: 18
Health Check Path: /health
Port: 10000 (Render default)
```

## 🔐 Step 4: Set Environment Variables

In the Render dashboard, add these environment variables:

### Required Variables:
```bash
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key

# JWT Configuration (generate a secure secret)
JWT_SECRET=your-generated-jwt-secret-64-chars-long

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

**💡 How to Generate JWT_SECRET:**
```bash
# Method 1: Using Node.js (recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using the helper script
cd backend-api
./generate-secrets.sh

# Method 3: Using OpenSSL
openssl rand -hex 64
```

**Example JWT_SECRET:**
```bash
JWT_SECRET=44f8c6772c6fdcb633dc8f6ec2e2e9cc7a872d9e885a164ce4c9a26aab43ce7969a66524814ebe18638e2d355b359e56b2c8543135a0d660357faca7970d42c1
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

## 🚀 Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies with `npm ci`
   - Start your application with `npm start`
3. Monitor the build logs in real-time
4. Get your deployment URL: `https://your-app.onrender.com`

## 🏥 Step 6: Verify Deployment

### Check Health Endpoint
```bash
# Test health check (replace with your Render URL)
curl https://your-app.onrender.com/health

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
# Test documents endpoint
curl https://your-app.onrender.com/api/documents

# Test AI health
curl https://your-app.onrender.com/api/ai/health
```

## 🔄 Step 7: Update Frontend Configuration

Update your frontend `.env` file with the Render backend URL:

```bash
# Frontend .env
VITE_BACKEND_API_URL=https://your-app.onrender.com
VITE_USE_BACKEND_API=true
```

Then redeploy your frontend to Vercel.

## 🔧 Step 8: Configure Auto-Deploy

Render automatically deploys when you push to your connected branch:

1. Make changes to your backend code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render automatically detects changes and redeploys

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails
**Problem**: Dependencies fail to install

**Solution**:
- Check `package.json` is in `backend-api` directory
- Ensure `package-lock.json` exists
- Verify Node.js version compatibility

**Note**: Sharp has been removed from dependencies to prevent native compilation issues.

#### 2. Sharp Installation Error (Fixed)
**Problem**: `error: install script from "sharp" exited with 127`

**Solution**: ✅ **Already Fixed** - Sharp has been removed from dependencies as it's not needed for document processing.

#### 3. Environment Variables Not Set
**Problem**: API returns configuration errors

**Solution**:
- Double-check all environment variables in Render dashboard
- Ensure no typos in variable names
- Verify API keys are valid

#### 4. Health Check Fails
**Problem**: Service shows as unhealthy

**Solution**:
- Check application logs in Render dashboard
- Verify `/health` endpoint exists and returns 200
- Check if all dependencies are properly installed

#### 5. CORS Errors
**Problem**: Frontend can't connect to backend

**Solution**:
- Set correct `FRONTEND_URL` environment variable
- Ensure CORS is configured in Express server
- Check if frontend URL matches exactly (no trailing slash)

For more detailed troubleshooting, see: [**Deployment Troubleshooting Guide**](DEPLOYMENT-TROUBLESHOOTING.md)

#### 5. Database Connection Issues
**Problem**: Supabase connection fails

**Solution**:
- Verify Supabase URL and keys are correct
- Check if Supabase project is active
- Ensure RLS policies allow backend access

#### 6. File Upload Issues
**Problem**: Large file uploads fail

**Solution**:
- Check `MAX_FILE_SIZE` environment variable
- Verify Render plan supports your file sizes
- Consider upgrading to paid plan for larger limits

## 📊 Monitoring & Maintenance

### View Logs
- Go to your service in Render dashboard
- Click on "Logs" tab
- View real-time application logs

### Restart Service
- In Render dashboard, click "Manual Deploy"
- Or push a new commit to trigger redeploy

### Monitor Performance
- Check "Metrics" tab in Render dashboard
- Monitor CPU, memory, and response times
- Set up alerts for downtime

## 💰 Render Pricing

### Free Tier
- **750 hours/month** of usage
- **Automatic sleep** after 15 minutes of inactivity
- **Cold starts** when waking up
- Perfect for development and testing

### Paid Plans
- **Starter ($7/month)**: Always-on, no sleep
- **Standard ($25/month)**: More resources, faster builds
- **Pro ($85/month)**: High performance, priority support

## 🔒 Security Best Practices

### Environment Variables
- Never commit sensitive data to Git
- Use Render's environment variable encryption
- Rotate API keys regularly
- Use different keys for different environments

### Network Security
- Configure CORS properly
- Use HTTPS only (Render provides SSL automatically)
- Implement rate limiting
- Monitor for suspicious activity

## 📈 Performance Optimization

### Application Optimization
- Use connection pooling for database
- Implement caching for frequent queries
- Optimize dependencies (production only)
- Use compression middleware

### Render Configuration
- Choose appropriate plan for your needs
- Select region closest to your users
- Monitor resource usage and upgrade if needed

## 🎯 Success Checklist

- [ ] Render account created and GitHub connected
- [ ] Web service configured with correct settings
- [ ] All environment variables set correctly
- [ ] Build completes successfully
- [ ] Health check endpoint returns 200
- [ ] API endpoints respond correctly
- [ ] Frontend can connect to backend
- [ ] Document upload works
- [ ] AI processing functions
- [ ] Database operations work
- [ ] Auto-deploy works on Git push

## 📞 Support Resources

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)
- [Render Support](https://render.com/support)

### Useful Render Features
- **Custom Domains**: Add your own domain
- **SSL Certificates**: Automatic HTTPS
- **Environment Groups**: Share variables across services
- **Preview Deployments**: Test branches before merging
- **Rollbacks**: Quickly revert to previous deployments

## 🔄 Advanced Configuration

### Custom Domain Setup
1. Go to service settings in Render
2. Add custom domain
3. Configure DNS records
4. SSL certificate is automatically provisioned

### Database Integration
If using Render PostgreSQL:
```bash
# Render provides DATABASE_URL automatically
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Redis Integration
For caching with Render Redis:
```bash
# Add Redis service and connect
REDIS_URL=redis://user:pass@host:port
```

## 🚀 Deployment Automation

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
    paths: ['backend-api/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render Deploy
        run: |
          curl -X POST "https://api.render.com/deploy/srv-YOUR_SERVICE_ID" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

This guide ensures a smooth deployment of your KMRL Backend API to Render! 🎨