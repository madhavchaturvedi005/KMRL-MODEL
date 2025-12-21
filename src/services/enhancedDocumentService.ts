import { supabase } from '@/lib/supabase';
import { BackendApiService, type BackendDocument, type ChatResponse } from './backendApiService';

export interface EnhancedDocument {
  id: string;
  title: string;
  file_path: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  source?: 'upload' | 'google_drive' | 'sharepoint' | 'gmail';
  document_type?: 'policy' | 'procedure' | 'report' | 'email' | 'technical' | 'financial' | 'other';
  department?: string;
  priority: 'high' | 'medium' | 'low';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence_score?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  metadata?: Record<string, any>;
  tags: string[];
  ai_summary?: string;
  key_points?: string[];
  entities?: string[];
  language?: string;
}

export interface DocumentChat {
  id: string;
  document_id: string;
  user_id?: string;
  question: string;
  answer: string;
  context_chunks?: string[];
  confidence_score?: number;
  created_at: string;
}

export class EnhancedDocumentService {
  private static useBackendApi = import.meta.env.VITE_USE_BACKEND_API !== 'false'; // Default to true

  // Document Management
  static async uploadDocument(
    file: File, 
    userId?: string, 
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; document?: EnhancedDocument; error?: string }> {
    try {
      console.log('🚀 Starting document upload:', file.name);

      // Use Backend API if available
      if (this.useBackendApi) {
        const result = await BackendApiService.uploadDocument(file, {
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
          priority: metadata.priority || 'medium',
          tags: metadata.tags || [],
          autoProcess: metadata.autoProcess !== false
        });

        if (result.success && result.document) {
          // Convert BackendDocument to EnhancedDocument format
          const enhancedDoc: EnhancedDocument = {
            ...result.document,
            file_name: file.name,
            source: 'upload' as const,
            metadata: metadata,
            language: result.document.language || 'en'
          };
          return { success: true, document: enhancedDoc };
        } else {
          return { success: false, error: result.error };
        }
      }

      // Fallback to direct Supabase upload (legacy method)
      console.log('📦 Using fallback Supabase upload...');

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = userId ? `${userId}/${fileName}` : fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return { success: false, error: 'Failed to upload file' };
      }

      console.log('✅ File uploaded to:', uploadData.path);

      // 2. Insert document metadata
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          file_path: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          source: 'upload',
          user_id: userId,
          metadata: {
            ...metadata,
            original_name: file.name,
            upload_timestamp: new Date().toISOString()
          },
          processing_status: 'pending',
          tags: metadata.tags || [],
          priority: metadata.priority || 'medium',
          language: 'en'
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        return { success: false, error: 'Failed to save document metadata' };
      }

      console.log('✅ Document metadata saved:', document.id);
      return { success: true, document };
    } catch (error) {
      console.error('❌ Upload document error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  static async getDocument(documentId: string): Promise<EnhancedDocument | null> {
    try {
      // Try Backend API first
      if (this.useBackendApi) {
        const document = await BackendApiService.getDocument(documentId);
        if (document) {
          return {
            ...document,
            file_name: document.title,
            source: 'upload' as const,
            metadata: {},
            language: document.language || 'en'
          };
        }
      }

      // Fallback to Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Get document error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get document error:', error);
      return null;
    }
  }

  static async getUserDocuments(userId?: string): Promise<EnhancedDocument[]> {
    try {
      // Try Backend API first
      if (this.useBackendApi) {
        const documents = await BackendApiService.getDocuments({ limit: 100 });
        return documents.map(doc => ({
          ...doc,
          file_name: doc.title,
          source: 'upload' as const,
          metadata: {},
          language: doc.language || 'en'
        }));
      }

      // Fallback to Supabase
      return await BackendApiService.getUserDocumentsFromSupabase(userId);
    } catch (error) {
      console.error('Get user documents error:', error);
      return [];
    }
  }

  static async updateDocumentStatus(
    documentId: string, 
    status: EnhancedDocument['processing_status'],
    additionalData: Partial<EnhancedDocument> = {}
  ): Promise<boolean> {
    try {
      // Backend API handles this automatically during processing
      if (this.useBackendApi) {
        // For now, just return true as the backend handles status updates
        return true;
      }

      // Fallback to direct Supabase update
      const updateData: any = {
        processing_status: status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      if (status === 'completed') {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) {
        console.error('Update document status error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update document status error:', error);
      return false;
    }
  }

  // Process Document with Backend API
  static async processDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useBackendApi) {
        return await BackendApiService.processDocument(documentId);
      }

      // Fallback - just update status to processing
      await this.updateDocumentStatus(documentId, 'processing');
      return { success: true };
    } catch (error) {
      console.error('Process document error:', error);
      return { success: false, error: 'Failed to start processing' };
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
      if (this.useBackendApi) {
        return await BackendApiService.getProcessingStatus(documentId);
      }

      // Fallback - get from Supabase
      const document = await this.getDocument(documentId);
      return {
        status: document?.processing_status || 'pending',
        progress: document?.processing_status === 'completed' ? 100 : 
                 document?.processing_status === 'processing' ? 50 : 0,
        processed_at: document?.processed_at,
        error_message: undefined
      };
    } catch (error) {
      console.error('Get processing status error:', error);
      return { status: 'error', progress: 0 };
    }
  }

  // AI Chat
  static async askDocumentQuestion(
    documentId: string,
    question: string,
    userId?: string
  ): Promise<{ success: boolean; answer?: string; sources?: any[]; confidence?: number; error?: string }> {
    try {
      console.log('🤖 Asking question via Backend API:', question);

      // Use Backend API for RAG
      if (this.useBackendApi) {
        const result = await BackendApiService.askQuestion(documentId, question);
        
        if (result.success && result.response) {
          return {
            success: true,
            answer: result.response.answer,
            sources: result.response.sources,
            confidence: result.response.confidence
          };
        } else {
          return { success: false, error: result.error };
        }
      }

      // Fallback to mock response
      return {
        success: true,
        answer: `Mock AI Response: Based on the document, here's what I found about "${question}". This is a placeholder response since the backend API is not available. The actual AI system will provide detailed answers based on document content.`,
        sources: [],
        confidence: 75
      };
    } catch (error) {
      console.error('Ask document question error:', error);
      return { success: false, error: 'Failed to get AI response' };
    }
  }

  static async getChatHistory(documentId: string, userId?: string): Promise<DocumentChat[]> {
    try {
      // Use Backend API for chat history
      if (this.useBackendApi) {
        const history = await BackendApiService.getChatHistory(documentId);
        return history.map((chat: any) => ({
          id: chat.id,
          document_id: chat.document_id,
          user_id: chat.user_id,
          question: chat.question,
          answer: chat.answer,
          context_chunks: chat.context_chunks || [],
          confidence_score: chat.confidence_score,
          created_at: chat.created_at
        }));
      }

      // Fallback to Supabase
      let query = supabase
        .from('document_chats')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get chat history error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get chat history error:', error);
      return [];
    }
  }

  private static async saveChatHistory(
    documentId: string,
    question: string,
    answer: string,
    userId?: string,
    contextChunks: string[] = []
  ): Promise<void> {
    try {
      await supabase
        .from('document_chats')
        .insert({
          document_id: documentId,
          user_id: userId,
          question,
          answer,
          context_chunks: contextChunks
        });
    } catch (error) {
      console.error('Save chat history error:', error);
    }
  }

  // Utility Methods
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Use Backend API if available
      if (this.useBackendApi) {
        return await BackendApiService.deleteDocument(documentId);
      }

      // Fallback to direct Supabase deletion
      const document = await this.getDocument(documentId);
      if (!document) return false;

      // Delete file from storage
      await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      // Delete document record (cascades to chunks, chats, etc.)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Delete document error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete document error:', error);
      return false;
    }
  }

  static getFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  static async downloadDocument(documentId: string): Promise<Blob | null> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) return null;

      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Download document error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Download document error:', error);
      return null;
    }
  }

  // Test function to verify setup
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test Backend API first
      if (this.useBackendApi) {
        const backendTest = await BackendApiService.testConnection();
        if (backendTest.success) {
          return backendTest;
        } else {
          console.warn('Backend API test failed, falling back to Supabase test');
        }
      }

      // Test database connection
      const { error } = await supabase
        .from('documents')
        .select('count')
        .limit(1);

      if (error) {
        return { success: false, message: `Database error: ${error.message}` };
      }

      // Test storage connection
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        return { success: false, message: `Storage error: ${storageError.message}` };
      }

      const hasDocumentsBucket = buckets.some(bucket => bucket.name === 'documents');
      
      if (!hasDocumentsBucket) {
        return { success: false, message: 'Documents storage bucket not found' };
      }

      return { 
        success: true, 
        message: `✅ Supabase connection successful! Found ${buckets.length} storage buckets.` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error}` 
      };
    }
  }

  // Search Documents
  static async searchDocuments(query: string, options: {
    limit?: number;
    threshold?: number;
  } = {}): Promise<any[]> {
    try {
      if (this.useBackendApi) {
        return await BackendApiService.searchDocuments(query, options);
      }

      // Fallback to simple text search in Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`title.ilike.%${query}%,ai_summary.ilike.%${query}%`)
        .limit(options.limit || 10);

      if (error) {
        console.error('Search documents error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Search documents error:', error);
      return [];
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
      if (this.useBackendApi) {
        return await BackendApiService.updateDocument(documentId, updates);
      }

      // Fallback to Supabase
      const { error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        console.error('Update document error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update document error:', error);
      return false;
    }
  }

  // Get Document Statistics
  static async getDocumentStats(): Promise<any> {
    try {
      if (this.useBackendApi) {
        return await BackendApiService.getDocumentStats();
      }

      // Fallback to basic Supabase stats
      const { data, error } = await supabase
        .from('documents')
        .select('processing_status, document_type, created_at');

      if (error) {
        console.error('Get document stats error:', error);
        return {};
      }

      const stats = {
        total: data.length,
        byStatus: {
          pending: data.filter(d => d.processing_status === 'pending').length,
          processing: data.filter(d => d.processing_status === 'processing').length,
          completed: data.filter(d => d.processing_status === 'completed').length,
          failed: data.filter(d => d.processing_status === 'failed').length
        },
        byType: {}
      };

      return stats;
    } catch (error) {
      console.error('Get document stats error:', error);
      return {};
    }
  }
}