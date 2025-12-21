# 📁 KMRL Document Intelligence - Project Structure

## 🏗️ Root Directory Structure

```
intelligence-model-sih-25/
├── 📁 backend-api/              # Backend API (LangChain + Google AI)
│   ├── src/                     # Source code
│   ├── Dockerfile              # Docker configuration
│   ├── railway.json            # Railway deployment config
│   └── README.md               # Backend documentation
├── 📁 docs/                    # Documentation & SQL scripts
│   ├── guides/                 # Setup guides & documentation
│   ├── sql/                    # Database scripts
│   └── README.md               # Documentation index
├── 📁 src/                     # Frontend source code
│   ├── components/             # React components
│   ├── pages/                  # Page components
│   ├── services/               # API services
│   └── ...
├── 📁 n8n-workflows/           # Legacy n8n workflows (deprecated)
├── 📁 public/                  # Static assets
├── .env                        # Environment variables
├── package.json                # Frontend dependencies
└── README.md                   # Main project documentation
```

## 🔧 Backend API Structure

```
backend-api/
├── src/
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── routes/                # API endpoints
│   │   ├── ai.js              # AI processing routes
│   │   ├── chat.js            # RAG Q&A routes
│   │   ├── documents.js       # Document management
│   │   ├── search.js          # Search functionality
│   │   └── upload.js          # File upload routes
│   ├── services/              # Business logic
│   │   ├── documentProcessor.js # LangChain processing
│   │   ├── googleAI.js        # Google AI integration
│   │   ├── supabase.js        # Database operations
│   │   └── qdrant.js          # Vector database (optional)
│   ├── utils/                 # Utilities
│   │   └── logger.js          # Winston logging
│   └── server.js              # Main server file
├── .env                       # Backend environment variables
├── Dockerfile                 # Docker configuration
├── package.json               # Backend dependencies
├── railway.json               # Railway deployment
├── start.sh                   # Startup script
└── test-backend.js            # API testing utility
```

## 🎨 Frontend Structure

```
src/
├── components/                # React components
│   ├── ui/                   # Shadcn/ui components
│   ├── Dashboard.tsx         # Main dashboard
│   ├── DocumentCard.tsx      # Document display
│   ├── DocumentTestPanel.tsx # Testing panel
│   └── ...
├── pages/                    # Page components
│   ├── Index.tsx            # Home page
│   ├── Login.tsx            # Authentication
│   └── ...
├── services/                 # API services
│   ├── authService.ts       # Authentication
│   ├── backendApiService.ts # Backend API client
│   ├── enhancedDocumentService.ts # Document operations
│   └── langchain/           # LangChain integration
├── contexts/                # React contexts
│   └── LanguageContext.tsx  # Internationalization
├── lib/                     # Utilities
│   └── supabase.ts          # Supabase client
└── types/                   # TypeScript definitions
```

## 📚 Documentation Structure

```
docs/
├── guides/                   # Setup & deployment guides
│   ├── DEPLOYMENT-GUIDE.md   # Production deployment
│   ├── PHASE1-SETUP-GUIDE.md # Development setup
│   ├── SUPABASE_SETUP.md     # Database configuration
│   ├── backend-api-architecture.md # Backend overview
│   ├── langchain-document-processor.md # LangChain details
│   ├── n8n-setup-instructions.md # Legacy n8n (deprecated)
│   ├── hashed-password-setup.md # Password configuration
│   └── create-auth-users-instructions.md # User setup
├── sql/                      # Database scripts
│   ├── supabase-enhanced-schema.sql # Main schema
│   ├── setup-auth-users.sql  # Authentication
│   ├── fix-rls-policies.sql  # Security policies
│   ├── setup-supabase-storage.sql # Storage setup
│   └── ... (other SQL scripts)
└── README.md                 # Documentation index
```

## 🔄 Data Flow

```
User Upload → Frontend → Backend API → LangChain → Google AI
                ↓              ↓           ↓
            Supabase ← Document Processing ← Embeddings
                ↓
            Vector Store (pgvector)
                ↓
            RAG Q&A System
```

## 🚀 Deployment Architecture

```
Production Environment:
├── Frontend (Vercel)         # React app hosting
├── Backend (Railway)         # API server hosting
├── Database (Supabase)       # PostgreSQL + pgvector
├── Storage (Supabase)        # File storage
└── AI (Google AI Studio)     # AI processing
```

## 📦 Key Dependencies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Supabase** - Database client

### Backend
- **Express.js** - Web framework
- **LangChain** - Document processing
- **Google AI** - AI processing
- **Supabase** - Database & storage
- **Winston** - Logging
- **Multer** - File uploads

## 🔧 Configuration Files

### Environment Files
- `.env` - Frontend environment variables
- `backend-api/.env` - Backend environment variables
- `.env.example` - Environment template

### Build & Deploy
- `package.json` - Frontend dependencies & scripts
- `backend-api/package.json` - Backend dependencies
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration

### Docker & Deployment
- `backend-api/Dockerfile` - Backend container
- `backend-api/railway.json` - Railway deployment
- `backend-api/start.sh` - Startup script

## 🧪 Testing Files

- `backend-api/test-backend.js` - Backend API testing
- `test-storage.js` - Storage connectivity test
- `test-supabase-connection.js` - Database connectivity test

## 📝 Documentation Files

- `README.md` - Main project documentation
- `PROJECT-STRUCTURE.md` - This file
- `docs/README.md` - Documentation index
- `backend-api/README.md` - Backend API documentation

## 🔄 Legacy Files (Deprecated)

- `n8n-workflows/` - Old n8n workflow files
- `docs/guides/n8n-setup-instructions.md` - n8n setup guide

These files are kept for reference but are no longer used in the current LangChain-based architecture.

---

This structure provides a clear separation of concerns with:
- **Frontend** for user interface
- **Backend API** for business logic and AI processing
- **Documentation** for setup and maintenance
- **Database scripts** for schema management
- **Configuration** for deployment and environment setup