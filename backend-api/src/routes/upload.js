import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import supabaseService from '../services/supabase.js';
import documentProcessor from '../services/documentProcessor.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
    const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV`));
    }
  }
});

// Upload single document
router.post('/',
  authenticateToken,
  upload.single('document'),
  [
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
    body('autoProcess')
      .optional()
      .isBoolean()
      .withMessage('autoProcess must be a boolean')
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

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please select a file to upload'
        });
      }

      const userId = req.user?.id || 'mock-user-id';
      const { title, priority = 'medium', tags = [], autoProcess = true } = req.body;
      const file = req.file;

      logger.info(`File upload request by user ${userId}: ${file.originalname}`);

      // Generate unique file path
      const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `documents/${userId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseService.supabase.storage
        .from('documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        logger.error('File upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create document record
      const documentData = {
        id: uuidv4(),
        user_id: userId,
        title: title || file.originalname,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.mimetype,
        priority: priority,
        tags: tags,
        processing_status: 'pending',
        source: 'upload',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: document, error: dbError } = await supabaseService.supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabaseService.supabase.storage
          .from('documents')
          .remove([uploadData.path]);
        
        logger.error('Database insert error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      logger.info(`Document created successfully: ${document.id}`);

      // Start processing if autoProcess is enabled
      if (autoProcess) {
        logger.info(`Starting automatic processing for document ${document.id}`);
        
        // Process document in background
        documentProcessor.processDocument(
          document.id,
          document.file_path,
          (status) => {
            logger.info(`Processing status for ${document.id}: ${status.stage} - ${status.message}`);
          }
        ).catch(error => {
          logger.error(`Background processing failed for ${document.id}:`, error);
        });
      }

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        document: {
          id: document.id,
          title: document.title,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          priority: document.priority,
          tags: document.tags,
          processingStatus: document.processing_status,
          autoProcessing: autoProcess,
          createdAt: document.created_at
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Upload endpoint error:', error);
      
      // Handle multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: 'File size must be less than 50MB'
          });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Too many files',
            message: 'Please upload only one file at a time'
          });
        }
      }

      res.status(500).json({
        error: 'Upload failed',
        message: error.message
      });
    }
  }
);

// Upload multiple documents
router.post('/batch',
  authenticateToken,
  upload.array('documents', 10), // Max 10 files
  [
    body('priority')
      .optional()
      .isIn(['high', 'medium', 'low'])
      .withMessage('Priority must be high, medium, or low'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('autoProcess')
      .optional()
      .isBoolean()
      .withMessage('autoProcess must be a boolean')
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

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No files uploaded',
          message: 'Please select files to upload'
        });
      }

      const userId = req.user?.id || 'mock-user-id';
      const { priority = 'medium', tags = [], autoProcess = true } = req.body;
      const files = req.files;

      logger.info(`Batch upload request by user ${userId}: ${files.length} files`);

      const results = [];
      const uploadErrors = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Generate unique file path
          const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();
          const fileName = `${uuidv4()}${fileExtension}`;
          const filePath = `documents/${userId}/${fileName}`;

          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabaseService.supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Create document record
          const documentData = {
            id: uuidv4(),
            user_id: userId,
            title: file.originalname,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.mimetype,
            priority: priority,
            tags: tags,
            processing_status: 'pending',
            source: 'batch_upload',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: document, error: dbError } = await supabaseService.supabase
            .from('documents')
            .insert(documentData)
            .select()
            .single();

          if (dbError) {
            // Clean up uploaded file if database insert fails
            await supabaseService.supabase.storage
              .from('documents')
              .remove([uploadData.path]);
            throw dbError;
          }

          results.push({
            success: true,
            document: {
              id: document.id,
              title: document.title,
              fileName: file.originalname,
              fileSize: file.size,
              processingStatus: document.processing_status
            }
          });

          // Start processing if autoProcess is enabled
          if (autoProcess) {
            documentProcessor.processDocument(
              document.id,
              document.file_path,
              (status) => {
                logger.info(`Processing status for ${document.id}: ${status.stage}`);
              }
            ).catch(error => {
              logger.error(`Background processing failed for ${document.id}:`, error);
            });
          }

        } catch (fileError) {
          logger.error(`Failed to upload file ${file.originalname}:`, fileError);
          uploadErrors.push({
            fileName: file.originalname,
            error: fileError.message
          });
        }
      }

      const successCount = results.length;
      const errorCount = uploadErrors.length;

      logger.info(`Batch upload completed: ${successCount} successful, ${errorCount} failed`);

      res.status(successCount > 0 ? 201 : 400).json({
        success: successCount > 0,
        message: `Batch upload completed: ${successCount}/${files.length} files uploaded successfully`,
        results: {
          successful: results,
          failed: uploadErrors,
          summary: {
            total: files.length,
            successful: successCount,
            failed: errorCount
          }
        },
        autoProcessing: autoProcess,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Batch upload error:', error);
      res.status(500).json({
        error: 'Batch upload failed',
        message: error.message
      });
    }
  }
);

// Get upload progress (for future WebSocket implementation)
router.get('/progress/:uploadId',
  authenticateToken,
  async (req, res) => {
    try {
      const { uploadId } = req.params;
      
      // This is a placeholder for future WebSocket-based progress tracking
      // For now, return a simple status
      res.json({
        success: true,
        uploadId: uploadId,
        status: 'completed',
        progress: 100,
        message: 'Upload progress tracking not yet implemented',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get upload progress error:', error);
      res.status(500).json({
        error: 'Failed to get upload progress',
        message: error.message
      });
    }
  }
);

// Get upload statistics
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user?.id;

      logger.info(`Get upload stats by user ${userId}`);

      // Get upload statistics from database
      const { data: uploads, error } = await supabaseService.supabase
        .from('documents')
        .select('file_size, mime_type, created_at, source')
        .eq('user_id', userId)
        .eq('source', 'upload')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalUploads: uploads.length,
        totalSize: uploads.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
        averageSize: uploads.length > 0 
          ? Math.round(uploads.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / uploads.length)
          : 0,
        byMimeType: {},
        recentUploads: uploads.slice(0, 10),
        uploadsByDay: {}
      };

      // Group by mime type
      uploads.forEach(doc => {
        const mimeType = doc.mime_type || 'unknown';
        stats.byMimeType[mimeType] = (stats.byMimeType[mimeType] || 0) + 1;
      });

      // Group by day
      uploads.forEach(doc => {
        const day = new Date(doc.created_at).toISOString().split('T')[0];
        stats.uploadsByDay[day] = (stats.uploadsByDay[day] || 0) + 1;
      });

      res.json({
        success: true,
        userId: userId,
        stats: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get upload stats error:', error);
      res.status(500).json({
        error: 'Failed to get upload statistics',
        message: error.message
      });
    }
  }
);

export default router;