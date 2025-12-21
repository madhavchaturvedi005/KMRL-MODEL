# KMRL Document Intelligence Backend API

A powerful backend API for document processing, AI analysis, and RAG-based question answering using LangChain and Google AI.

## 🚀 Features

- **Document Processing**: Extract text from PDF, DOC, DOCX, XLS, XLSX, TXT, CSV files
- **AI Analysis**: Intelligent document analysis using Google Generative AI
- **Vector Search**: Semantic search using Supabase pgvector
- **RAG Q&A**: Ask questions about documents with context-aware answers
- **Real-time Processing**: Live status updates during document processing
- **Batch Operations**: Process multiple documents simultaneously
- **Secure Authentication**: JWT-based authentication with rate limiting
- **File Management**: Upload, download, and manage documents
- **Chat History**: Store and retrieve conversation history

## 🏗️ Architecture

```
Frontend → Backend API → Google AI → Supabase
                      ↓
                   Vector Store (pgvector)
```

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI/ML**: Google Generative AI, LangChain
- **Database**: Supabase (PostgreSQL + pgvector)
- **Storage**: Supabase Storage
- **Authentication**: JWT
- **Deployment**: Railway
- **Logging**: Winston

## 🛠️ Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Google AI API key

### Local Development

1. **Clone and navigate to backend directory**
   ```bash
   cd backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 3001) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

## 📚 API Endpoints

### Health Check
- `GET /health` - Service health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Document Management
- `GET /api/documents` - List user documents
- `GET /api/documents/:id` - Get specific document
- `PATCH /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats/overview` - Document statistics

### File Upload
- `POST /api/upload` - Upload single document
- `POST /api/upload/batch` - Upload multiple documents
- `GET /api/upload/stats` - Upload statistics

### AI Processing
- `POST /api/ai/process/:documentId` - Process document with AI
- `GET /api/ai/status/:documentId` - Get processing status
- `POST /api/ai/analyze` - Analyze text directly
- `POST /api/ai/embeddings` - Generate embeddings
- `POST /api/ai/batch-process` - Batch process documents
- `POST /api/ai/classify` - Classify document type
- `GET /api/ai/health` - AI services health check

### Chat & Q&A
- `POST /api/chat/ask/:documentId` - Ask question about document
- `GET /api/chat/history/:documentId` - Get chat history
- `GET /api/chat/stats` - Chat statistics
- `POST /api/chat/search` - Search chat history
- `DELETE /api/chat/history/:documentId` - Delete chat history
- `GET /api/chat/export/:documentId` - Export chat history

### Search
- `POST /api/search/documents` - Search documents
- `POST /api/search/semantic` - Semantic vector search
- `POST /api/search/similar` - Find similar documents

## 🔒 Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

For development, you can use the mock user:
- Email: `admin@kmrl.com`
- Password: `admin123`

## 📊 Rate Limiting

- **General API**: 1000 requests per 15 minutes per IP
- **AI Endpoints**: 20 requests per 5 minutes per IP
- **Chat Endpoints**: 10 requests per minute per IP

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway**
   ```bash
   railway login
   railway link
   ```

2. **Set environment variables**
   ```bash
   railway variables set SUPABASE_URL=your-url
   railway variables set GOOGLE_AI_API_KEY=your-key
   # ... set all required variables
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Docker Deployment

```bash
# Build image
docker build -t kmrl-backend .

# Run container
docker run -p 3001:3001 --env-file .env kmrl-backend
```

## 📝 Logging

The API uses Winston for structured logging:

- **Console**: Colored output for development
- **Files**: 
  - `logs/error.log` - Error logs only
  - `logs/combined.log` - All logs
- **Levels**: error, warn, info, http, debug

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Check Endpoint

`GET /health` returns:

```json
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

### Performance Metrics

- Request/response times logged
- Error rates tracked
- AI processing times monitored
- Database query performance

## 🔧 Configuration

### File Upload Limits

- **Max file size**: 50MB
- **Supported formats**: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- **Max files per batch**: 10

### Processing Limits

- **Max chunks per document**: 500
- **Chunk size**: 1000 characters
- **Chunk overlap**: 200 characters

## 🐛 Troubleshooting

### Common Issues

1. **Google AI API errors**
   - Check API key validity
   - Verify quota limits
   - Check network connectivity

2. **Supabase connection issues**
   - Verify URL and keys
   - Check database permissions
   - Ensure pgvector extension is enabled

3. **File upload failures**
   - Check file size limits
   - Verify supported formats
   - Check storage permissions

### Debug Mode

Set `LOG_LEVEL=debug` for detailed logging.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support, please contact the KMRL development team or create an issue in the repository.