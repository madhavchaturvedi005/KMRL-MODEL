# 🚨 Deployment Troubleshooting Guide

Common deployment issues and their solutions for the KMRL Document Intelligence System.

## 🚨 **Application Startup Issues**

### **"Application exited early"**

**Problem**: Node.js application crashes during startup

**Solution**: See detailed guide: [**Startup Troubleshooting**](STARTUP-TROUBLESHOOTING.md)

**Quick fixes**:
```bash
# 1. Try minimal server
cd backend-api
npm run start:minimal

# 2. Run debug script
node debug-startup.js

# 3. Check logs in Render dashboard
```

## 📦 **Package Installation Issues**

### **Sharp Installation Error (Exit Code 127)**

**Problem**: `error: install script from "sharp" exited with 127`

**Cause**: Sharp is an image processing library with native dependencies that can fail to compile on deployment platforms.

**Solution**: Sharp has been removed from dependencies as it's not needed for document processing.

```bash
# If you still see this error, ensure Sharp is not in package.json
# Check backend-api/package.json and remove any Sharp references
```

**Prevention**: 
- Only include necessary dependencies
- Avoid native modules unless absolutely required
- Use platform-specific alternatives when possible

### **Node.js Version Mismatch**

**Problem**: `The engine "node" is incompatible with this module`

**Solution**:
```bash
# Ensure you're using Node.js 18 or higher
node --version

# Update Node.js if needed
# On macOS with Homebrew:
brew install node@18

# On Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **NPM Cache Issues**

**Problem**: `npm ERR! Unexpected end of JSON input`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

## 🌐 **Render Deployment Issues**

### **Build Fails on Render**

**Problem**: Build process fails during deployment

**Solutions**:

1. **Check Build Command**:
   ```bash
   # Ensure build command is correct in Render dashboard:
   Build Command: npm ci --only=production
   Start Command: npm start
   ```

2. **Environment Variables**:
   ```bash
   # Verify all required environment variables are set:
   NODE_ENV=production
   SUPABASE_URL=your-url
   SUPABASE_ANON_KEY=your-key
   GOOGLE_AI_API_KEY=your-key
   JWT_SECRET=your-secret
   ```

3. **Node.js Version**:
   ```bash
   # Add to package.json engines field:
   "engines": {
     "node": ">=18.0.0"
   }
   ```

### **Service Won't Start**

**Problem**: Build succeeds but service fails to start

**Solutions**:

1. **Check Port Configuration**:
   ```javascript
   // In server.js, ensure port is configured correctly:
   const PORT = process.env.PORT || 3001;
   ```

2. **Check Start Command**:
   ```bash
   # Ensure start command in package.json is correct:
   "scripts": {
     "start": "node src/server.js"
   }
   ```

3. **Check Logs**:
   - Go to Render dashboard
   - Click on your service
   - Check "Logs" tab for error messages

### **Health Check Fails**

**Problem**: Render shows service as unhealthy

**Solutions**:

1. **Verify Health Endpoint**:
   ```bash
   # Test health endpoint locally:
   curl http://localhost:3001/health
   ```

2. **Check Health Check Path**:
   ```bash
   # In Render dashboard, ensure health check path is:
   Health Check Path: /health
   ```

3. **Increase Timeout**:
   ```bash
   # In Render dashboard, increase health check timeout:
   Health Check Timeout: 30 seconds
   ```

## 🔐 **Environment Variable Issues**

### **Missing Environment Variables**

**Problem**: `Configuration error: Missing required environment variable`

**Solution**:
```bash
# Check all required variables are set in Render dashboard:
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
GOOGLE_AI_API_KEY=AIza...
JWT_SECRET=your-64-char-secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### **Invalid JWT Secret**

**Problem**: `JWT secret must be at least 32 characters`

**Solution**:
```bash
# Generate a proper JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use the generator script:
node generate-jwt-secret.js
```

### **CORS Issues**

**Problem**: `Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy`

**Solution**:
```bash
# Ensure FRONTEND_URL is set correctly in backend:
FRONTEND_URL=https://your-exact-frontend-url.vercel.app

# No trailing slash, exact match required
```

## 🗄️ **Database Connection Issues**

### **Supabase Connection Failed**

**Problem**: `Failed to connect to Supabase`

**Solutions**:

1. **Check Supabase URL**:
   ```bash
   # Ensure URL format is correct:
   SUPABASE_URL=https://your-project-id.supabase.co
   ```

2. **Verify API Keys**:
   ```bash
   # Test connection with curl:
   curl -H "apikey: your-anon-key" \
        "https://your-project.supabase.co/rest/v1/"
   ```

3. **Check RLS Policies**:
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT * FROM documents LIMIT 1;
   ```

### **Vector Extension Missing**

**Problem**: `extension "vector" does not exist`

**Solution**:
```sql
-- Run in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;
```

## 🤖 **Google AI Issues**

### **Invalid API Key**

**Problem**: `API key not valid`

**Solutions**:

1. **Verify API Key**:
   ```bash
   # Test API key with curl:
   curl -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY"
   ```

2. **Check API Key Format**:
   ```bash
   # Google AI API keys start with "AIza"
   GOOGLE_AI_API_KEY=AIzaSyC...
   ```

3. **Enable Required APIs**:
   - Go to Google AI Studio
   - Ensure Gemini API is enabled
   - Check quota limits

### **Quota Exceeded**

**Problem**: `Quota exceeded for quota metric 'Generate Content API requests'`

**Solutions**:
- Check usage in Google AI Studio
- Upgrade to paid plan if needed
- Implement request caching
- Add rate limiting

## 🔧 **General Debugging Steps**

### **1. Check Logs**
```bash
# Render: Check logs in dashboard
# Local: Check console output
# Supabase: Check database logs
```

### **2. Test Components Individually**
```bash
# Test backend health:
curl https://your-backend.onrender.com/health

# Test database connection:
curl -H "apikey: your-key" "https://your-project.supabase.co/rest/v1/"

# Test Google AI:
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY"
```

### **3. Verify Configuration**
```bash
# Check all environment variables
# Verify API keys are valid
# Ensure URLs are correct
# Check service status
```

### **4. Common Commands**
```bash
# Restart Render service:
# Go to dashboard > Manual Deploy

# Clear npm cache:
npm cache clean --force

# Reinstall dependencies:
rm -rf node_modules package-lock.json && npm install

# Test locally:
cd backend-api && npm run dev
```

## 📞 **Getting Help**

### **Render Support**
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### **Service-Specific Support**
- **Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **Google AI**: [ai.google.dev](https://ai.google.dev)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

### **Debug Checklist**
- [ ] All environment variables set correctly
- [ ] API keys are valid and have proper permissions
- [ ] Database schema is up to date
- [ ] Health endpoints return 200
- [ ] CORS is configured properly
- [ ] No console errors in browser
- [ ] Backend logs show no errors
- [ ] All services are running

## 🔄 **Recovery Steps**

If deployment is completely broken:

1. **Rollback to Previous Version**:
   - Use Render's rollback feature
   - Or redeploy from a known good commit

2. **Fresh Deployment**:
   ```bash
   # Create new Render service
   # Set all environment variables fresh
   # Deploy from clean state
   ```

3. **Local Testing**:
   ```bash
   # Test everything locally first
   cd backend-api
   npm install
   npm run dev
   
   # Test frontend
   npm run dev
   ```

This troubleshooting guide should help resolve most deployment issues! 🚀