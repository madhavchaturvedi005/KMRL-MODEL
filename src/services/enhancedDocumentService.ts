import { langchainService } from './langchainService';
import { documentStorage, StoredDocument } from './documentStorage';

export class EnhancedDocumentService {
  
  static async initializeKnowledgeBase(): Promise<void> {
    try {
      const documents = documentStorage.getAllDocuments();
      
      if (documents.length === 0) {
        console.log('No documents found for knowledge base initialization');
        return;
      }

      const vectorDocs = documents.map(doc => ({
        id: doc.id,
        content: doc.originalContent,
        metadata: {
          title: doc.title,
          type: doc.type,
          department: doc.department,
          priority: doc.priority,
          date: doc.date,
          source: doc.source,
        }
      }));

      await langchainService.setupVectorStore(vectorDocs);
      console.log(`Knowledge base initialized with ${documents.length} documents`);
      
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }

  static async askGlobalQuestion(question: string): Promise<string> {
    try {
      // This will use the vector store for RAG-based answers across all documents
      return await langchainService.askQuestion(question);
    } catch (error) {
      console.error('Global question failed:', error);
      return 'I encountered an error while searching the knowledge base. Please try rephrasing your question.';
    }
  }

  static async generateExecutiveSummary(documentId: string): Promise<string> {
    try {
      const document = documentStorage.getDocumentById(documentId);
      if (!document) {
        return 'Document not found.';
      }

      return await langchainService.generateSummary(document.originalContent, 'executive');
    } catch (error) {
      console.error('Executive summary generation failed:', error);
      return 'Failed to generate executive summary.';
    }
  }

  static async generateTechnicalSummary(documentId: string): Promise<string> {
    try {
      const document = documentStorage.getDocumentById(documentId);
      if (!document) {
        return 'Document not found.';
      }

      return await langchainService.generateSummary(document.originalContent, 'technical');
    } catch (error) {
      console.error('Technical summary generation failed:', error);
      return 'Failed to generate technical summary.';
    }
  }

  static async extractActionItems(documentId: string): Promise<string> {
    try {
      const document = documentStorage.getDocumentById(documentId);
      if (!document) {
        return 'Document not found.';
      }

      return await langchainService.generateSummary(document.originalContent, 'action-items');
    } catch (error) {
      console.error('Action items extraction failed:', error);
      return 'Failed to extract action items.';
    }
  }

  static async findSimilarDocuments(documentId: string, limit: number = 5): Promise<StoredDocument[]> {
    try {
      const document = documentStorage.getDocumentById(documentId);
      if (!document) {
        return [];
      }

      const allDocuments = documentStorage.getAllDocuments();
      
      // Simple similarity based on type and department for now
      // In a full implementation, this would use vector similarity
      const similar = allDocuments
        .filter(doc => doc.id !== documentId)
        .filter(doc => 
          doc.type === document.type || 
          doc.department === document.department ||
          doc.priority === document.priority
        )
        .slice(0, limit);

      return similar;
    } catch (error) {
      console.error('Similar documents search failed:', error);
      return [];
    }
  }

  static async searchDocuments(query: string): Promise<{
    documents: StoredDocument[];
    answer: string;
  }> {
    try {
      // Get AI answer using RAG
      const answer = await this.askGlobalQuestion(query);
      
      // Also return relevant documents
      const documents = documentStorage.searchDocuments(query);
      
      return {
        documents: documents.slice(0, 5), // Limit to top 5
        answer
      };
    } catch (error) {
      console.error('Document search failed:', error);
      return {
        documents: [],
        answer: 'Search failed. Please try again with different keywords.'
      };
    }
  }

  static async getDocumentInsights(documentId: string): Promise<{
    executiveSummary: string;
    technicalSummary: string;
    actionItems: string;
    entities: any;
    similarDocuments: StoredDocument[];
  }> {
    try {
      const document = documentStorage.getDocumentById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Generate all insights in parallel
      const [
        executiveSummary,
        technicalSummary,
        actionItems,
        entities,
        similarDocuments
      ] = await Promise.all([
        this.generateExecutiveSummary(documentId),
        this.generateTechnicalSummary(documentId),
        this.extractActionItems(documentId),
        langchainService.extractEntities(document.originalContent),
        this.findSimilarDocuments(documentId)
      ]);

      return {
        executiveSummary,
        technicalSummary,
        actionItems,
        entities,
        similarDocuments
      };
    } catch (error) {
      console.error('Document insights generation failed:', error);
      throw error;
    }
  }

  static async refreshKnowledgeBase(): Promise<void> {
    try {
      await this.initializeKnowledgeBase();
    } catch (error) {
      console.error('Knowledge base refresh failed:', error);
    }
  }
}

// Initialize knowledge base when service loads
EnhancedDocumentService.initializeKnowledgeBase();