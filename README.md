# 🧠 KMRL Document Intelligence System

A powerful AI-driven document management and analysis system built with **LangChain**, **Google AI**, and **Supabase**. Upload documents, get AI-powered insights, and ask questions using advanced RAG (Retrieval-Augmented Generation) technology.

## 🌟 Features

### 📄 Document Management
- **Multi-format Support**: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- **Intelligent Upload**: Drag & drop with real-time processing feedback
- **Batch Processing**: Upload and process multiple documents simultaneously
- **Smart Organization**: Auto-categorization and tagging

### 🤖 AI-Powered Analysis
- **Document Summarization**: AI-generated summaries and key points
- **Entity Extraction**: Automatic identification of people, places, organizations
- **Content Classification**: Smart document type detection
- **Sentiment Analysis**: Understand document tone and sentiment

### 💬 Intelligent Q&A (RAG)
- **Ask Questions**: Natural language queries about your documents
- **Contextual Answers**: AI responses with source citations
- **Chat History**: Track all conversations with documents
- **Multi-document Search**: Find information across your entire library

### 🔍 Advanced Search
- **Semantic Search**: Find documents by meaning, not just keywords
- **Vector Similarity**: AI-powered document recommendations
- **Full-text Search**: Traditional keyword-based search
- **Filter & Sort**: By type, date, priority, processing status

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Google AI     │
│   (React +      │◄──►│   (LangChain +  │◄──►│   (Gemini +     │
│    Vite)        │    │    Express)     │    │   Embeddings)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │              ┌─────────────────┐              
         └─────────────►│   Supabase      │              
                        │   (Database +   │              
                        │   Storage +     │              
                        │   Vector Store) │              
                        └─────────────────┘              
```

### 🔧 Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn/ui components
- Supabase client

**Backend:**
- Node.js with Express
- LangChain for document processing
- Google Generative AI (Gemini)
- Supabase for data & storage
- Winston for logging

**AI & Data:**
- Google AI (50% cheaper than OpenAI)
- Supabase pgvector for embeddings
- Real-time processing updates
- Advanced RAG implementation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google AI API key

### 1. Clone Repository
```bash
git clone https://github.com/madhavchaturvedi005/intelligence-model-sih-25.git
cd intelligence-model-sih-25
```

### 2. Setup Frontend
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### 3. Setup Backend
```bash
cd backend-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start backend server
./start.sh
# Or: npm run dev
```

### 4. Setup Database
```bash
# Run in Supabase SQL Editor
# Execute: supabase-enhanced-schema.sql
```

### 5. Test the System
```bash
# Test backend
cd backend-api
node test-backend.js

# Open frontend
# Visit: http://localhost:5173
# Login: admin@kmrl.com / admin123
```

## 📚 Documentation

### 📖 Guides
- [**📚 Documentation Index**](docs/README.md) - Complete documentation overview
- [**Deployment Guide**](docs/guides/DEPLOYMENT-GUIDE.md) - Complete production setup
- [**Backend API Documentation**](backend-api/README.md) - API reference
- [**Phase 1 Setup**](docs/guides/PHASE1-SETUP-GUIDE.md) - Initial configuration
- [**Supabase Setup**](docs/guides/SUPABASE_SETUP.md) - Database configuration

### 🔧 Configuration Files
- [**Enhanced Schema**](docs/sql/supabase-enhanced-schema.sql) - Database structure
- [**RLS Policies**](docs/sql/fix-rls-policies.sql) - Security configuration
- [**Environment Setup**](.env.example) - Configuration template

## 🎯 Usage Examples

### Upload & Process Documents
```typescript
// Upload document with auto-processing
const result = await EnhancedDocumentService.uploadDocument(
  file, 
  userId, 
  { 
    priority: 'high',
    tags: ['important', 'quarterly-report'],
    autoProcess: true 
  }
);
```

### Ask Questions (RAG)
```typescript
// Ask AI about document content
const response = await EnhancedDocumentService.askDocumentQuestion(
  documentId,
  "What are the main financial highlights?",
  userId
);

console.log(response.answer); // AI-generated answer
console.log(response.sources); // Source citations
```

### Search Documents
```typescript
// Semantic search across all documents
const results = await BackendApiService.searchDocuments(
  "budget planning strategies",
  { limit: 10, threshold: 0.7 }
);
```

## 🔐 Authentication

### Mock Authentication (Development)
```bash
Email: admin@kmrl.com
Password: admin123
```

### Production Authentication
- JWT-based authentication
- Supabase Auth integration
- Role-based access control
- Session management

## 📊 API Endpoints

### Document Management
```bash
GET    /api/documents              # List documents
POST   /api/upload                 # Upload document
GET    /api/documents/:id          # Get document
PATCH  /api/documents/:id          # Update document
DELETE /api/documents/:id          # Delete document
```

### AI Processing
```bash
POST   /api/ai/process/:id         # Process document
GET    /api/ai/status/:id          # Processing status
POST   /api/ai/analyze             # Analyze text
POST   /api/ai/embeddings          # Generate embeddings
```

### Chat & Q&A
```bash
POST   /api/chat/ask/:id           # Ask question (RAG)
GET    /api/chat/history/:id       # Chat history
POST   /api/chat/search            # Search conversations
```

### Search
```bash
POST   /api/search/documents       # Search documents
POST   /api/search/semantic        # Semantic search
POST   /api/search/similar         # Similar documents
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_API_URL=http://localhost:3001
VITE_USE_BACKEND_API=true
```

**Backend (backend-api/.env):**
```bash
NODE_ENV=development
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
GOOGLE_AI_API_KEY=your-google-ai-key
JWT_SECRET=your-jwt-secret
```

## 🚀 Deployment

### Production Deployment
1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Railway
3. **Database**: Supabase (managed)
4. **AI**: Google AI Studio

See [**Deployment Guide**](DEPLOYMENT-GUIDE.md) for detailed instructions.

### Docker Deployment
```bash
# Backend
cd backend-api
docker build -t kmrl-backend .
docker run -p 3001:3001 --env-file .env kmrl-backend

# Frontend
docker build -t kmrl-frontend .
docker run -p 3000:3000 kmrl-frontend
```

## 📈 Performance & Scaling

### Optimization Features
- **Chunked Processing**: Efficient document segmentation
- **Vector Caching**: Fast similarity searches
- **Rate Limiting**: API protection
- **Batch Operations**: Multiple document processing
- **Real-time Updates**: Live processing feedback

### Scaling Considerations
- **Database**: Supabase auto-scaling
- **Backend**: Railway horizontal scaling
- **AI**: Google AI quota management
- **Storage**: CDN for file delivery

## 🧪 Testing

### Backend Testing
```bash
cd backend-api
npm test                    # Run test suite
node test-backend.js       # Quick API test
```

### Frontend Testing
```bash
npm run test               # Component tests
npm run test:e2e          # End-to-end tests
```

### Manual Testing
1. Upload various document types
2. Test AI processing pipeline
3. Verify RAG Q&A functionality
4. Check search capabilities
5. Test batch operations

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# AI services health
curl http://localhost:3001/api/ai/health
```

### Logging
- **Backend**: Winston structured logging
- **Frontend**: Console & error tracking
- **Database**: Supabase dashboard
- **AI**: Google AI Studio metrics

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support & Help

### Common Issues
- **Upload failures**: Check file size (50MB limit) and format
- **AI errors**: Verify Google AI API key and quotas
- **Database issues**: Check Supabase connection and RLS policies
- **Processing stuck**: Monitor backend logs for errors

### Getting Help
1. Check [📚 Documentation Index](docs/README.md)
2. Review [Deployment Guide](docs/guides/DEPLOYMENT-GUIDE.md)
3. Review backend logs
4. Test API endpoints individually
5. Verify environment variables
6. Check service health endpoints

### Useful Commands
```bash
# Check backend status
curl -I http://localhost:3001/health

# Test document upload
curl -X POST http://localhost:3001/api/upload \
  -F "document=@test.pdf"

# Monitor backend logs
cd backend-api && npm run dev

# Check database connection
# Use Supabase dashboard SQL editor
```

---

**Built with ❤️ for intelligent document management**

🔗 **Links:**
- [Live Demo](https://your-app.vercel.app) (Coming Soon)
- [📚 Complete Documentation](docs/README.md)
- [API Documentation](backend-api/README.md)
- [Deployment Guide](docs/guides/DEPLOYMENT-GUIDE.md)
- [GitHub Repository](https://github.com/madhavchaturvedi005/intelligence-model-sih-25)