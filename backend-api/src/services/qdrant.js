import { logger } from '../utils/logger.js';

class QdrantService {
  constructor() {
    this.isEnabled = false;
    this.collectionName = 'document_chunks';
    
    // Check if Qdrant is configured
    if (process.env.QDRANT_HOST && process.env.QDRANT_API_KEY) {
      logger.warn('Qdrant configured but client library not available - using mock service');
    } else {
      logger.info('Qdrant not configured - using mock vector search service');
    }
  }

  async initialize() {
    logger.info('Mock Qdrant service initialized');
    return true;
  }

  async createCollection() {
    logger.info(`Mock: Created collection ${this.collectionName}`);
    return true;
  }

  async upsertChunks(chunks) {
    logger.info(`Mock: Upserted ${chunks.length} chunks to Qdrant`);
    return { status: 'ok', operation_id: Date.now() };
  }

  async searchSimilar(queryVector, documentId = null, limit = 10, threshold = 0.7) {
    logger.info(`Mock: Searching for similar vectors (limit: ${limit}, threshold: ${threshold})`);
    
    // Return mock results
    return [
      {
        id: 'mock_chunk_1',
        score: 0.95,
        document_id: documentId || 'mock_doc_1',
        chunk_text: 'This is a mock search result for testing purposes.',
        chunk_index: 0,
        chunk_tokens: 50
      },
      {
        id: 'mock_chunk_2',
        score: 0.87,
        document_id: documentId || 'mock_doc_2',
        chunk_text: 'Another mock search result with relevant content.',
        chunk_index: 1,
        chunk_tokens: 45
      }
    ];
  }

  async deleteDocumentChunks(documentId) {
    logger.info(`Mock: Deleted chunks for document: ${documentId}`);
    return true;
  }

  async getCollectionInfo() {
    return {
      status: 'green',
      vectors_count: 1000,
      indexed_vectors_count: 1000,
      points_count: 1000,
      segments_count: 1,
      config: {
        params: {
          vectors: {
            size: 1536,
            distance: 'Cosine'
          }
        }
      }
    };
  }

  async searchByText(queryText, documentId = null, limit = 10) {
    logger.info(`Mock: Text search for "${queryText}"`);
    return [];
  }

  async getChunksByDocument(documentId, limit = 100) {
    logger.info(`Mock: Getting chunks for document ${documentId}`);
    return [
      {
        id: `${documentId}_chunk_1`,
        document_id: documentId,
        chunk_text: 'Mock chunk content for testing',
        chunk_index: 0,
        chunk_tokens: 25,
        created_at: new Date().toISOString()
      }
    ];
  }

  async healthCheck() {
    return {
      status: 'healthy',
      message: 'Mock Qdrant service is running',
      collections_count: 1,
      collection_name: this.collectionName,
      vectors_count: 1000,
      indexed_vectors_count: 1000,
      mock: true
    };
  }
}

// Create singleton instance
const qdrantService = new QdrantService();

// Initialize on startup
qdrantService.initialize().catch(error => {
  logger.error('Failed to initialize mock Qdrant service:', error);
});

export default qdrantService;