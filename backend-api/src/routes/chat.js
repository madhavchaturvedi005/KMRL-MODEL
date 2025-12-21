import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import documentProcessor from '../services/documentProcessor.js';
import supabaseService from '../services/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 chat requests per minute per IP
  message: {
    error: 'Too many chat requests, please try again later.',
    retryAfter: '1 minute'
  }
});

// Ask question about a document (RAG)
router.post('/ask/:documentId',
  chatLimiter,
  authenticateToken,
  [
    param('documentId')
      .isUUID()
      .withMessage('Document ID must be a valid UUID'),
    body('question')
      .isString()
      .isLength({ min: 3, max: 500 })
      .withMessage('Question must be between 3 and 500 characters')
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
      const { question } = req.body;
      const userId = req.user?.id;

      logger.info(`RAG question for document ${documentId}: "${question}" by user ${userId}`);

      // Check if document exists and is processed
      const document = await supabaseService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      if (document.processing_status !== 'completed') {
        return res.status(400).json({
          error: 'Document is not yet processed',
          status: document.processing_status,
          message: 'Please wait for document processing to complete before asking questions'
        });
      }

      // Get answer using RAG
      const result = await documentProcessor.askDocumentQuestion(documentId, question, userId);

      res.json({
        success: true,
        question: question,
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        documentId: documentId,
        documentTitle: document.title,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('RAG chat error:', error);
      res.status(500).json({
        error: 'Failed to process question',
        message: error.message
      });
    }
  }
);

// Get chat history for a document
router.get('/history/:documentId',
  authenticateToken,
  [
    param('documentId')
      .isUUID()
      .withMessage('Document ID must be a valid UUID'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
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
      const limit = parseInt(req.query.limit) || 50;
      const userId = req.user?.id;

      logger.info(`Chat history request for document ${documentId} by user ${userId}`);

      // Check if document exists
      const document = await supabaseService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      // Get chat history
      const chatHistory = await supabaseService.getChatHistory(documentId, userId, limit);

      res.json({
        success: true,
        documentId: documentId,
        documentTitle: document.title,
        chatHistory: chatHistory,
        count: chatHistory.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get chat history error:', error);
      res.status(500).json({
        error: 'Failed to get chat history',
        message: error.message
      });
    }
  }
);

// Get chat statistics for a user
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user?.id;

      logger.info(`Chat stats request by user ${userId}`);

      // Get chat statistics from database
      const { data: chatStats, error } = await supabaseService.supabase
        .from('document_chats')
        .select('document_id, created_at, confidence_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalChats: chatStats.length,
        documentsWithChats: new Set(chatStats.map(chat => chat.document_id)).size,
        averageConfidence: chatStats.length > 0
          ? Math.round(chatStats.reduce((sum, chat) => sum + (chat.confidence_score || 0), 0) / chatStats.length)
          : 0,
        recentChats: chatStats.slice(0, 10),
        chatsByDay: {}
      };

      // Group chats by day
      chatStats.forEach(chat => {
        const day = new Date(chat.created_at).toISOString().split('T')[0];
        stats.chatsByDay[day] = (stats.chatsByDay[day] || 0) + 1;
      });

      res.json({
        success: true,
        userId: userId,
        stats: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get chat stats error:', error);
      res.status(500).json({
        error: 'Failed to get chat statistics',
        message: error.message
      });
    }
  }
);

// Search across all chat history
router.post('/search',
  chatLimiter,
  authenticateToken,
  [
    body('query')
      .isString()
      .isLength({ min: 2, max: 200 })
      .withMessage('Query must be between 2 and 200 characters'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
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

      const { query, limit = 20 } = req.body;
      const userId = req.user?.id;

      logger.info(`Chat search request: "${query}" by user ${userId}`);

      // Search in chat history using text search
      const { data: searchResults, error } = await supabaseService.supabase
        .from('document_chats')
        .select(`
          id,
          document_id,
          question,
          answer,
          confidence_score,
          created_at,
          documents (
            title,
            document_type
          )
        `)
        .eq('user_id', userId)
        .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      res.json({
        success: true,
        query: query,
        results: searchResults || [],
        count: searchResults?.length || 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Chat search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message
      });
    }
  }
);

// Delete chat history for a document
router.delete('/history/:documentId',
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

      logger.info(`Delete chat history for document ${documentId} by user ${userId}`);

      // Delete chat history
      const { error } = await supabaseService.supabase
        .from('document_chats')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Chat history deleted successfully',
        documentId: documentId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Delete chat history error:', error);
      res.status(500).json({
        error: 'Failed to delete chat history',
        message: error.message
      });
    }
  }
);

// Export chat history
router.get('/export/:documentId',
  authenticateToken,
  [
    param('documentId')
      .isUUID()
      .withMessage('Document ID must be a valid UUID'),
    query('format')
      .optional()
      .isIn(['json', 'csv', 'txt'])
      .withMessage('Format must be json, csv, or txt')
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
      const format = req.query.format || 'json';
      const userId = req.user?.id;

      logger.info(`Export chat history for document ${documentId} in ${format} format by user ${userId}`);

      // Get document and chat history
      const document = await supabaseService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      const chatHistory = await supabaseService.getChatHistory(documentId, userId, 1000);

      // Format response based on requested format
      const fileName = `chat-history-${documentId}-${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}.json"`);
          res.json({
            document: {
              id: document.id,
              title: document.title,
              type: document.document_type
            },
            chatHistory: chatHistory,
            exportedAt: new Date().toISOString()
          });
          break;

        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
          
          let csv = 'Timestamp,Question,Answer,Confidence\n';
          chatHistory.forEach(chat => {
            const timestamp = new Date(chat.created_at).toISOString();
            const question = `"${chat.question.replace(/"/g, '""')}"`;
            const answer = `"${chat.answer.replace(/"/g, '""')}"`;
            const confidence = chat.confidence_score || 0;
            csv += `${timestamp},${question},${answer},${confidence}\n`;
          });
          
          res.send(csv);
          break;

        case 'txt':
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}.txt"`);
          
          let txt = `Chat History for: ${document.title}\n`;
          txt += `Document ID: ${document.id}\n`;
          txt += `Exported: ${new Date().toISOString()}\n`;
          txt += `Total Conversations: ${chatHistory.length}\n\n`;
          txt += '=' .repeat(50) + '\n\n';
          
          chatHistory.forEach((chat, index) => {
            txt += `Conversation ${index + 1}\n`;
            txt += `Time: ${new Date(chat.created_at).toLocaleString()}\n`;
            txt += `Question: ${chat.question}\n`;
            txt += `Answer: ${chat.answer}\n`;
            if (chat.confidence_score) {
              txt += `Confidence: ${chat.confidence_score}%\n`;
            }
            txt += '\n' + '-'.repeat(30) + '\n\n';
          });
          
          res.send(txt);
          break;
      }

    } catch (error) {
      logger.error('Export chat history error:', error);
      res.status(500).json({
        error: 'Export failed',
        message: error.message
      });
    }
  }
);

export default router;