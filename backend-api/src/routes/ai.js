import express from 'express';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import documentProcessor from '../services/documentProcessor.js';
import googleAIService from '../services/googleAI.js';
import supabaseService from '../services/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 AI requests per 5 minutes per IP
  message: {
    error: 'Too many AI requests, please try again later.',
    retryAfter: '5 minutes'
  }
});

// Process document endpoint
router.post('/process/:documentId',
  aiLimiter,
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

      logger.info(`AI processing request for document ${documentId} by user ${userId}`);

      // Check if document exists and user has access
      const document = await supabaseService.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      // Check if already processing or completed
      if (document.processing_status === 'processing') {
        return res.status(409).json({
          error: 'Document is already being processed',
          status: document.processing_status
        });
      }

      if (document.processing_status === 'completed') {
        return res.status(200).json({
          success: true,
          message: 'Document already processed',
          status: document.processing_status,
          processed_at: document.processed_at
        });
      }

      // Mark as processing
      await supabaseService.updateDocumentStatus(documentId, 'processing');

      // Start processing (async)
      documentProcessor.processDocument(
        documentId,
        document.file_path,
        (status) => {
          // In a real implementation, you might want to use WebSockets
          // or Server-Sent Events to send real-time updates
          logger.info(`Processing status for ${documentId}: ${status.stage} - ${status.message}`);
        }
      ).catch(error => {
        logger.error(`Background processing failed for ${documentId}:`, error);
      });

      res.json({
        success: true,
        message: 'Document processing started',
        documentId: documentId,
        status: 'processing'
      });

    } catch (error) {
      logger.error('AI process endpoint error:', error);
      res.status(500).json({
        error: 'Processing failed',
        message: error.message
      });
    }
  }
);

// Get processing status
router.get('/status/:documentId',
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
      const status = await documentProcessor.getProcessingStatus(documentId);

      res.json({
        success: true,
        documentId: documentId,
        ...status
      });

    } catch (error) {
      logger.error('Get processing status error:', error);
      res.status(500).json({
        error: 'Failed to get processing status',
        message: error.message
      });
    }
  }
);

// Analyze text directly (without document upload)
router.post('/analyze',
  aiLimiter,
  authenticateToken,
  [
    body('text')
      .isString()
      .isLength({ min: 50, max: 10000 })
      .withMessage('Text must be between 50 and 10000 characters'),
    body('fileName')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('File name must be less than 255 characters')
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

      const { text, fileName = 'text-input' } = req.body;
      const userId = req.user?.id;

      logger.info(`Direct text analysis request by user ${userId}`);

      const analysis = await googleAIService.analyzeDocument(text, fileName);

      res.json({
        success: true,
        analysis: analysis,
        textLength: text.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Direct text analysis error:', error);
      res.status(500).json({
        error: 'Analysis failed',
        message: error.message
      });
    }
  }
);

// Generate embeddings for text
router.post('/embeddings',
  aiLimiter,
  authenticateToken,
  [
    body('text')
      .isString()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Text must be between 1 and 5000 characters')
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

      const { text } = req.body;
      const userId = req.user?.id;

      logger.info(`Embedding generation request by user ${userId}`);

      const embedding = await googleAIService.generateEmbedding(text);

      res.json({
        success: true,
        embedding: embedding,
        dimensions: embedding.length,
        textLength: text.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Embedding generation error:', error);
      res.status(500).json({
        error: 'Embedding generation failed',
        message: error.message
      });
    }
  }
);

// Batch process multiple documents
router.post('/batch-process',
  aiLimiter,
  authenticateToken,
  [
    body('documentIds')
      .isArray({ min: 1, max: 10 })
      .withMessage('Document IDs must be an array with 1-10 items'),
    body('documentIds.*')
      .isUUID()
      .withMessage('Each document ID must be a valid UUID')
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

      const { documentIds } = req.body;
      const userId = req.user?.id;

      logger.info(`Batch processing request for ${documentIds.length} documents by user ${userId}`);

      // Start batch processing (async)
      documentProcessor.batchProcessDocuments(
        documentIds,
        (status) => {
          logger.info(`Batch processing status: ${status.stage} - ${status.message}`);
        }
      ).then(results => {
        logger.info(`Batch processing completed: ${results.filter(r => r.success).length}/${results.length} successful`);
      }).catch(error => {
        logger.error('Batch processing failed:', error);
      });

      res.json({
        success: true,
        message: 'Batch processing started',
        documentIds: documentIds,
        count: documentIds.length
      });

    } catch (error) {
      logger.error('Batch process endpoint error:', error);
      res.status(500).json({
        error: 'Batch processing failed',
        message: error.message
      });
    }
  }
);

// Classify document type
router.post('/classify',
  aiLimiter,
  authenticateToken,
  [
    body('text')
      .isString()
      .isLength({ min: 50, max: 5000 })
      .withMessage('Text must be between 50 and 5000 characters'),
    body('fileName')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('File name must be less than 255 characters')
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

      const { text, fileName = 'document' } = req.body;
      const userId = req.user?.id;

      logger.info(`Document classification request by user ${userId}`);

      const documentType = await googleAIService.classifyDocument(text, fileName);

      res.json({
        success: true,
        documentType: documentType,
        fileName: fileName,
        textLength: text.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Document classification error:', error);
      res.status(500).json({
        error: 'Classification failed',
        message: error.message
      });
    }
  }
);

// Health check for AI services
router.get('/health',
  async (req, res) => {
    try {
      const googleAIHealth = await googleAIService.healthCheck();
      const supabaseHealth = await supabaseService.healthCheck();

      const overallStatus = googleAIHealth.status === 'healthy' && supabaseHealth.status === 'healthy'
        ? 'healthy'
        : 'degraded';

      res.json({
        success: true,
        status: overallStatus,
        services: {
          googleAI: googleAIHealth,
          supabase: supabaseHealth
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('AI health check error:', error);
      res.status(500).json({
        error: 'Health check failed',
        message: error.message
      });
    }
  }
);

export default router;