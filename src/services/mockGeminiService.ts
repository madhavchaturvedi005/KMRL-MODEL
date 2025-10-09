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

export class MockGeminiService {
  async analyzeDocument(fileContent: string, fileName: string): Promise<DocumentAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple keyword-based analysis
    const content = fileContent.toLowerCase();
    
    // Determine type based on keywords
    let type = 'Document';
    let department = 'General';
    let priority: 'high' | 'medium' | 'low' = 'medium';
    
    if (content.includes('safety') || content.includes('emergency') || content.includes('accident') || content.includes('urgent')) {
      type = 'Safety Document';
      department = 'Safety';
      priority = 'high';
    } else if (content.includes('revenue') || content.includes('budget') || content.includes('financial') || content.includes('cost')) {
      type = 'Financial Report';
      department = 'Finance';
    } else if (content.includes('maintenance') || content.includes('repair') || content.includes('technical') || content.includes('engineering')) {
      type = 'Technical Document';
      department = 'Engineering';
    } else if (content.includes('policy') || content.includes('procedure') || content.includes('guideline') || content.includes('rule')) {
      type = 'Policy Document';
      department = 'Administration';
    } else if (content.includes('train') || content.includes('metro') || content.includes('station') || content.includes('passenger')) {
      type = 'Operations Document';
      department = 'Operations';
    }

    // Extract basic entities
    const entities: string[] = [];
    const words = fileContent.split(/\s+/);
    
    // Look for dates
    words.forEach(word => {
      if (word.match(/\d{4}-\d{2}-\d{2}/) || word.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
        entities.push(word);
      }
      if (word.match(/₹[\d,]+/) || word.match(/\$[\d,]+/)) {
        entities.push(word);
      }
    });

    // Add some common KMRL entities
    if (content.includes('aluva')) entities.push('Aluva Station');
    if (content.includes('kochi')) entities.push('Kochi Metro');
    if (content.includes('kmrl')) entities.push('KMRL');
    if (content.includes('alstom')) entities.push('Alstom');

    // Generate key points based on content
    const keyPoints = [];
    if (content.includes('inspection') || content.includes('check')) {
      keyPoints.push('Inspection procedures outlined');
    }
    if (content.includes('deadline') || content.includes('due')) {
      keyPoints.push('Time-sensitive actions required');
    }
    if (content.includes('compliance') || content.includes('regulation')) {
      keyPoints.push('Regulatory compliance requirements');
    }
    if (content.includes('budget') || content.includes('cost')) {
      keyPoints.push('Financial implications identified');
    }
    if (content.includes('safety') || content.includes('risk')) {
      keyPoints.push('Safety considerations highlighted');
    }

    // Fallback key points
    if (keyPoints.length === 0) {
      keyPoints.push('Document content processed and analyzed');
      keyPoints.push('Key information extracted for review');
      keyPoints.push('Available for further analysis and search');
    }

    const title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
      title,
      type,
      department,
      summary: {
        headline: `${type} processed: ${title}`,
        keyPoints: keyPoints.slice(0, 5),
        detailed: `This ${type.toLowerCase()} has been analyzed and processed for the ${department} department. The document contains relevant information for KMRL operations and has been classified as ${priority} priority based on its content and context.`
      },
      priority,
      entities: [...new Set(entities)].slice(0, 8), // Remove duplicates and limit
      confidence: Math.floor(Math.random() * 20) + 80, // Random confidence between 80-100
      language: 'English'
    };
  }

  async askQuestion(documentContent: string, question: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = documentContent.toLowerCase();
    const q = question.toLowerCase();
    
    // Simple keyword matching for common questions
    if (q.includes('what') && q.includes('about')) {
      return `Based on the document content, this appears to be related to KMRL operations. The document contains information about various aspects of metro operations, safety procedures, or administrative matters.`;
    }
    
    if (q.includes('when') || q.includes('date')) {
      const dateMatch = documentContent.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
      if (dateMatch) {
        return `The document mentions the date: ${dateMatch[0]}`;
      }
      return `I couldn't find specific date information in this document.`;
    }
    
    if (q.includes('who') || q.includes('person') || q.includes('responsible')) {
      return `The document appears to be related to KMRL operations. For specific personnel information, please refer to the original document or contact the relevant department.`;
    }
    
    if (q.includes('cost') || q.includes('money') || q.includes('budget')) {
      const moneyMatch = documentContent.match(/₹[\d,]+|\$[\d,]+/);
      if (moneyMatch) {
        return `The document mentions financial amounts: ${moneyMatch[0]}`;
      }
      return `I couldn't find specific financial information in this document.`;
    }
    
    if (q.includes('safety') || q.includes('risk')) {
      if (content.includes('safety') || content.includes('risk')) {
        return `This document contains safety-related information. Please review the safety protocols and procedures mentioned in the document carefully.`;
      }
      return `This document doesn't appear to contain specific safety information.`;
    }
    
    // Generic response
    return `Based on the document content, I can see this is a KMRL-related document. For specific details about "${question}", please review the full document content or contact the relevant department for clarification.`;
  }

  async extractTextFromFile(file: File): Promise<string> {
    try {
      // Try to use the real file processor first
      const { FileProcessor } = await import('@/services/fileProcessor');
      return await FileProcessor.processFile(file);
    } catch (error) {
      console.warn('Real file processor failed, using mock content:', error);
      
      // Fallback to mock content based on file type
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const samplePdfContent = `KMRL Safety Circular - Platform Enhancement Project

Date: ${new Date().toLocaleDateString()}
Document ID: SC-${Date.now()}
Department: Engineering & Safety

SUBJECT: Enhanced Safety Protocols for Aluva Station Platform Work

This circular outlines mandatory safety requirements for all personnel involved in the platform enhancement project at Aluva Station.

KEY REQUIREMENTS:
1. All workers must wear approved hard hats and safety vests
2. Safety barriers must be maintained at all times
3. Emergency evacuation procedures have been updated
4. Daily safety briefings are mandatory before work begins
5. Incident reporting must be completed within 2 hours

COMPLIANCE:
- Project Manager: Rajesh Kumar
- Safety Officer: Priya Sharma
- Completion Deadline: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

This is a HIGH PRIORITY document requiring immediate attention and compliance.

For questions, contact the Safety Department at ext. 2345.`;

        return `Document: ${file.name}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Type: PDF Document (Mock Content)
Uploaded: ${new Date().toISOString()}

Content:
${samplePdfContent}`;
      }
      
      // For other file types, return generic mock content
      return `Document: ${file.name}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Type: ${fileType || 'Unknown'} (Mock Content)
Uploaded: ${new Date().toISOString()}

Content:
KMRL Document - ${file.name}

This is mock content for demonstration purposes.
The document contains information relevant to Kochi Metro Rail Limited operations,
including operational procedures, safety guidelines, financial data,
or administrative information pertaining to metro services.

Status: Mock processing - real content extraction failed
Note: For actual content extraction, please ensure proper file format and browser compatibility.`;
    }
  }
}

export const mockGeminiService = new MockGeminiService();