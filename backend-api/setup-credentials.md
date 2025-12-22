# 🔑 Backend API Credentials Setup

Your backend is starting but missing some credentials. Here's how to get them:

## 🚨 **Current Status**

✅ **Server starts successfully**  
❌ **Supabase Service Role Key** - Invalid/incomplete  
❌ **Google AI API Key** - Missing  

## 📋 **Required Credentials**

### 1. **Supabase Service Role Key**

**Current Issue**: The service role key in `.env` is incomplete/invalid.

**How to get it**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jleufzctebtcpdqlzckf`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (not anon key)
5. Replace the `SUPABASE_SERVICE_ROLE_KEY` in `backend-api/.env`

**Current value** (invalid):
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZXVmemN0ZWJ0Y3BkcWx6Y2tmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMwNDY0OCwiZXhwIjoyMDc0ODgwNjQ4fQ.placeholder-service-role-key-needs-to-be-replaced
```

**Should look like**:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZXVmemN0ZWJ0Y3BkcWx6Y2tmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMwNDY0OCwiZXhwIjoyMDc0ODgwNjQ4fQ.ACTUAL_SIGNATURE_HERE
```

### 2. **Google AI API Key**

**Current Issue**: No API key provided.

**How to get it**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key
5. Add it to `backend-api/.env`:

```
GOOGLE_AI_API_KEY=AIzaSyYourActualAPIKeyHere
```

**Free Tier**: Google AI has a generous free tier for development.

## 🔧 **Quick Fix Commands**

### **Test Current Setup**
```bash
cd backend-api
npm start
# Should start but show missing credentials warnings
```

### **Test Health Endpoint**
```bash
curl http://localhost:3001/health
# Should return status with service availability
```

### **After Adding Credentials**
```bash
cd backend-api
npm start
# Should show all services as configured
```

## 🎯 **Expected Output After Fix**

When both credentials are properly configured, you should see:

```
info: Supabase service initialized
info: 🚀 KMRL Document Intelligence Backend running on port 3001
info: 📊 Environment: development
info: 🔗 Health check: http://localhost:3001/health
info: 🤖 Google AI: ✅ Configured
info: 🗄️ Supabase: ✅ Configured
```

## 🚀 **For Render Deployment**

Once you have the credentials working locally:

1. **Add to Render Environment Variables**:
   - Go to your Render service dashboard
   - Add the same environment variables
   - Deploy

2. **Environment Variables for Render**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   GOOGLE_AI_API_KEY=your-actual-google-ai-key
   ```

## 🔍 **Troubleshooting**

### **Supabase Connection Test**
```bash
# Test if Supabase credentials work
curl -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
```

### **Google AI Test**
```bash
# Test if Google AI key works
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

## 📝 **Next Steps**

1. ✅ Get Supabase service role key
2. ✅ Get Google AI API key  
3. ✅ Update `backend-api/.env`
4. ✅ Test locally: `npm start`
5. ✅ Deploy to Render with environment variables

The backend architecture is working - you just need the actual API credentials! 🎉
