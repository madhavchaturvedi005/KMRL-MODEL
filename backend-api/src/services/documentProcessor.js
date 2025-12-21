import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import googleAIService from './googleAI.js';
import supabaseService from './supabase.js';
import { logger } from '../utils/logger.js';

class DocumentProcessor {
  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  /**
   * Process a document end-to-end with real-time status updates
   */
  async processDocument(documentId, filePath, onStatusUpdate) {
    try {
      logger.info(`Starting document processing for ${documentId}`);

      // Stage 1: Download file from Supabase Storage
      onStatusUpdate?.({
        stage: 'downloading',
        message: 'Downloading file from storage...',
        progress: 10
      });

      const fileBuffer = await supabaseService.downloadFile(filePath);
      const fileName = filePath.split('/').pop();
      const mimeType = this.getMimeTypeFromFileName(fileName);

      // Stage 2: Extract text
      onStatusUpdate?.({
        stage: 'extracting',
        message: 'Extracting text from document...',
        progress: 25
      });

      const textContent = await this.extractTextFromBuffer(fileBuffer, mimeType, fileName);
      
      if (!textContent || textContent.trim().length < 50) {
        throw new Error('Could not extract meaningful text from document');
      }

      logger.info(`Extracted ${textContent.length} characters from ${fileName}`);

      // Stage 3: Analyze with Google AI
      onStatusUpdate?.({
        stage: 'analyzing',
        message: 'Analyzing document with AI...',
        progress: 45
      });

      const analysis = await googleAIService.analyzeDocument(textContent, fileName);

      // Stage 4: Create chunks
      onStatusUpdate?.({
        stage: 'chunking',
        message: 'Creating document chunks...',
        progress: 60
      });

      const chunks = await this.createDocumentChunks(textContent, documentId);
      logger.info(`Created ${chunks.length} chunks for ${fileName}`);

      // Stage 5: Generate embeddings
      onStatusUpdate?.({
        stage: 'embedding',
        message: 'Generating embeddings for search...',
        progress: 75
      });

      const chunkTexts = chunks.map(chunk => chunk.pageContent);
      const embeddings = await googleAIService.generateEmbeddings(chunkTexts);

      // Stage 6: Save to database
      onStatusUpdate?.({
        stage: 'saving',
        message: 'Saving analysis results...',
        progress: 90
      });

      await this.saveAnalysisResults(documentId, analysis, chunks, embeddings);

      // Stage 7: Complete
      onStatusUpdate?.({
        stage: 'complete',
        message: 'Document processing complete!',
        progress: 100
      });

      logger.info(`Successfully processed document ${documentId}`);
      return { success: true, analysis };

    } catch (error) {
      logger.error(`Document processing failed for ${documentId}:`, error);
      
      // Mark document as failed in database
      await supabaseService.updateDocumentStatus(documentId, 'failed', {
        error_message: error.message
      });

      onStatusUpdate?.({
        stage: 'error',
        message: `Processing failed: ${error.message}`,
        progress: 0
      });

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Extract text from different file types
   */
  async extractTextFromBuffer(buffer, mimeType, fileName) {
    try {
      if (mimeType.includes('pdf')) {
        return await this.extractFromPDF(buffer);
      } else if (mimeType.includes('text')) {
        return buffer.toString('utf-8');
      } else if (mimeType.includes('word') || mimeType.includes('document')) {
        return await this.extractFromWord(buffer);
      } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
        return await this.extractFromExcel(buffer);
      } else {
        // Try to read as text
        return buffer.toString('utf-8');
      }
    } catch (error) {
      logger.error(`Text extraction error for ${fileName}:`, error);
      throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
    }
  }

  async extractFromPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async extractFromWord(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Word document extraction failed: ${error.message}`);
    }
  }

  async extractFromExcel(buffer) {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let text = '';
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetText = xlsx.utils.sheet_to_txt(sheet);
        text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      });
      
      return text;
    } catch (error) {
      throw new Error(`Excel extraction failed: ${error.message}`);
    }
  }

  /**
   * Create document chunks for vector search
   */
  async createDocumentChunks(content, documentId) {
    const docs = [new Document({ 
      pageContent: content, 
      metadata: { documentId } 
    })];
    
    return await this.textSplitter.splitDocuments(docs);
  }

  /**
   * Save analysis results to Supabase
   */
  async saveAnalysisResults(documentId, analysis, chunks, embeddings) {
    try {
      // Update document with analysis
      await supabaseService.updateDocument(documentId, {
        ai_summary: analysis.summary,
        key_points: analysis.keyPoints,
        entities: analysis.entities,
        document_type: analysis.documentType,
        priority: analysis.priority,
        confidence_score: analysis.confidence,
        language: analysis.language,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: {
          topics: analysis.topics,
          sentiment: analysis.sentiment,
          actionItems: analysis.actionItems
        }
      });

      // Save document chunks with embeddings
      const chunkData = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_text: chunk.pageContent,
        chunk_index: index,
        chunk_tokens: Math.ceil(chunk.pageContent.length / 4),
        embedding: embeddings[index]
      }));

      await supabaseService.insertDocumentChunks(chunkData);

      logger.info(`Saved ${chunks.length} chunks for document ${documentId}`);

    } catch (error) {
      logger.error('Failed to save analysis results:', error);
      throw error;
    }
  }

  /**
   * Search similar documents using vector similarity
   */
  async searchSimilarDocuments(query, documentId = null, limit = 10, threshold = 0.7) {
    try {
      // Generate embedding for query
      const queryEmbedding = await googleAIService.generateEmbedding(query);

      // Search using Supabase vector similarity
      const results = await supabaseService.searchSimilarChunks(
        queryEmbedding,
        documentId,
        limit,
        threshold
      );

      return results;
    } catch (error) {
      logger.error('Vector search error:', error);
      return [];
    }
  }

  /**
   * Ask a question about a document using RAG
   */
  async askDocumentQuestion(documentId, question, userId = null) {
    try {
      logger.info(`RAG question for document ${documentId}: ${question}`);

      // Get relevant chunks
      const relevantChunks = await this.searchSimilarDocuments(question, documentId, 5, 0.7);
      
      if (relevantChunks.length === 0) {
        return {
          answer: "I couldn't find relevant information in this document to answer your question.",
          sources: [],
          confidence: 0
        };
      }

      // Build context from chunks
      const context = relevantChunks
        .map((chunk, index) => `[${index + 1}] ${chunk.chunk_text}`)
        .join('\n\n');

      // Get document title for context
      const document = await supabaseService.getDocument(documentId);
      const documentTitle = document?.title || 'Document';

      // Generate answer using Google AI
      const answer = await googleAIService.answerQuestion(question, context, documentTitle);

      // Save chat history
      await supabaseService.saveChatHistory({
        document_id: documentId,
        user_id: userId,
        question,
        answer,
        context_chunks: relevantChunks.map(chunk => chunk.id),
        confidence_score: Math.round(relevantChunks[0]?.similarity * 100) || 75
      });

      return {
        answer,
        sources: relevantChunks.map(chunk => ({
          text: chunk.chunk_text.substring(0, 200) + '...',
          similarity: chunk.similarity
        })),
        confidence: Math.round(relevantChunks[0]?.similarity * 100) || 75
      };

    } catch (error) {
      logger.error('RAG question answering error:', error);
      return {
        answer: "I'm sorry, I encountered an error while processing your question. Please try again.",
        sources: [],
        confidence: 0
      };
    }
  }

  /**
   * Get processing status for a document
   */
  async getProcessingStatus(documentId) {
    try {
      const document = await supabaseService.getDocument(documentId);
      
      if (!document) {
        return { status: 'not_found' };
      }

      return {
        status: document.processing_status,
        progress: this.getProgressFromStatus(document.processing_status),
        processed_at: document.processed_at,
        error_message: document.error_message
      };
    } catch (error) {
      logger.error('Error getting processing status:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Batch process multiple documents
   */
  async batchProcessDocuments(documentIds, onStatusUpdate) {
    const results = [];
    
    for (let i = 0; i < documentIds.length; i++) {
      const documentId = documentIds[i];
      
      onStatusUpdate?.({
        stage: 'processing',
        message: `Processing document ${i + 1} of ${documentIds.length}`,
        progress: Math.round((i / documentIds.length) * 100),
        currentDocument: documentId
      });

      try {
        const document = await supabaseService.getDocument(documentId);
        if (document) {
          const result = await this.processDocument(documentId, document.file_path);
          results.push({ documentId, success: result.success, error: result.error });
        }
      } catch (error) {
        results.push({ documentId, success: false, error: error.message });
      }
    }

    onStatusUpdate?.({
      stage: 'complete',
      message: `Batch processing complete: ${results.filter(r => r.success).length}/${results.length} successful`,
      progress: 100
    });

    return results;
  }

  // Helper methods
  getMimeTypeFromFileName(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'csv': 'text/csv'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  getProgressFromStatus(status) {
    const progressMap = {
      'pending': 0,
      'processing': 50,
      'completed': 100,
      'failed': 0
    };
    return progressMap[status] || 0;
  }
}

// Create singleton instance
const documentProcessor = new DocumentProcessor();

export default documentProcessor;