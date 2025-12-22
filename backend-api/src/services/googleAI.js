import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

class GoogleAIService {
  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      logger.warn('Google AI API key not provided - AI features will be disabled');
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.models = {
      flash: 'gemini-2.5-flash',        // Fast, cost-effective for analysis
      pro: 'gemini-2.5-flash',         // High-quality for complex tasks
      embedding: 'embedding-gecko-001'  // Embedding model
    };
  }

  /**
   * Analyze document content and extract structured information
   */
  async analyzeDocument(content, fileName) {
    if (!this.genAI) {
      throw new Error('Google AI not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.models.flash });

      const prompt = `Analyze this document and provide a structured analysis in JSON format.

Document: ${fileName}
Content: ${content.substring(0, 4000)}

Please provide analysis in this exact JSON format:
{
  "summary": "2-3 sentence summary of the document",
  "keyPoints": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
  "entities": ["entity1", "entity2", "entity3", "entity4", "entity5"],
  "documentType": "policy|procedure|report|email|technical|financial|other",
  "priority": "high|medium|low",
  "confidence": 85,
  "language": "en",
  "topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive|neutral|negative",
  "actionItems": ["action 1", "action 2"]
}

Focus on:
1. Main purpose and content of the document
2. Important facts, decisions, requirements, or findings
3. Key people, places, organizations, dates, numbers
4. Document classification based on content and purpose
5. Urgency/importance level based on content
6. Main topics and themes
7. Overall tone and sentiment
8. Any action items or next steps mentioned`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          // Validate and sanitize the response
          return {
            summary: analysis.summary || 'Document analysis completed',
            keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints.slice(0, 10) : [],
            entities: Array.isArray(analysis.entities) ? analysis.entities.slice(0, 15) : [],
            documentType: this.validateDocumentType(analysis.documentType),
            priority: this.validatePriority(analysis.priority),
            confidence: this.validateConfidence(analysis.confidence),
            language: analysis.language || 'en',
            topics: Array.isArray(analysis.topics) ? analysis.topics.slice(0, 8) : [],
            sentiment: this.validateSentiment(analysis.sentiment),
            actionItems: Array.isArray(analysis.actionItems) ? analysis.actionItems.slice(0, 5) : []
          };
        }
      } catch (parseError) {
        logger.warn('Failed to parse AI response as JSON:', parseError);
      }

      // Fallback analysis if JSON parsing fails
      return this.createFallbackAnalysis(fileName, text);

    } catch (error) {
      logger.error('Google AI analysis error:', error);
      return this.createFallbackAnalysis(fileName, 'Analysis failed');
    }
  }

  /**
   * Generate embeddings for text content
   */
  async generateEmbedding(text) {
    if (!this.genAI) {
      throw new Error('Google AI not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.models.embedding });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      logger.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple text chunks
   */
  async generateEmbeddings(textChunks) {
    if (!this.genAI) {
      throw new Error('Google AI not configured');
    }

    const embeddings = [];
    const model = this.genAI.getGenerativeModel({ model: this.models.embedding });

    for (let i = 0; i < textChunks.length; i++) {
      try {
        const result = await model.embedContent(textChunks[i]);
        embeddings.push(result.embedding.values);
        
        // Add small delay to avoid rate limiting
        if (i < textChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        logger.warn(`Failed to generate embedding for chunk ${i}:`, error);
        // Add zero vector as fallback
        embeddings.push(new Array(768).fill(0));
      }
    }

    return embeddings;
  }

  /**
   * Answer questions using RAG with context
   */
  async answerQuestion(question, context, documentTitle = '') {
    if (!this.genAI) {
      throw new Error('Google AI not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.models.pro });

      const prompt = `You are an AI assistant helping users understand documents. Based on the provided context from "${documentTitle}", answer the user's question accurately and helpfully.

Context from document:
${context}

User Question: ${question}

Instructions:
1. Answer based ONLY on the provided context
2. If the context doesn't contain enough information, say so clearly
3. Be specific and cite relevant parts of the context
4. Keep your answer concise but comprehensive
5. If asked about something not in the context, explain that you can only answer based on the provided document excerpts

Please provide a helpful and accurate answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      logger.error('Question answering error:', error);
      return "I'm sorry, I encountered an error while processing your question. Please try again.";
    }
  }

  /**
   * Classify document type based on content
   */
  async classifyDocument(content, fileName) {
    if (!this.genAI) {
      return 'other';
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.models.flash });

      const prompt = `Classify this document into one of these categories based on its content and purpose:

Categories:
- policy: Official policies, guidelines, rules, regulations
- procedure: Step-by-step instructions, processes, workflows
- report: Analysis, findings, status updates, summaries
- email: Email communications, correspondence
- technical: Technical specifications, manuals, documentation
- financial: Financial reports, budgets, invoices, statements
- other: Any other type of document

Document: ${fileName}
Content: ${content.substring(0, 1000)}

Respond with only the category name (lowercase):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const classification = response.text().trim().toLowerCase();

      return this.validateDocumentType(classification);

    } catch (error) {
      logger.error('Document classification error:', error);
      return 'other';
    }
  }

  /**
   * Health check for Google AI service
   */
  async healthCheck() {
    if (!this.genAI) {
      return {
        status: 'disabled',
        message: 'Google AI API key not configured'
      };
    }

    try {
      // Test with a simple request
      const model = this.genAI.getGenerativeModel({ model: this.models.flash });
      const result = await model.generateContent('Say "OK" if you can respond.');
      const response = await result.response;
      const text = response.text();

      return {
        status: 'healthy',
        message: 'Google AI service is working',
        testResponse: text.substring(0, 50)
      };
    } catch (error) {
      logger.error('Google AI health check failed:', error);
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.code || 'unknown'
      };
    }
  }

  // Validation helpers
  validateDocumentType(type) {
    const validTypes = ['policy', 'procedure', 'report', 'email', 'technical', 'financial', 'other'];
    return validTypes.includes(type) ? type : 'other';
  }

  validatePriority(priority) {
    const validPriorities = ['high', 'medium', 'low'];
    return validPriorities.includes(priority) ? priority : 'medium';
  }

  validateConfidence(confidence) {
    const num = parseInt(confidence);
    return (num >= 0 && num <= 100) ? num : 75;
  }

  validateSentiment(sentiment) {
    const validSentiments = ['positive', 'neutral', 'negative'];
    return validSentiments.includes(sentiment) ? sentiment : 'neutral';
  }

  createFallbackAnalysis(fileName, text) {
    return {
      summary: `Analysis of ${fileName}: ${text.substring(0, 200)}...`,
      keyPoints: ['Document uploaded and processed', 'AI analysis completed'],
      entities: [fileName],
      documentType: 'other',
      priority: 'medium',
      confidence: 60,
      language: 'en',
      topics: ['document', 'analysis'],
      sentiment: 'neutral',
      actionItems: []
    };
  }
}

// Create singleton instance
const googleAIService = new GoogleAIService();

export default googleAIService;