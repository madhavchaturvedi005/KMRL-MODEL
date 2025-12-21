import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Download, ArrowLeft, CheckSquare, FileDown, Tag, Calendar, MessageCircle, Send, ExternalLink } from 'lucide-react';
import { documentStorage, StoredDocument } from '@/services/documentStorage';
import { geminiService } from '@/services/geminiService';
import { mockGeminiService } from '@/services/mockGeminiService';
import { toast } from '@/hooks/use-toast';

const mockDoc = {
  id: '1',
  title: 'Maintenance Circular: Alstom Trainset Axle Inspection',
  date: '2025-09-09T19:30:00',
  type: 'Maintenance',
  priority: 'high' as const,
  source: 'Maximo Exports',
  docId: 'DOC001',
  aiSummary:
    'A comprehensive maintenance directive has been issued requiring immediate ultrasonic inspection of all Alstom series-8 trainset axles. This action follows a critical safety alert from Delhi Metro regarding potential fatigue cracks in similar rolling stock. The inspection must be completed within 5 working days to ensure passenger safety and operational continuity.',
  actionItems: [
    'Schedule ultrasonic tests for all 12 series-8 trainsets by Sept 15, 2025',
    'Submit compliance report to Rolling Stock Manager by Sept 18, 2025',
    'Coordinate with Operations team for minimum service disruption',
  ],
  entities: [
    'Alstom series-8',
    'Ultrasonic Inspection',
    'Fatigue Crack',
    'Safety Protocol',
  ],
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

const DocumentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<StoredDocument | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    if (id) {
      const document = documentStorage.getDocumentById(id);
      setDoc(document);
    }
  }, [id]);

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !doc) return;
    
    setIsAskingAI(true);
    try {
      let response;
      try {
        response = await geminiService.askQuestion(doc.originalContent, aiQuestion);
      } catch (error) {
        console.warn('Gemini AI failed, using mock service:', error);
        response = await mockGeminiService.askQuestion(doc.originalContent, aiQuestion);
      }
      setAiResponse(response);
      setAiQuestion("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-2">Document not found</h2>
            <p className="text-muted-foreground mb-4">The requested document could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-lg font-semibold">Document Details</h1>
          </div>
          <div>
            <Badge className={`text-xs ${getPriorityColor(doc.priority)}`}>{doc.priority.toUpperCase()}</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: AI Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">{doc.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(doc.date).toLocaleString()}
                <span>•</span>
                {doc.type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-base font-semibold mb-2">AI Analysis Summary</h3>
                <p className="text-sm leading-relaxed text-gray-700">{doc.summary.detailed}</p>
              </section>

              <Separator />

              <section>
                <h3 className="text-base font-semibold mb-3">Key Points</h3>
                <div className="space-y-2">
                  {doc.summary.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="text-base font-semibold mb-3">Key Entities</h3>
                <div className="flex flex-wrap gap-2">
                  {doc.analysis.entities.map((entity, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Tag className="h-3 w-3 mr-1" />
                      {entity}
                    </Badge>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Ask AI Section */}
              <section>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Ask AI about this document
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question about this document..."
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={isAskingAI}
                    />
                    <Button
                      onClick={handleAskAI}
                      disabled={!aiQuestion.trim() || isAskingAI}
                      size="sm"
                      className="px-3"
                    >
                      {isAskingAI ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {aiResponse && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">AI Response:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </section>


            </CardContent>
          </Card>

          {/* Right: Metadata panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Information</CardTitle>
              <CardDescription>Metadata and analysis details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">File Name:</span>
                    <span className="text-right">{doc.fileData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span>{doc.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span>{doc.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <Badge className={`text-xs ${getPriorityColor(doc.priority)}`}>
                      {doc.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Processed:</span>
                    <span className="text-right">{new Date(doc.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">File Size:</span>
                    <span>{(doc.fileData.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">AI Confidence:</span>
                    <span>{doc.analysis.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Language:</span>
                    <span>{doc.analysis.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Document ID:</span>
                    <span className="text-right font-mono text-xs">{doc.id}</span>
                  </div>
                </div>

                <Separator />

                {/* Original Source Documents Section - Moved here */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Original Source Documents</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <div className="pt-1">
                      <Badge variant="secondary" className="text-xs">
                        Source: {doc.source}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
