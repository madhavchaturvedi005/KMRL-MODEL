import { supabase } from '@/lib/supabase';

export interface BackendDocument {
  id: string;
  title: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  document_type?: 'policy' | 'procedure' | 'report' | 'email' | 'technical' | 'financial' | 'other';
  priority: 'high' | 'medium' | 'low';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence_score?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  ai_summary?: string;
  key_points?: string[];
  entities?: string[];
  language: string;
  tags: string[];
}

export interface ProcessingStatus {
  stage: 'downloading' | 'extracting' | 'analyzing' | 'chunking' | 'embedding' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
}

export interface ChatResponse {
  success: boolean;
  question: string;
  answer: string;
  sources: Array<{
    text: string;
    similarity: number;
  }>;
  confidence: number;
  documentId: string;
  documentTitle: string;
  timestamp: string;
}

export class BackendApiService {
  private static baseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
  private static apiUrl = `${this.baseUrl}/api`;

  // Helper method to get auth headers
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Document Upload
  static async uploadDocument(
    file: File,
    options: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      tags?: string[];
      autoProcess?: boolean;
    } = {}
  ): Promise<{ success: boolean; document?: BackendDocument; error?: string }> {
    try {
      console.log('🚀 Starting document upload via backend API:', file.name);

      const formData = new FormData();
      formData.append('document', file);
      
      if (options.title) formData.append('title', options.title);
      if (options.priority) formData.append('priority', options.priority);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));
      if (options.autoProcess !== undefined) formData.append('autoProcess', String(options.autoProcess));

      const response = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('auth_token') && { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
          })
        },
        body: formData
      });

      const result = await this.handleResponse<{
        success: boolean;
        document: BackendDocument;
        message: string;
      }>(response);

      console.log('✅ Document uploaded successfully:', result.document.id);
      return { success: true, document: result.document };

    } catch (error) {
      console.error('❌ Upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  // Batch Upload
  static async uploadDocuments(
    files: File[],
    options: {
      priority?: 'high' | 'medium' | 'low';
      tags?: string[];
      autoProcess?: boolean;
    } = {}
  ): Promise<{ 
    success: boolean; 
    results?: { successful: any[]; failed: any[]; summary: any }; 
    error?: string 
  }> {
    try {
      console.log('🚀 Starting batch upload via backend API:', files.length, 'files');

      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      
      if (options.priority) formData.append('priority', options.priority);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));
      if (options.autoProcess !== undefined) formData.append('autoProcess', String(options.autoProcess));

      const response = await fetch(`${this.apiUrl}/upload/batch`, {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('auth_token') && { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
          })
        },
        body: formData
      });

      const result = await this.handleResponse<{
        success: boolean;
        results: { successful: any[]; failed: any[]; summary: any };
        message: string;
      }>(response);

      console.log('✅ Batch upload completed:', result.results.summary);
      return { success: true, results: result.results };

    } catch (error) {
      console.error('❌ Batch upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Batch upload failed' 
      };
    }
  }

  // Get Documents
  static async getDocuments(options: {
    limit?: number;
    offset?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    type?: string;
  } = {}): Promise<BackendDocument[]> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', String(options.limit));
      if (options.offset) params.append('offset', String(options.offset));
      if (options.status) params.append('status', options.status);
      if (options.type) params.append('type', options.type);

      const response = await fetch(`${this.apiUrl}/documents?${params}`, {
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        documents: BackendDocument[];
      }>(response);

      return result.documents || [];

    } catch (error) {
      console.error('❌ Get documents error:', error);
      return [];
    }
  }

  // Get Single Document
  static async getDocument(documentId: string): Promise<BackendDocument | null> {
    try {
      const response = await fetch(`${this.apiUrl}/documents/${documentId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        document: BackendDocument;
      }>(response);

      return result.document || null;

    } catch (error) {
      console.error('❌ Get document error:', error);
      return null;
    }
  }

  // Process Document
  static async processDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Starting document processing:', documentId);

      const response = await fetch(`${this.apiUrl}/ai/process/${documentId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        message: string;
      }>(response);

      console.log('✅ Document processing started:', result.message);
      return { success: true };

    } catch (error) {
      console.error('❌ Process document error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      };
    }
  }

  // Get Processing Status
  static async getProcessingStatus(documentId: string): Promise<{
    status: string;
    progress: number;
    processed_at?: string;
    error_message?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/ai/status/${documentId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        status: string;
        progress: number;
        processed_at?: string;
        error_message?: string;
      }>(response);

      return {
        status: result.status,
        progress: result.progress,
        processed_at: result.processed_at,
        error_message: result.error_message
      };

    } catch (error) {
      console.error('❌ Get processing status error:', error);
      return { status: 'error', progress: 0 };
    }
  }

  // Ask Question (RAG)
  static async askQuestion(
    documentId: string,
    question: string
  ): Promise<{ success: boolean; response?: ChatResponse; error?: string }> {
    try {
      console.log('🤖 Asking question:', question);

      const response = await fetch(`${this.apiUrl}/chat/ask/${documentId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ question })
      });

      const result = await this.handleResponse<ChatResponse>(response);

      console.log('✅ Got AI response with confidence:', result.confidence);
      return { success: true, response: result };

    } catch (error) {
      console.error('❌ Ask question error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get AI response' 
      };
    }
  }

  // Get Chat History
  static async getChatHistory(documentId: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/history/${documentId}?limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        chatHistory: any[];
      }>(response);

      return result.chatHistory || [];

    } catch (error) {
      console.error('❌ Get chat history error:', error);
      return [];
    }
  }

  // Search Documents
  static async searchDocuments(query: string, options: {
    limit?: number;
    threshold?: number;
  } = {}): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/search/semantic`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          query,
          limit: options.limit || 10,
          threshold: options.threshold || 0.7
        })
      });

      const result = await this.handleResponse<{
        success: boolean;
        results: any[];
      }>(response);

      return result.results || [];

    } catch (error) {
      console.error('❌ Search documents error:', error);
      return [];
    }
  }

  // Delete Document
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/documents/${documentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        message: string;
      }>(response);

      console.log('✅ Document deleted:', result.message);
      return true;

    } catch (error) {
      console.error('❌ Delete document error:', error);
      return false;
    }
  }

  // Update Document
  static async updateDocument(
    documentId: string,
    updates: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      tags?: string[];
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/documents/${documentId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      const result = await this.handleResponse<{
        success: boolean;
        document: BackendDocument;
      }>(response);

      console.log('✅ Document updated:', result.document.title);
      return true;

    } catch (error) {
      console.error('❌ Update document error:', error);
      return false;
    }
  }

  // Health Check
  static async healthCheck(): Promise<{ status: string; services: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await this.handleResponse<{
        status: string;
        services: any;
      }>(response);

      return result;

    } catch (error) {
      console.error('❌ Health check error:', error);
      return { status: 'unhealthy', services: {} };
    }
  }

  // AI Health Check
  static async aiHealthCheck(): Promise<{ status: string; services: any }> {
    try {
      const response = await fetch(`${this.apiUrl}/ai/health`, {
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        status: string;
        services: any;
      }>(response);

      return result;

    } catch (error) {
      console.error('❌ AI health check error:', error);
      return { status: 'unhealthy', services: {} };
    }
  }

  // Get Statistics
  static async getDocumentStats(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/documents/stats/overview`, {
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{
        success: boolean;
        stats: any;
      }>(response);

      return result.stats || {};

    } catch (error) {
      console.error('❌ Get document stats error:', error);
      return {};
    }
  }

  // Test Connection
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const health = await this.healthCheck();
      
      if (health.status === 'healthy') {
        return { 
          success: true, 
          message: `✅ Backend API connection successful! Services: ${Object.keys(health.services).join(', ')}` 
        };
      } else {
        return { 
          success: false, 
          message: `❌ Backend API unhealthy: ${health.status}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Backend API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Fallback to Supabase for documents if backend is unavailable
  static async getUserDocumentsFromSupabase(userId?: string): Promise<BackendDocument[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      // Only filter by user_id if it's provided and not a mock user
      if (userId && userId !== 'mock-admin-id') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get user documents from Supabase error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get user documents from Supabase error:', error);
      return [];
    }
  }
}