# 🚨 Application Startup Troubleshooting

Guide for fixing "Application exited early" and other startup errors.

## 🔍 **Common Startup Errors**

### **"Application exited early"**

This error means the Node.js application crashed during startup before it could start listening on a port.

## 🛠️ **Debugging Steps**

### **Step 1: Use the Debug Script**

```bash
cd backend-api
node debug-startup.js
```

This will test:
- Node.js version
- Environment variables
- Dependencies
- File structure
- Module imports

### **Step 2: Try Minimal Server**

```bash
cd backend-api
npm run start:minimal
```

If the minimal server works, the issue is in one of the full server's dependencies or routes.

### **Step 3: Check Logs**

**On Render:**
1. Go to your service dashboard
2. Click "Logs" tab
3. Look for error messages before "Application exited early"

**Locally:**
```bash
cd backend-api
npm run dev
```

## 🚨 **Common Causes & Solutions**

### **1. Missing Dependencies**

**Symptoms:**
```
Error: Cannot find module 'winston'
Error: Cannot find module '@supabase/supabase-js'
```

**Solution:**
```bash
cd backend-api
rm -rf node_modules package-lock.json
npm install
```

**For Render:**
- Ensure `package.json` is in the `backend-api` directory
- Check build command: `npm ci --only=production`

### **2. Import/Export Errors**

**Symptoms:**
```
SyntaxError: Cannot use import statement outside a module
ReferenceError: require is not defined
```

**Solution:**
Ensure `package.json` has:
```json
{
  "type": "module"
}
```

### **3. Missing Environment Variables**

**Symptoms:**
```
TypeError: Cannot read property 'SUPABASE_URL' of undefined
Application crashes silently
```

**Solution:**
Check all required environment variables are set:
```bash
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
GOOGLE_AI_API_KEY=your-key
JWT_SECRET=your-secret
```

### **4. Port Already in Use**

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

### **5. File Permission Issues**

**Symptoms:**
```
Error: EACCES: permission denied
Error: ENOENT: no such file or directory
```

**Solution:**
```bash
# Check file permissions
ls -la backend-api/src/

# Fix permissions if needed
chmod +x backend-api/src/server.js
```

### **6. Winston Logger Issues**

**Symptoms:**
```
Error: ENOENT: no such file or directory, open 'logs/error.log'
```

**Solution:**
✅ **FIXED**: Logger now automatically creates logs directory or falls back to console-only logging.

### **7. PDF-Parse Library Issues**

**Symptoms:**
```
Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
```

**Solution:**
✅ **FIXED**: PDF parsing now uses dynamic imports to avoid startup issues.

### **8. Missing OpenAI Service**

**Symptoms:**
```
Error: Cannot find module 'openai.js'
```

**Solution:**
✅ **FIXED**: Search routes now use Google AI service instead of OpenAI.

### **9. Missing Qdrant Client**

**Symptoms:**
```
Error: Cannot find package '@qdrant/js-client-rest'
```

**Solution:**
✅ **FIXED**: Qdrant service now uses mock implementation when client library is not available.

### **10. Circular Dependencies**

**Symptoms:**
```
ReferenceError: Cannot access 'X' before initialization
```

**Solution:**
- Check for circular imports in your modules
- Restructure imports to avoid circular dependencies

## 🔧 **Quick Fixes**

### **Fix 1: Use Minimal Server**

Update Render start command to:
```bash
Start Command: npm run start:minimal
```

This starts a minimal server without all the routes and middleware, useful for debugging.

### **Fix 2: Add Error Handling**

✅ **IMPLEMENTED**: Server now has comprehensive error handling:
```javascript
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

### **Fix 3: Safe Logger Initialization**

✅ **IMPLEMENTED**: Logger now handles missing logs directory gracefully:
```javascript
const ensureLogsDirectory = () => {
  const logsDir = 'logs';
  if (!existsSync(logsDir)) {
    try {
      mkdirSync(logsDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create logs directory:', error.message);
      return false;
    }
  }
  return true;
};
```

## 📊 **Diagnostic Commands**

### **Check Node.js Version**
```bash
node --version
# Should be >= 18.0.0
```

### **Check Dependencies**
```bash
cd backend-api
npm list
```

### **Test Import**
```bash
node -e "import('express').then(() => console.log('Express OK'))"
```

### **Check Environment**
```bash
cd backend-api
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

## 🎯 **Step-by-Step Recovery**

### **1. Start Fresh**
```bash
cd backend-api

# Clean everything
rm -rf node_modules package-lock.json logs

# Reinstall
npm install

# Create logs directory
mkdir -p logs

# Test locally
npm run dev
```

### **2. Test Minimal Server**
```bash
# Start minimal server
npm run start:minimal

# In another terminal, test health endpoint
curl http://localhost:3001/health
```

### **3. Test Full Server**
```bash
# Start full server
npm start

# Test health endpoint
curl http://localhost:3001/health
```

### **4. Deploy to Render**

Once everything works locally:
```bash
git add .
git commit -m "Fix startup issues"
git push origin main

# Render will auto-deploy
```

## 🔍 **Render-Specific Debugging**

### **Check Build Logs**
1. Go to Render dashboard
2. Click on your service
3. Check "Events" tab for build logs
4. Look for errors during `npm ci`

### **Check Runtime Logs**
1. Go to "Logs" tab
2. Look for the last message before crash
3. Common patterns:
   - `Error: Cannot find module` → Missing dependency
   - `SyntaxError` → Code syntax error
   - `TypeError` → Missing environment variable
   - Silent crash → Uncaught exception

### **Test Environment Variables**
Add this to your server.js temporarily:
```javascript
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'missing');
```

## 💡 **Prevention Tips**

### **1. Always Test Locally First**
```bash
cd backend-api
npm run dev
# Should start without errors
```

### **2. Use Environment Variable Validation**
✅ **IMPLEMENTED**: Server now validates critical environment variables on startup.

### **3. Add Startup Logging**
✅ **IMPLEMENTED**: Server now logs startup progress and configuration status.

### **4. Use Health Checks**
✅ **IMPLEMENTED**: `/health` endpoint provides comprehensive service status.

## 📞 **Getting Help**

If you're still stuck:

1. **Check the debug script output**:
   ```bash
   node backend-api/debug-startup.js
   ```

2. **Share the error logs** from Render dashboard

3. **Test minimal server**:
   ```bash
   npm run start:minimal
   ```

4. **Check these files exist**:
   - `backend-api/package.json`
   - `backend-api/src/server.js`
   - `backend-api/src/utils/logger.js`
   - `backend-api/.env` (locally)

## ✅ **Recent Fixes Applied**

- **Logger**: Now creates logs directory automatically or falls back to console
- **PDF Parser**: Uses dynamic imports to avoid startup crashes
- **Search Routes**: Fixed to use Google AI instead of missing OpenAI service
- **Qdrant Service**: Mock implementation when client library unavailable
- **Error Handling**: Comprehensive uncaught exception and rejection handlers
- **Debug Script**: Fixed ES module syntax issues

This guide should help you identify and fix most startup issues! 🚀