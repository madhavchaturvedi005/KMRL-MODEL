import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import supabaseService from '../services/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all documents for a user
router.get('/',
  authenticateToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed'])
      .withMessage('Status must be pending, processing, completed, or failed'),
    query('type')
      .optional()
      .isIn(['policy', 'procedure', 'report', 'email', 'technical', 'financial', 'other'])
      .withMessage('Invalid document type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user?.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const status = req.query.status;
      const type = req.query.type;

      logger.info(`Get documents request by user ${userId}`);

      let query = supabaseService.supabase
        .from('documents')
        .select(`
          id,
          title,
          file_path,
          file_size,
          mime_type,
          document_type,
          priority,
          processing_status,
          ai_summary,
          key_points,
          entities,
          confidence_score,
          language,
          created_at,
          updated_at,
          processed_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('processing_status', status);
      }

      if (type) {
        query = query.eq('document_type', type);
      }

      const { data: documents, error, count } = await query;

      if (error) throw error;

      res.json({
        success: true,
        documents: documents || [],
        pagination: {
          limit,
          offset,
          total: count,
          hasMore: (offset + limit) < (count || 0)
        },
        filters: {
          status,
          type
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get documents error:', error);
      res.status(500).json({
        error: 'Failed to get documents',
        message: error.message
      });
    }
  }
);

// Get a specific document
router.get('/:documentId',
  authenticateToken,
  [
    param('documentId')
      .isUUID()
      .withMessage('Document ID must be a valid UUID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { documentId } = req.params;
      const userId = req.user?.id;

      logger.info(`Get document ${documentId} by user ${userId}`);

      const document = await supabaseService.getDocument(documentId);

      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      // Check if user has access to this document
      if (document.user_id !== userId) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        document: document,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get document error:', error);
      res.status(500).json({
        error: 'Failed to get document',
        message: error.message
      });
    }
  }
);

// Update document metadata
router.patch('/:documentId',
  authenticateToken,
  [
    param('documentId')
      .isUUID()
      .withMessage('Document ID must be a valid UUID'),
    body('title')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('priority')
      .optional()
      .isIn(['high', 'medium', 'low'])
      .withMessage('Priority must be high, medium, or low'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { documentId } = req.params;
      const { title, priority, tags } = req.body;
      const userId = req.user?.id;

      logger.info(`Update document ${documentId} by user ${userId}`);

      // Check if document exists and user has access
      const document = await supabaseService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      if (document.user_id !== userId) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      // Prepare update data
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (title !== undefined) updateData.title = title;
      if (priority !== undefined) updateData.priority = priority;
      if (tags !== undefined) updateData.tags = tags;

      // Update document
      const { data: updatedDocument, error } = await supabaseService.supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        document: updatedDocument,
        message: 'Document updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Update document error:', error);
      res.status(500).json({
        error: 'Failed to update document',
        message: error.message
      });
    }
  }
);

// Delete a document
router.delete('/:documentId',
  authenticateToken,
  [
    param('documentId')
      .isUUID()
      .withMessage('Document ID must be a valid UUID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { documentId } = req.params;
      const userId = req.user?.id;

      logger.info(`Delete document ${documentId} by user ${userId}`);

      // Check if document exists and user has access
      const document = await supabaseService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      if (document.user_id !== userId) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      // Delete from storage first
      if (document.file_path) {
        try {
          await supabaseService.deleteFile(document.file_path);
        } catch (storageError) {
          logger.warn(`Failed to delete file from storage: ${storageError.message}`);
        }
      }

      // Delete document chunks
      await supabaseService.supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      // Delete chat history
      await supabaseService.supabase
        .from('document_chats')
        .delete()
        .eq('document_id', documentId);

      // Delete document record
      const { error } = await supabaseService.supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Document deleted successfully',
        documentId: documentId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Delete document error:', error);
      res.status(500).json({
        error: 'Failed to delete document',
        message: error.message
      });
    }
  }
);

// Get document statistics
router.get('/stats/overview',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user?.id;

      logger.info(`Get document stats by user ${userId}`);

      // Get document counts by status
      const { data: statusStats, error: statusError } = await supabaseService.supabase
        .from('documents')
        .select('processing_status')
        .eq('user_id', userId);

      if (statusError) throw statusError;

      // Get document counts by type
      const { data: typeStats, error: typeError } = await supabaseService.supabase
        .from('documents')
        .select('document_type')
        .eq('user_id', userId);

      if (typeError) throw typeError;

      // Calculate statistics
      const stats = {
        total: statusStats.length,
        byStatus: {
          pending: statusStats.filter(d => d.processing_status === 'pending').length,
          processing: statusStats.filter(d => d.processing_status === 'processing').length,
          completed: statusStats.filter(d => d.processing_status === 'completed').length,
          failed: statusStats.filter(d => d.processing_status === 'failed').length
        },
        byType: {
          policy: typeStats.filter(d => d.document_type === 'policy').length,
          procedure: typeStats.filter(d => d.document_type === 'procedure').length,
          report: typeStats.filter(d => d.document_type === 'report').length,
          email: typeStats.filter(d => d.document_type === 'email').length,
          technical: typeStats.filter(d => d.document_type === 'technical').length,
          financial: typeStats.filter(d => d.document_type === 'financial').length,
          other: typeStats.filter(d => d.document_type === 'other').length
        }
      };

      res.json({
        success: true,
        userId: userId,
        stats: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get document stats error:', error);
      res.status(500).json({
        error: 'Failed to get document statistics',
        message: error.message
      });
    }
  }
);

export default router;