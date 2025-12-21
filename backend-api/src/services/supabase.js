import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

class SupabaseService {
  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      logger.error('Supabase credentials not provided');
      this.supabase = null;
      return;
    }

    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    logger.info('Supabase service initialized');
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get document error:', error);
      throw error;
    }
  }

  /**
   * Update document with analysis results
   */
  async updateDocument(documentId, updates) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const { error } = await this.supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;
      logger.info(`Updated document ${documentId}`);
    } catch (error) {
      logger.error('Update document error:', error);
      throw error;
    }
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(documentId, status, additionalData = {}) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const updateData = {
        processing_status: status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      if (status === 'completed') {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;
      logger.info(`Updated document ${documentId} status to ${status}`);
    } catch (error) {
      logger.error('Update document status error:', error);
      throw error;
    }
  }

  /**
   * Insert document chunks with embeddings
   */
  async insertDocumentChunks(chunkData) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const { error } = await this.supabase
        .from('document_chunks')
        .insert(chunkData);

      if (error) throw error;
      logger.info(`Inserted ${chunkData.length} document chunks`);
    } catch (error) {
      logger.error('Insert document chunks error:', error);
      throw error;
    }
  }

  /**
   * Search similar chunks using vector similarity
   */
  async searchSimilarChunks(queryEmbedding, documentId = null, limit = 10, threshold = 0.7) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const { data, error } = await this.supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        doc_id: documentId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Vector search error:', error);
      return [];
    }
  }

  /**
   * Get all documents with optional filtering
   */
  async getDocuments(filters = {}) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      let query = this.supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.status) {
        query = query.eq('processing_status', filters.status);
      }
      if (filters.documentType) {
        query = query.eq('document_type', filters.documentType);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Get documents error:', error);
      throw error;
    }
  }

  /**
   * Download file from Supabase Storage
   */
  async downloadFile(filePath) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const { data, error } = await this.supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;
      
      // Convert blob to buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      logger.error('Download file error:', error);
      throw error;
    }
  }

  /**
   * Save chat history
   */
  async saveChatHistory(chatData) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      const { error } = await this.supabase
        .from('document_chats')
        .insert(chatData);

      if (error) throw error;
      logger.info(`Saved chat history for document ${chatData.document_id}`);
    } catch (error) {
      logger.error('Save chat history error:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a document
   */
  async getChatHistory(documentId, userId = null, limit = 50) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      let query = this.supabase
        .from('document_chats')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Get chat history error:', error);
      return [];
    }
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(userId = null) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      let query = this.supabase
        .from('documents')
        .select('processing_status, document_type, priority, confidence_score');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data.length,
        completed: data.filter(d => d.processing_status === 'completed').length,
        pending: data.filter(d => d.processing_status === 'pending').length,
        processing: data.filter(d => d.processing_status === 'processing').length,
        failed: data.filter(d => d.processing_status === 'failed').length,
        avgConfidence: data.length > 0 
          ? Math.round(data.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / data.length)
          : 0,
        byType: {},
        byPriority: {}
      };

      // Group by type and priority
      data.forEach(doc => {
        if (doc.document_type) {
          stats.byType[doc.document_type] = (stats.byType[doc.document_type] || 0) + 1;
        }
        if (doc.priority) {
          stats.byPriority[doc.priority] = (stats.byPriority[doc.priority] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Get document stats error:', error);
      return null;
    }
  }

  /**
   * Delete document and related data
   */
  async deleteDocument(documentId) {
    if (!this.supabase) throw new Error('Supabase not configured');

    try {
      // Get document info first
      const document = await this.getDocument(documentId);
      if (!document) return false;

      // Delete file from storage
      await this.supabase.storage
        .from('documents')
        .remove([document.file_path]);

      // Delete document record (cascades to chunks, chats, etc.)
      const { error } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      logger.info(`Deleted document ${documentId}`);
      return true;
    } catch (error) {
      logger.error('Delete document error:', error);
      throw error;
    }
  }

  /**
   * Health check for Supabase connection
   */
  async healthCheck() {
    if (!this.supabase) {
      return {
        status: 'disabled',
        message: 'Supabase not configured'
      };
    }

    try {
      // Test database connection
      const { data, error } = await this.supabase
        .from('documents')
        .select('count')
        .limit(1);

      if (error) throw error;

      // Test storage connection
      const { data: buckets, error: storageError } = await this.supabase.storage.listBuckets();
      if (storageError) throw storageError;

      return {
        status: 'healthy',
        message: 'Supabase connection working',
        buckets: buckets.length
      };
    } catch (error) {
      logger.error('Supabase health check failed:', error);
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.code || 'unknown'
      };
    }
  }
}

// Create singleton instance
const supabaseService = new SupabaseService();

export default supabaseService;