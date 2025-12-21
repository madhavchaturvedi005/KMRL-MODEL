# 📚 KMRL Document Intelligence - Documentation

This folder contains all documentation and SQL scripts for the KMRL Document Intelligence System.

## 📁 Folder Structure

### 📖 `/guides` - Documentation & Guides
- **[DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md)** - Complete production deployment guide
- **[RENDER-DEPLOYMENT.md](guides/RENDER-DEPLOYMENT.md)** - Render deployment (recommended)
- **[RAILWAY-DEPLOYMENT.md](guides/RAILWAY-DEPLOYMENT.md)** - Railway deployment (alternative)
- **[PHASE1-SETUP-GUIDE.md](guides/PHASE1-SETUP-GUIDE.md)** - Initial setup instructions
- **[SUPABASE_SETUP.md](guides/SUPABASE_SETUP.md)** - Database configuration guide
- **[backend-api-architecture.md](guides/backend-api-architecture.md)** - Backend architecture overview
- **[langchain-document-processor.md](guides/langchain-document-processor.md)** - LangChain implementation details
- **[n8n-setup-instructions.md](guides/n8n-setup-instructions.md)** - Legacy n8n setup (deprecated)
- **[hashed-password-setup.md](guides/hashed-password-setup.md)** - Password hashing configuration
- **[create-auth-users-instructions.md](guides/create-auth-users-instructions.md)** - User creation guide

### 🗄️ `/sql` - Database Scripts
#### Core Schema
- **[supabase-enhanced-schema.sql](sql/supabase-enhanced-schema.sql)** - Main database schema with vector support
- **[supabase-phase1-setup.sql](sql/supabase-phase1-setup.sql)** - Phase 1 database setup
- **[supabase-schema.sql](sql/supabase-schema.sql)** - Basic schema (legacy)

#### Authentication & Users
- **[setup-auth-users.sql](sql/setup-auth-users.sql)** - Authentication setup
- **[create-admin-user.sql](sql/create-admin-user.sql)** - Admin user creation
- **[create-password-verification-function.sql](sql/create-password-verification-function.sql)** - Password verification
- **[insert-test-employee.sql](sql/insert-test-employee.sql)** - Test user insertion
- **[add-your-employee.sql](sql/add-your-employee.sql)** - Employee addition script

#### Companies & Employees
- **[create-companies-table.sql](sql/create-companies-table.sql)** - Companies table
- **[create-employees-table.sql](sql/create-employees-table.sql)** - Employees table
- **[fix-employees-table.sql](sql/fix-employees-table.sql)** - Employee table fixes
- **[fix-company-uuids.sql](sql/fix-company-uuids.sql)** - Company UUID fixes

#### Storage & Policies
- **[setup-supabase-storage.sql](sql/setup-supabase-storage.sql)** - Storage bucket setup
- **[simple-storage-setup.sql](sql/simple-storage-setup.sql)** - Basic storage configuration
- **[update-storage-policies.sql](sql/update-storage-policies.sql)** - Storage policy updates
- **[fix-rls-policies.sql](sql/fix-rls-policies.sql)** - Row Level Security fixes

#### Registration & Testing
- **[create-registration-table.sql](sql/create-registration-table.sql)** - Registration table
- **[check-registration-table.sql](sql/check-registration-table.sql)** - Registration verification
- **[fix-login-issues.sql](sql/fix-login-issues.sql)** - Login troubleshooting

## 🚀 Quick Start

### 1. Database Setup
```bash
# Run these scripts in Supabase SQL Editor in order:
1. supabase-enhanced-schema.sql
2. setup-auth-users.sql
3. fix-rls-policies.sql
4. setup-supabase-storage.sql
```

### 2. Test User Setup
```bash
# Create test users:
1. create-admin-user.sql
2. insert-test-employee.sql
```

### 3. Deployment
```bash
# Follow the deployment guide:
guides/DEPLOYMENT-GUIDE.md

# For Render (recommended):
guides/RENDER-DEPLOYMENT.md

# For Railway (alternative):
guides/RAILWAY-DEPLOYMENT.md
```

## 📋 Setup Checklist

### Database Setup
- [ ] Run enhanced schema
- [ ] Enable pgvector extension
- [ ] Set up authentication
- [ ] Configure RLS policies
- [ ] Create storage buckets
- [ ] Add test users

### Backend Setup
- [ ] Deploy to Render (recommended) or Railway
- [ ] Configure environment variables
- [ ] Set up Google AI API key
- [ ] Test health endpoints
- [ ] Verify document processing

### Frontend Setup
- [ ] Deploy to Vercel
- [ ] Configure backend API URL
- [ ] Test authentication
- [ ] Verify document upload
- [ ] Test AI Q&A functionality

## 🔧 Troubleshooting

### Common Issues
1. **RLS Policy Errors** → Run `fix-rls-policies.sql`
2. **Storage Issues** → Check `setup-supabase-storage.sql`
3. **Login Problems** → Run `fix-login-issues.sql`
4. **Employee Table Issues** → Run `fix-employees-table.sql`

### Debug Scripts
- Use `check-registration-table.sql` to verify user setup
- Use `test-storage.js` and `test-supabase-connection.js` in root for connectivity tests

## 📞 Support

For detailed setup instructions, refer to:
- [DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md) for production deployment
- [RENDER-DEPLOYMENT.md](guides/RENDER-DEPLOYMENT.md) for Render deployment
- [RAILWAY-DEPLOYMENT.md](guides/RAILWAY-DEPLOYMENT.md) for Railway deployment
- [PHASE1-SETUP-GUIDE.md](guides/PHASE1-SETUP-GUIDE.md) for development setup
- [SUPABASE_SETUP.md](guides/SUPABASE_SETUP.md) for database configuration

## 🔄 Migration Notes

### From n8n to LangChain
The system has been migrated from n8n workflows to a direct LangChain + Google AI backend:
- **Old**: n8n workflows with OpenAI
- **New**: Express.js backend with LangChain + Google AI
- **Benefits**: 50% cost reduction, better integration, real-time processing

### Deployment Platform Options
- **Render** (Recommended): Simple, reliable, great free tier
- **Railway** (Alternative): Good for complex deployments, can be tricky
- **Others**: Heroku, DigitalOcean, AWS, etc.

Legacy n8n documentation is kept in `guides/n8n-setup-instructions.md` for reference.