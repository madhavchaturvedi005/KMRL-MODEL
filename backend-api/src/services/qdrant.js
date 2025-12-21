import { QdrantClient } from '@qdrant/js-client-rest';
import { logger } from '../utils/logger.js';

class QdrantService {
  constructor() {
    this.client = new QdrantClient({
      host: process.env.QDRANT_HOST,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = 'document_chunks';
  }

  async initialize() {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        col => col.name === this.collectionName
      );

      if (!exists) {
        await this.createCollection();
        logger.info(`Created Qdrant collection: ${this.collectionName}`);
      } else {
        logger.info(`Qdrant collection exists: ${this.collectionName}`);
      }
    } catch (error) {
      logger.error('Failed to initialize Qdrant:', error);
      throw error;
    }
  }

  async createCollection() {
    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: 1536, // OpenAI text-embedding-3-small dimension
        distance: 'Cosine'
      },
      optimizers_config: {
        default_segment_number: 2,
        max_segment_size: 20000,
        memmap_threshold: 20000,
        indexing_threshold: 20000,
        flush_interval_sec: 5,
        max_optimization_threads: 1
      },
      replication_factor: 1,
      write_consistency_factor: 1
    });
  }

  async upsertChunks(chunks) {
    try {
      const points = chunks.map((chunk, index) => ({
        id: chunk.id || `${chunk.document_id}_${chunk.chunk_index}`,
        vector: chunk.embedding,
        payload: {
          document_id: chunk.document_id,
          chunk_text: chunk.chunk_text,
          chunk_index: chunk.chunk_index,
          chunk_tokens: chunk.chunk_tokens,
          created_at: new Date().toISOString()
        }
      }));

      const result = await this.client.upsert(this.collectionName, {
        wait: true,
        points: points
      });

      logger.info(`Upserted ${points.length} chunks to Qdrant`);
      return result;
    } catch (error) {
      logger.error('Failed to upsert chunks to Qdrant:', error);
      throw error;
    }
  }

  async searchSimilar(queryVector, documentId = null, limit = 10, threshold = 0.7) {
    try {
      const searchParams = {
        vector: queryVector,
        limit: limit,
        with_payload: true,
        score_threshold: threshold
      };

      // Add document filter if specified
      if (documentId) {
        searchParams.filter = {
          must: [
            {
              key: 'document_id',
              match: { value: documentId }
            }
          ]
        };
      }

      const results = await this.client.search(this.collectionName, searchParams);

      return results.map(result => ({
        id: result.id,
        score: result.score,
        document_id: result.payload.document_id,
        chunk_text: result.payload.chunk_text,
        chunk_index: result.payload.chunk_index,
        chunk_tokens: result.payload.chunk_tokens
      }));
    } catch (error) {
      logger.error('Failed to search Qdrant:', error);
      throw error;
    }
  }

  async deleteDocumentChunks(documentId) {
    try {
      await this.client.delete(this.collectionName, {
        filter: {
          must: [
            {
              key: 'document_id',
              match: { value: documentId }
            }
          ]
        }
      });

      logger.info(`Deleted chunks for document: ${documentId}`);
    } catch (error) {
      logger.error('Failed to delete document chunks from Qdrant:', error);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      return await this.client.getCollection(this.collectionName);
    } catch (error) {
      logger.error('Failed to get collection info:', error);
      throw error;
    }
  }

  async searchByText(queryText, documentId = null, limit = 10) {
    // This would require generating embeddings first
    // For now, return empty array - implement when OpenAI service is ready
    logger.warn('searchByText not implemented - requires embedding generation');
    return [];
  }

  async getChunksByDocument(documentId, limit = 100) {
    try {
      const results = await this.client.scroll(this.collectionName, {
        filter: {
          must: [
            {
              key: 'document_id',
              match: { value: documentId }
            }
          ]
        },
        limit: limit,
        with_payload: true
      });

      return results.points.map(point => ({
        id: point.id,
        document_id: point.payload.document_id,
        chunk_text: point.payload.chunk_text,
        chunk_index: point.payload.chunk_index,
        chunk_tokens: point.payload.chunk_tokens,
        created_at: point.payload.created_at
      }));
    } catch (error) {
      logger.error('Failed to get chunks by document:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const collections = await this.client.getCollections();
      const collectionInfo = await this.getCollectionInfo();
      
      return {
        status: 'healthy',
        collections_count: collections.collections.length,
        collection_name: this.collectionName,
        vectors_count: collectionInfo.vectors_count,
        indexed_vectors_count: collectionInfo.indexed_vectors_count
      };
    } catch (error) {
      logger.error('Qdrant health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const qdrantService = new QdrantService();

// Initialize on startup
if (process.env.QDRANT_HOST && process.env.QDRANT_API_KEY) {
  qdrantService.initialize().catch(error => {
    logger.error('Failed to initialize Qdrant service:', error);
  });
} else {
  logger.warn('Qdrant credentials not provided - vector search will be disabled');
}

export default qdrantService;