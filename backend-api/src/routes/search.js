import express from 'express';
import { body, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

import { authenticateToken } from '../middleware/auth.js';
import qdrantService from '../services/qdrant.js';
import openaiService from '../services/openai.js';
import supabaseService from '../services/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for search endpoints
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute per IP
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '1 minute'
  }
});

// Semantic search endpoint
router.post('/semantic',
  searchLimiter,
  authenticateToken,
  [
    body('query')
      .isString()
      .isLength({ min: 3, max: 500 })
      .withMessage('Query must be between 3 and 500 characters'),
    body('document_id')
      .optional()
      .isUUID()
      .withMessage('Document ID must be a valid UUID'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    body('threshold')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Threshold must be between 0 and 1')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { query, document_id, limit = 10, threshold = 0.7 } = req.body;
      const userId = req.user.id;

      logger.info(`Semantic search request: "${query}" by user ${userId}`);

      // Generate embedding for the query
      const queryEmbedding = await openaiService.generateEmbedding(query);

      // Perform vector search
      const searchResults = await qdrantService.searchSimilar(
        queryEmbedding,
        document_id,
        limit,
        threshold
      );

      // If document_id is specified, verify user has access
      if (document_id) {
        const hasAccess = await supabaseService.userHasDocumentAccess(userId, document_id);
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Access denied to specified document'
          });
        }
      }

      // Get document metadata for results
      const documentIds = [...new Set(searchResults.map(r => r.document_id))];
      const documents = await supabaseService.getDocumentsByIds(documentIds, userId);
      const documentsMap = new Map(documents.map(doc => [doc.id, doc]));

      // Enrich results with document metadata
      const enrichedResults = searchResults
        .filter(result => documentsMap.has(result.document_id))
        .map(result => ({
          ...result,
          document: {
            id: result.document_id,
            title: documentsMap.get(result.document_id).title,
            document_type: documentsMap.get(result.document_id).document_type,
            created_at: documentsMap.get(result.document_id).created_at
          }
        }));

      // Log search analytics
      await supabaseService.logSearchQuery(userId, query, enrichedResults.length);

      res.json({
        success: true,
        query: query,
        results: enrichedResults,
        total_results: enrichedResults.length,
        search_params: {
          limit,
          threshold,
          document_id: document_id || null
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Semantic search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message
      });
    }
  }
);

// Text-based search (fallback when vector search is unavailable)
router.post('/text',
  searchLimiter,
  authenticateToken,
  [
    body('query')
      .isString()
      .isLength({ min: 2, max: 200 })
      .withMessage('Query must be between 2 and 200 characters'),
    body('document_type')
      .optional()
      .isIn(['policy', 'procedure', 'report', 'email', 'technical', 'financial'])
      .withMessage('Invalid document type'),
    body('department')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Department must be less than 100 characters'),
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

      const { query, document_type, department, limit = 20 } = req.body;
      const userId = req.user.id;

      logger.info(`Text search request: "${query}" by user ${userId}`);

      // Perform text-based search in Supabase
      const searchResults = await supabaseService.searchDocumentsText(
        query,
        userId,
        { document_type, department, limit }
      );

      res.json({
        success: true,
        query: query,
        results: searchResults,
        total_results: searchResults.length,
        search_type: 'text',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Text search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message
      });
    }
  }
);

// Get search suggestions
router.get('/suggestions',
  authenticateToken,
  [
    query('q')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 characters')
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

      const { q } = req.query;
      const userId = req.user.id;

      // Get search suggestions based on user's documents
      const suggestions = await supabaseService.getSearchSuggestions(userId, q);

      res.json({
        success: true,
        suggestions: suggestions,
        query: q || null
      });

    } catch (error) {
      logger.error('Search suggestions error:', error);
      res.status(500).json({
        error: 'Failed to get suggestions',
        message: error.message
      });
    }
  }
);

// Get search analytics
router.get('/analytics',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Get user's search analytics
      const analytics = await supabaseService.getSearchAnalytics(userId);

      res.json({
        success: true,
        analytics: analytics
      });

    } catch (error) {
      logger.error('Search analytics error:', error);
      res.status(500).json({
        error: 'Failed to get analytics',
        message: error.message
      });
    }
  }
);

// Health check for search services
router.get('/health',
  async (req, res) => {
    try {
      const qdrantHealth = await qdrantService.healthCheck();
      const openaiHealth = await openaiService.healthCheck();

      res.json({
        success: true,
        services: {
          qdrant: qdrantHealth,
          openai: openaiHealth
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Search health check error:', error);
      res.status(500).json({
        error: 'Health check failed',
        message: error.message
      });
    }
  }
);

export default router;