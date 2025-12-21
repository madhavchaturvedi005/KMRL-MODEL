import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Database, Upload, MessageCircle } from 'lucide-react';
import { EnhancedDocumentService, EnhancedDocument } from '@/services/enhancedDocumentService';

export const DocumentTestPanel: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [documents, setDocuments] = useState<EnhancedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    testConnection();
    loadDocuments();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await EnhancedDocumentService.testConnection();
      setConnectionStatus(result);
      setTestResults(prev => ({ ...prev, connection: result.success }));
    } catch (error) {
      setConnectionStatus({ success: false, message: `Test failed: ${error}` });
      setTestResults(prev => ({ ...prev, connection: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await EnhancedDocumentService.getUserDocuments();
      setDocuments(docs);
      setTestResults(prev => ({ ...prev, documents: true }));
    } catch (error) {
      console.error('Failed to load documents:', error);
      setTestResults(prev => ({ ...prev, documents: false }));
    }
  };

  const testUpload = async () => {
    // Create a test file
    const testContent = `KMRL Test Document
    
This is a test document for the KMRL Document Intelligence System.

Key Information:
- System: Document Intelligence
- Organization: Kochi Metro Rail Limited
- Purpose: Testing Phase 1 Implementation
- Features: AI Analysis, Vector Search, Chat Interface

Test completed at: ${new Date().toISOString()}`;

    const testFile = new File([testContent], 'kmrl-test-document.txt', {
      type: 'text/plain'
    });

    setIsLoading(true);
    try {
      const result = await EnhancedDocumentService.uploadDocument(testFile, 'test-user');
      if (result.success) {
        setTestResults(prev => ({ ...prev, upload: true }));
        await loadDocuments(); // Refresh the list
      } else {
        setTestResults(prev => ({ ...prev, upload: false }));
      }
    } catch (error) {
      console.error('Upload test failed:', error);
      setTestResults(prev => ({ ...prev, upload: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const testAIChat = async (documentId: string) => {
    setIsLoading(true);
    try {
      const result = await EnhancedDocumentService.askDocumentQuestion(
        documentId,
        'What is this document about?',
        'test-user'
      );
      setTestResults(prev => ({ ...prev, aiChat: result.success }));
    } catch (error) {
      console.error('AI Chat test failed:', error);
      setTestResults(prev => ({ ...prev, aiChat: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined) return <Clock className="h-4 w-4 text-gray-400" />;
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Phase 1 System Test
          </CardTitle>
          <CardDescription>
            Test the core document intelligence system components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          {connectionStatus && (
            <div className={`p-3 rounded-lg border ${connectionStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.success)}
                <span className={connectionStatus.success ? 'text-green-800' : 'text-red-800'}>
                  {connectionStatus.message}
                </span>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.connection)}
              <span className="text-sm font-medium">Database Connection</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.documents)}
              <span className="text-sm font-medium">Document Loading</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.upload)}
              <span className="text-sm font-medium">File Upload</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.aiChat)}
              <span className="text-sm font-medium">AI Chat</span>
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button 
              onClick={testUpload} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Test Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
          <CardDescription>
            Documents in the enhanced system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents found. Try uploading a test document.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{doc.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(doc.processing_status)}`}>
                        {doc.processing_status}
                      </Badge>
                      {doc.document_type && (
                        <Badge variant="outline" className="text-xs">
                          {doc.document_type}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {doc.file_name} • {doc.source} • {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                    {doc.ai_summary && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {doc.ai_summary}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => testAIChat(doc.id)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Test AI
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};