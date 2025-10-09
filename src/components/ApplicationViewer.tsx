import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download } from 'lucide-react';
import { AuthService } from '@/services/authService';

interface ApplicationViewerProps {
  application: {
    id: string;
    full_name: string;
    id_document_url: string;
    id_document_filename?: string;
    live_photo_url: string;
    live_photo_filename?: string;
    id_type: string;
  };
}

const ApplicationViewer: React.FC<ApplicationViewerProps> = ({ application }) => {
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [livePhotoUrl, setLivePhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const viewDocument = async (type: 'id' | 'photo') => {
    setLoading(true);
    try {
      // Extract filename from stored URL
      const url = type === 'id' ? application.id_document_url : application.live_photo_url;
      const fileName = url.split('/').pop()?.split('?')[0];
      
      if (fileName) {
        const bucket = type === 'id' ? 'id-documents' : 'live-photos';
        const signedUrl = await AuthService.getFileUrl(bucket, fileName);
        
        if (signedUrl) {
          if (type === 'id') {
            setIdDocumentUrl(signedUrl);
          } else {
            setLivePhotoUrl(signedUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error viewing file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Documents for {application.full_name}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ID Document */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">
            {application.id_type.replace('_', ' ').toUpperCase()} Document
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {application.id_document_filename || 'ID Document'}
          </p>
          
          <div className="space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => viewDocument('id')}
                  disabled={loading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>ID Document - {application.full_name}</DialogTitle>
                </DialogHeader>
                {idDocumentUrl && (
                  <div className="mt-4">
                    <img 
                      src={idDocumentUrl} 
                      alt="ID Document" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (idDocumentUrl) {
                  const link = document.createElement('a');
                  link.href = idDocumentUrl;
                  link.download = application.id_document_filename || 'id-document';
                  link.click();
                }
              }}
              disabled={!idDocumentUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Live Photo */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Live Photo</h4>
          <p className="text-sm text-gray-600 mb-3">
            {application.live_photo_filename || 'Live Photo'}
          </p>
          
          <div className="space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => viewDocument('photo')}
                  disabled={loading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Live Photo - {application.full_name}</DialogTitle>
                </DialogHeader>
                {livePhotoUrl && (
                  <div className="mt-4">
                    <img 
                      src={livePhotoUrl} 
                      alt="Live Photo" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (livePhotoUrl) {
                  const link = document.createElement('a');
                  link.href = livePhotoUrl;
                  link.download = application.live_photo_filename || 'live-photo';
                  link.click();
                }
              }}
              disabled={!livePhotoUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationViewer;