# 🚀 Render Deployment Fix Guide

## 🚨 **Common Render Deployment Issues & Solutions**

### **Issue 1: Port Configuration**
**Problem**: App crashes because it's not listening on the correct port.

**Solution**: ✅ **FIXED**
- Render uses `PORT` environment variable (usually 10000)
- Server now uses `process.env.PORT || 3001`
- Updated render.yaml to set `PORT=10000`

### **Issue 2: Frontend URL CORS**
**Problem**: CORS errors when frontend tries to connect.

**Solution**: ✅ **FIXED**
- Updated CORS to accept multiple origins
- Added development localhost patterns
- Set `FRONTEND_URL` environment variable in Render

### **Issue 3: Environment Variables**
**Problem**: Missing or incorrect environment variables.

**Solution**: ✅ **CONFIGURED**
- Created `.env.production` template
- Updated render.yaml with all required variables
- Added production-specific scripts

---

## 📋 **Render Environment Variables Setup**

### **Required Variables** (Set in Render Dashboard)

```bash
# Core Configuration
NODE_ENV=production
PORT=10000

# Frontend (Update with your actual frontend URL)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# JWT (Let Render auto-generate or use your own)
JWT_SECRET=your-jwt-secret-here

# Optional Configuration
MAX_FILE_SIZE=52428800
SUPPORTED_FORMATS=pdf,doc,docx,txt,csv,xlsx
LOG_LEVEL=info
```

---

## 🔧 **Step-by-Step Render Setup**

### **1. Create New Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository with your backend code

### **2. Configure Service Settings**
```yaml
Name: kmrl-backend-api
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend-api
Build Command: npm run render:build
Start Command: npm run render:start
```

### **3. Add Environment Variables**
Copy all the variables from the list above into Render's environment variables section.

### **4. Advanced Settings**
```yaml
Health Check Path: /health
Auto-Deploy: Yes (deploys on git push)
```

---

## 🚨 **Troubleshooting Deployment Failures**

### **Build Failures**

**Error**: `npm ci failed`
**Solution**:
```bash
# Check package.json is in backend-api directory
# Ensure all dependencies are in package.json
# Check Node.js version compatibility
```

**Error**: `Module not found`
**Solution**:
```bash
# Ensure all imports use .js extensions
# Check file paths are correct
# Verify all dependencies are installed
```

### **Runtime Failures**

**Error**: `Application failed to respond to health check`
**Solution**:
1. Check `/health` endpoint exists and responds
2. Verify server is listening on `0.0.0.0:${PORT}`
3. Check environment variables are set correctly

**Error**: `Port already in use`
**Solution**:
```bash
# Use process.env.PORT (Render sets this automatically)
# Don't hardcode port numbers
```

**Error**: `CORS errors`
**Solution**:
```bash
# Set FRONTEND_URL environment variable
# Update CORS origins in server.js
# Check frontend is using correct backend URL
```

---

## 🔍 **Debugging Commands**

### **Check Render Logs**
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Look for error messages during startup

### **Test Health Endpoint**
```bash
# Once deployed, test the health endpoint
curl https://your-service-name.onrender.com/health
```

### **Local Testing with Production Config**
```bash
cd backend-api
NODE_ENV=production PORT=10000 npm start
```

---

## ✅ **Deployment Checklist**

### **Before Deployment**
- [ ] All environment variables copied to Render
- [ ] Frontend URL updated in FRONTEND_URL variable
- [ ] Health check endpoint working locally
- [ ] All dependencies in package.json
- [ ] No hardcoded localhost URLs

### **After Deployment**
- [ ] Service shows "Live" status in Render
- [ ] Health endpoint responds: `https://your-service.onrender.com/health`
- [ ] Logs show successful startup messages
- [ ] Frontend can connect to backend
- [ ] API endpoints working correctly

---

## 🎯 **Expected Success Indicators**

### **Successful Deployment Logs**
```
==> Build successful 🎉
==> Deploying...
==> Starting service with 'npm run render:start'
🚀 KMRL Document Intelligence Backend running on port 10000
📊 Environment: production
🔗 Health check: http://localhost:10000/health
🤖 Google AI: ✅ Configured
🗄️ Supabase: ✅ Configured
==> Your service is live at https://your-service.onrender.com
```

### **Health Check Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-22T12:00:00.000Z",
  "uptime": 30.5,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "supabase": "configured",
    "googleAI": "configured"
  }
}
```

---

## 🚀 **Quick Fix Commands**

If deployment is still failing, try these:

### **1. Use Minimal Server for Testing**
Update render.yaml temporarily:
```yaml
startCommand: npm run start:minimal
```

### **2. Check Environment Variables**
```bash
# In Render dashboard, verify all variables are set
# No empty values
# No extra spaces or quotes
```

### **3. Force Redeploy**
```bash
git commit --allow-empty -m "Force redeploy"
git push origin main
```

---

## 📞 **Still Having Issues?**

1. **Check Render Status**: https://status.render.com
2. **Review Logs**: Look for specific error messages
3. **Test Locally**: Ensure it works with production config
4. **Environment Variables**: Double-check all are set correctly

The backend should now deploy successfully on Render! 🎉
