import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabase } from '@/lib/supabase';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  entities: string[];
  documentType: 'policy' | 'procedure' | 'report' | 'email' | 'technical' | 'financial' | 'other';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  language: string;
}

export interface ProcessingStatus {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'embedding' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
}

export class LangChainDocumentProcessor {
  private static textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  /**
   * Process a document end-to-end with real-time status updates
   */
  static async processDocument(
    file: File,
    documentId: string,
    onStatusUpdate?: (status: ProcessingStatus) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Stage 1: Extract text
      onStatusUpdate?.({
        stage: 'extracting',
        message: 'Extracting text from document...',
        progress: 20
      });

      const textContent = await this.extractTextFromFile(file);
      
      if (!textContent || textContent.trim().length < 50) {
        throw new Error('Could not extract meaningful text from document');
      }

      // Stage 2: Analyze with Google AI
      onStatusUpdate?.({
        stage: 'analyzing',
        message: 'Analyzing document with AI...',
        progress: 40
      });

      const analysis = await this.analyzeDocumentWithGoogleAI(textContent, file.name);

      // Stage 3: Generate embeddings and chunks
      onStatusUpdate?.({
        stage: 'embedding',
        message: 'Creating embeddings for search...',
        progress: 60
      });

      const chunks = await this.createDocumentChunks(textContent, documentId);
      const embeddings = await this.generateEmbeddingsForChunks(chunks);

      // Stage 4: Save to database
      onStatusUpdate?.({
        stage: 'saving',
        message: 'Saving analysis results...',
        progress: 80
      });

      await this.saveAnalysisResults(documentId, analysis, chunks, embeddings);

      // Stage 5: Complete
      onStatusUpdate?.({
        stage: 'complete',
        message: 'Document processing complete!',
        progress: 100
      });

      return { success: true };

    } catch (error) {
      console.error('Document processing error:', error);
      
      onStatusUpdate?.({
        stage: 'error',
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Extract text from different file types
   */
  static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    
    try {
      if (fileType.includes('pdf')) {
        return await this.extractFromPDF(file);
      } else if (fileType.includes('text')) {
        return await this.extractFromText(file);
      } else if (fileType.includes('word') || fileType.includes('document')) {
        return await this.extractFromWord(file);
      } else if (fileType.includes('sheet') || fileType.includes('excel')) {
        return await this.extractFromExcel(file);
      } else {
        // Try to read as text
        return await this.extractFromText(file);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from ${file.name}`);
    }
  }

  private static async extractFromPDF(file: File): Promise<string> {
    // For now, return a placeholder - we'll implement PDF parsing
    const text = await file.text();
    return text || `PDF document: ${file.name}\n\nContent extraction will be implemented with pdf-parse library.`;
  }

  private static async extractFromText(file: File): Promise<string> {
    return await file.text();
  }

  private static async extractFromWord(file: File): Promise<string> {
    // Placeholder for Word document extraction
    return `Word document: ${file.name}\n\nContent extraction will be implemented with mammoth library.`;
  }

  private static async extractFromExcel(file: File): Promise<string> {
    // Placeholder for Excel extraction
    return `Excel document: ${file.name}\n\nContent extraction will be implemented with xlsx library.`;
  }

  /**
   * Analyze document content with Google AI
   */
  static async analyzeDocumentWithGoogleAI(
    content: string, 
    fileName: string
  ): Promise<DocumentAnalysis> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this document and provide a structured analysis in JSON format.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Please provide analysis in this exact JSON format:
{
  "summary": "2-3 sentence summary of the document",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "entities": ["entity1", "entity2", "entity3"],
  "documentType": "policy|procedure|report|email|technical|financial|other",
  "priority": "high|medium|low",
  "confidence": 85,
  "language": "en"
}

Focus on:
1. Main purpose and content
2. Important facts, decisions, or requirements
3. Key people, places, organizations, dates
4. Document classification
5. Urgency/importance level`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          // Validate required fields
          return {
            summary: analysis.summary || 'Document analysis completed',
            keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
            entities: Array.isArray(analysis.entities) ? analysis.entities : [],
            documentType: analysis.documentType || 'other',
            priority: analysis.priority || 'medium',
            confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 75,
            language: analysis.language || 'en'
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON:', parseError);
      }

      // Fallback analysis
      return {
        summary: `Analysis of ${fileName}: ${text.substring(0, 200)}...`,
        keyPoints: ['Document uploaded and processed', 'AI analysis completed'],
        entities: [fileName],
        documentType: 'other',
        priority: 'medium',
        confidence: 60,
        language: 'en'
      };

    } catch (error) {
      console.error('Google AI analysis error:', error);
      
      // Return basic analysis on error
      return {
        summary: `Document ${fileName} has been uploaded and is ready for review.`,
        keyPoints: ['Document uploaded successfully', 'Manual review may be needed'],
        entities: [fileName],
        documentType: 'other',
        priority: 'medium',
        confidence: 50,
        language: 'en'
      };
    }
  }

  /**
   * Create document chunks for vector search
   */
  static async createDocumentChunks(
    content: string, 
    documentId: string
  ): Promise<Document[]> {
    const docs = [new Document({ pageContent: content, metadata: { documentId } })];
    return await this.textSplitter.splitDocuments(docs);
  }

  /**
   * Generate embeddings for document chunks
   */
  static async generateEmbeddingsForChunks(chunks: Document[]): Promise<number[][]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      
      const embeddings: number[][] = [];
      
      for (const chunk of chunks) {
        try {
          const result = await model.embedContent(chunk.pageContent);
          embeddings.push(result.embedding.values);
        } catch (error) {
          console.warn('Failed to generate embedding for chunk:', error);
          // Add zero vector as fallback
          embeddings.push(new Array(768).fill(0));
        }
      }
      
      return embeddings;
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Return zero vectors as fallback
      return chunks.map(() => new Array(768).fill(0));
    }
  }

  /**
   * Save analysis results to Supabase
   */
  static async saveAnalysisResults(
    documentId: string,
    analysis: DocumentAnalysis,
    chunks: Document[],
    embeddings: number[][]
  ): Promise<void> {
    try {
      // Update document with analysis
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          ai_summary: analysis.summary,
          key_points: analysis.keyPoints,
          entities: analysis.entities,
          document_type: analysis.documentType,
          priority: analysis.priority,
          confidence_score: analysis.confidence,
          language: analysis.language,
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        throw updateError;
      }

      // Save document chunks with embeddings
      const chunkData = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_text: chunk.pageContent,
        chunk_index: index,
        chunk_tokens: Math.ceil(chunk.pageContent.length / 4),
        embedding: embeddings[index]
      }));

      const { error: chunksError } = await supabase
        .from('document_chunks')
        .insert(chunkData);

      if (chunksError) {
        throw chunksError;
      }

    } catch (error) {
      console.error('Failed to save analysis results:', error);
      
      // Mark document as failed
      await supabase
        .from('documents')
        .update({
          processing_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);
      
      throw error;
    }
  }

  /**
   * Search similar documents using vector similarity
   */
  static async searchSimilarDocuments(
    query: string,
    documentId?: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Generate embedding for query
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(query);
      const queryEmbedding = result.embedding.values;

      // Search using Supabase vector similarity
      const { data, error } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit,
        doc_id: documentId || null
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }

  /**
   * Ask a question about a document using RAG
   */
  static async askDocumentQuestion(
    documentId: string,
    question: string
  ): Promise<{ answer: string; sources: string[] }> {
    try {
      // Get relevant chunks
      const relevantChunks = await this.searchSimilarDocuments(question, documentId, 5);
      
      if (relevantChunks.length === 0) {
        return {
          answer: "I couldn't find relevant information in this document to answer your question.",
          sources: []
        };
      }

      // Build context from chunks
      const context = relevantChunks
        .map((chunk, index) => `[${index + 1}] ${chunk.chunk_text}`)
        .join('\n\n');

      // Generate answer using Google AI
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Based on the following document excerpts, answer the user's question. If the information isn't available in the excerpts, say so clearly.

Context:
${context}

Question: ${question}

Please provide a helpful and accurate answer based only on the provided context. If you reference specific information, mention which excerpt number it came from.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      return {
        answer,
        sources: relevantChunks.map(chunk => chunk.chunk_text.substring(0, 100) + '...')
      };

    } catch (error) {
      console.error('RAG question answering error:', error);
      return {
        answer: "I'm sorry, I encountered an error while processing your question. Please try again.",
        sources: []
      };
    }
  }
}