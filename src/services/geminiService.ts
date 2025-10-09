export interface DocumentAnalysis {
  title: string;
  type: string;
  department: string;
  summary: {
    headline: string;
    keyPoints: string[];
    detailed: string;
  };
  priority: 'high' | 'medium' | 'low';
  entities: string[];
  confidence: number;
  language: string;
}

export class GeminiService {
  private genAI: any = null;
  private model: any = null;
  private readonly API_KEY = '';
  private initialized = false;

  private async initializeAI(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(this.API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      return false;
    }
  }

  async analyzeDocument(fileContent: string, fileName: string): Promise<DocumentAnalysis> {
    try {
      // Try LangChain service first
      const { langchainService } = await import('@/services/langchainService');
      return await langchainService.analyzeDocument(fileContent, fileName);
    } catch (langchainError) {
      console.warn('LangChain analysis failed, trying direct Gemini:', langchainError);
      
      // Fallback to direct Gemini API
      const isInitialized = await this.initializeAI();
      
      if (!isInitialized || !this.model) {
        return this.createFallbackAnalysis(fileName, fileContent);
      }

      try {
        const prompt = `
          Analyze the following document and provide a structured analysis in JSON format:

          Document Name: ${fileName}
          Content: ${fileContent}

          Please provide the analysis in this exact JSON structure:
          {
            "title": "A concise title for the document",
            "type": "Document type (e.g., Safety Document, Financial Report, Policy, etc.)",
            "department": "Relevant department (Engineering, Finance, Operations, Safety, etc.)",
            "summary": {
              "headline": "One sentence summary",
              "keyPoints": ["3-5 key bullet points"],
              "detailed": "Detailed paragraph summary"
            },
            "priority": "high/medium/low based on urgency and importance",
            "entities": ["List of important entities, names, dates, amounts mentioned"],
            "confidence": "Confidence score as number between 0-100",
            "language": "Primary language of the document"
          }

          Focus on KMRL (Kochi Metro Rail Limited) context and identify transportation, safety, financial, or operational relevance.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }

        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      } catch (error) {
        console.error('Error analyzing document with direct Gemini:', error);
        return this.createFallbackAnalysis(fileName, fileContent);
      }
    }
  }

  async askQuestion(documentContent: string, question: string): Promise<string> {
    try {
      // Try LangChain service first
      const { langchainService } = await import('@/services/langchainService');
      return await langchainService.askQuestion(question, documentContent);
    } catch (langchainError) {
      console.warn('LangChain Q&A failed, trying direct Gemini:', langchainError);
      
      // Fallback to direct Gemini API
      const isInitialized = await this.initializeAI();
      
      if (!isInitialized || !this.model) {
        return 'AI service is currently unavailable. Please try again later.';
      }

      try {
        const prompt = `
          Based on the following document content, please answer the user's question:

          Document Content: ${documentContent}

          User Question: ${question}

          Please provide a clear, concise answer based only on the information available in the document. If the information is not available in the document, please state that clearly.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Error asking AI question with direct Gemini:', error);
        return 'Sorry, I encountered an error while processing your question. Please try again.';
      }
    }
  }

  private createFallbackAnalysis(fileName: string, fileContent: string): DocumentAnalysis {
    // Simple keyword-based analysis as fallback
    const content = fileContent.toLowerCase();
    
    // Determine type based on keywords
    let type = 'Document';
    let department = 'General';
    let priority: 'high' | 'medium' | 'low' = 'medium';
    
    if (content.includes('safety') || content.includes('emergency') || content.includes('accident')) {
      type = 'Safety Document';
      department = 'Safety';
      priority = 'high';
    } else if (content.includes('revenue') || content.includes('budget') || content.includes('financial')) {
      type = 'Financial Report';
      department = 'Finance';
    } else if (content.includes('maintenance') || content.includes('repair') || content.includes('technical')) {
      type = 'Maintenance Document';
      department = 'Engineering';
    } else if (content.includes('policy') || content.includes('procedure') || content.includes('guideline')) {
      type = 'Policy Document';
      department = 'Administration';
    }

    // Extract basic entities
    const entities: string[] = [];
    const words = fileContent.split(/\s+/);
    words.forEach(word => {
      if (word.match(/\d{4}-\d{2}-\d{2}/)) entities.push(word); // Dates
      if (word.match(/₹[\d,]+/)) entities.push(word); // Currency
      if (word.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/)) entities.push(word); // Names
    });

    return {
      title: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      type,
      department,
      summary: {
        headline: `Document uploaded and processed: ${fileName}`,
        keyPoints: [
          'Document has been uploaded successfully',
          'Content is ready for analysis',
          'Available for search and retrieval'
        ],
        detailed: `This document (${fileName}) has been uploaded and processed. The content is now available for search and analysis within the KMRL Knowledge Lens system.`
      },
      priority,
      entities: entities.slice(0, 5), // Limit to 5 entities
      confidence: 75,
      language: 'English'
    };
  }

  async extractTextFromFile(file: File): Promise<string> {
    try {
      const { FileProcessor } = await import('@/services/fileProcessor');
      return await FileProcessor.processFile(file);
    } catch (error) {
      console.error('File processing error:', error);
      
      // Ultimate fallback
      return `Document: ${file.name}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Type: ${file.type || 'Unknown'}
Uploaded: ${new Date().toISOString()}

Status: File processing failed
Error: ${error instanceof Error ? error.message : 'Unknown error'}

This document has been uploaded but content extraction failed.
For AI analysis, please try:
1. Converting to PDF format
2. Saving as plain text (.txt)
3. Ensuring the file is not corrupted or password-protected`;
    }
  }
}

export const geminiService = new GeminiService();
