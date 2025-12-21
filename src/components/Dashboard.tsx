import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Search, FileText, Brain, Users, Zap, MessageCircle, TrendingUp, LogOut, User, Settings, Upload, X, File, Loader2, Link, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "@/hooks/use-toast";
import { DocumentCard } from "./DocumentCard";
import { AIAssistant } from "./AIAssistant";
import { ProjectTracker } from "./ProjectTracker";
import { SearchInterface } from "./SearchInterface";
import { EnhancedSearchInterface } from "./EnhancedSearchInterface";
import { EnhancedProjectCard } from "./EnhancedProjectCard";
import { MinimalProjectCard } from "./MinimalProjectCard";
import { MinimalDocumentCard } from "./MinimalDocumentCard";
import { CompactDocumentCard } from "./CompactDocumentCard";
import { geminiService } from "@/services/geminiService";
import { mockGeminiService } from "@/services/mockGeminiService";
import { EnhancedDocumentService, EnhancedDocument } from "@/services/enhancedDocumentService";
import { projectStorage, Project } from "@/services/projectStorage";
import { DocumentTestPanel } from "./DocumentTestPanel";
import { CreateProjectDialog } from "./CreateProjectDialog";





const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'text/plain' ||
      file.type === 'text/csv'
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, Word, Excel, and text files are supported.",
        variant: "destructive",
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        try {
          // For mock user, don't pass user_id to avoid RLS issues
          const userId = user?.id === 'mock-admin-id' ? undefined : user?.id;
          const result = await EnhancedDocumentService.uploadDocument(file, userId);
          if (!result.success) {
            throw new Error(result.error || 'Upload failed');
          }
          return result.document;
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          toast({
            title: "File Upload Error",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          return null;
        }
      });

      const uploadedDocuments = await Promise.all(uploadPromises);
      const successfulUploads = uploadedDocuments.filter(doc => doc !== null);
      
      if (successfulUploads.length > 0) {
        toast({
          title: "Upload Complete",
          description: `${successfulUploads.length} file(s) uploaded successfully and queued for processing.`,
        });
      }
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the documents list
      await loadDocuments();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <div 
        className={`p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">Upload Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Fully Supported:</strong> PDF, TXT, CSV, JSON</p>
            <p><strong>Basic Support:</strong> DOC, DOCX, XLS, XLSX</p>
            <p><strong>Max Size:</strong> 10MB per file</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="border-t p-4">
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button 
            className="w-full" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAI, setShowAI] = useState(false);
  const [storedDocuments, setStoredDocuments] = useState<EnhancedDocument[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load documents and projects from Supabase on component mount
  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, []);

  const loadDocuments = async () => {
    try {
      // For mock user, don't filter by user_id - get all documents
      const userId = user?.id === 'mock-admin-id' ? undefined : user?.id;
      const documents = await EnhancedDocumentService.getUserDocuments(userId);
      setStoredDocuments(documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const loadProjects = () => {
    // Initialize and load projects (keeping existing project logic for now)
    projectStorage.initializeDefaultProjects();
    const allProjects = projectStorage.getAllProjects();
    setProjects(allProjects);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Upload Dialog Component
  const UploadDialog = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
      }
    };

    const handleFiles = (files: File[]) => {
      const validFiles = files.filter(file => 
        file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'text/plain' ||
        file.type === 'text/csv'
      );

      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, Word, Excel, and text files are supported.",
          variant: "destructive",
        });
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) return;
      
      setIsUploading(true);
      
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            // For mock user, don't pass user_id to avoid RLS issues
            const userId = user?.id === 'mock-admin-id' ? undefined : user?.id;
            const result = await EnhancedDocumentService.uploadDocument(file, userId);
            if (!result.success) {
              throw new Error(result.error || 'Upload failed');
            }
            return result.document;
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            toast({
              title: "File Upload Error",
              description: `Failed to upload ${file.name}. Please try again.`,
              variant: "destructive",
            });
            return null;
          }
        });

        const uploadedDocuments = await Promise.all(uploadPromises);
        const successfulUploads = uploadedDocuments.filter(doc => doc !== null);
        
        if (successfulUploads.length > 0) {
          toast({
            title: "Upload Complete",
            description: `${successfulUploads.length} file(s) uploaded successfully and queued for processing.`,
          });
        }
        
        setSelectedFiles([]);
        
        // Refresh the documents list
        await loadDocuments();
        
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your files. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="ml-4">
            <Upload className="h-4 w-4 mr-2" />
            {t('documents.upload')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('upload.title')}</DialogTitle>
          </DialogHeader>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-dialog')?.click()}
          >
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Drop files here</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Or click to select files from your computer
            </p>
            <div className="text-xs text-muted-foreground mb-4 space-y-1">
              <p><strong>Fully Supported (AI Analysis):</strong> PDF, TXT, CSV, JSON</p>
              <p><strong>Basic Support:</strong> DOC, DOCX, XLS, XLSX</p>
              <p><strong>File Size Limit:</strong> 10MB per file</p>
            </div>
            <input
              id="file-upload-dialog"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Selected files ({selectedFiles.length})</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-6 h-6 object-contain filter brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">{t('header.title')}</h1>
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{t('header.staffPortal')}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAI(true)}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('header.aiAssistant')}
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm bg-primary text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.employeeId}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('header.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-gray-50/50 min-h-screen">
          <div className="p-4 space-y-1">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg transition-all ${
                activeTab === "overview" 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                  : "hover:bg-white hover:shadow-sm text-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              {t('nav.overview')}
            </Button>
            <Button
              variant={activeTab === "documents" ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg transition-all ${
                activeTab === "documents" 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                  : "hover:bg-white hover:shadow-sm text-gray-700"
              }`}
              onClick={() => setActiveTab("documents")}
            >
              <FileText className="h-4 w-4 mr-3" />
              {t('nav.documents')}
            </Button>
            <Button
              variant={activeTab === "projects" ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg transition-all ${
                activeTab === "projects" 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                  : "hover:bg-white hover:shadow-sm text-gray-700"
              }`}
              onClick={() => setActiveTab("projects")}
            >
              <Users className="h-4 w-4 mr-3" />
              {t('nav.projects')}
            </Button>
            <Button
              variant={activeTab === "search" ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg transition-all ${
                activeTab === "search" 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                  : "hover:bg-white hover:shadow-sm text-gray-700"
              }`}
              onClick={() => setActiveTab("search")}
            >
              <Search className="h-4 w-4 mr-3" />
              {t('nav.search')}
            </Button>
            <Button
              variant={activeTab === "test" ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg transition-all ${
                activeTab === "test" 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                  : "hover:bg-white hover:shadow-sm text-gray-700"
              }`}
              onClick={() => setActiveTab("test")}
            >
              <Settings className="h-4 w-4 mr-3" />
              System Test
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg hover:bg-white hover:shadow-sm text-gray-700 transition-all"
              onClick={() => navigate('/connections')}
            >
              <Link className="h-4 w-4 mr-3" />
              {t('nav.connections')}
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
          {activeTab === "documents" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Main Upload Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{t('documents.title')}</h2>
                    <p className="text-muted-foreground">{t('documents.subtitle')}</p>
                  </div>
                  <UploadDialog />
                </div>
                
                {/* Document List */}
                <Card>
                  <div className="p-6">
                    {storedDocuments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h4 className="text-lg font-medium text-foreground mb-1">{t('documents.noDocuments')}</h4>
                        <p className="text-muted-foreground mb-4">
                          {t('documents.getStarted')}
                        </p>
                        <UploadDialog />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {storedDocuments.map((doc) => (
                          <DocumentCard key={doc.id} document={doc} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              
              {/* AI Summary Sidebar */}
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="font-medium">AI Document Summary</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a document to get an AI-generated summary, key points, and action items.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Extract key information</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Generate executive summary</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Identify action items</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Zap className="h-4 w-4 mr-2 text-blue-500" />
                    Process with AI
                  </Button>
                </div>
                
                {/* Recent Activity */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {storedDocuments.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-start gap-3 text-sm">
                          <div className="bg-muted p-2 rounded-lg">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {storedDocuments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent activity. Upload documents to see them here.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t('overview.greeting')}, {user.name}</h2>
                <p className="text-muted-foreground">{t('overview.briefing')}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">{t('overview.totalDocuments')}</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{storedDocuments.length}</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700 font-medium">{t('overview.activeProjects')}</p>
                      <p className="text-3xl font-bold text-emerald-900 mt-1">
                        {projects.filter(project => project.status === 'In Progress').length}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-200 rounded-xl">
                      <Users className="h-6 w-6 text-emerald-700" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 font-medium">{t('overview.highPriority')}</p>
                      <p className="text-3xl font-bold text-amber-900 mt-1">
                        {[...storedDocuments.filter(doc => doc.priority === 'high'), ...projects.filter(project => project.priority === 'high')].length}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-200 rounded-xl">
                      <Brain className="h-6 w-6 text-amber-700" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">{t('overview.avgConfidence')}</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">
                        {storedDocuments.length > 0 
                          ? Math.round(storedDocuments.reduce((sum, doc) => sum + (doc.confidence_score || 0), 0) / storedDocuments.length)
                          : 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-xl">
                      <Zap className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="group p-6 bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => navigate('/connections')}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Link className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Data Connections</h3>
                      <p className="text-sm text-gray-600">Connect external sources</p>
                    </div>
                  </div>
                </Card>
                <Card className="group p-6 bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setActiveTab("documents")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Upload Documents</h3>
                      <p className="text-sm text-gray-600">AI-powered analysis</p>
                    </div>
                  </div>
                </Card>
                <Card className="group p-6 bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setActiveTab("projects")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Manage Projects</h3>
                      <p className="text-sm text-gray-600">Track progress & teams</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Projects */}
              {projects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("projects")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      View All
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projects.slice(0, 6).map((project) => (
                      <MinimalProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Documents */}
              {storedDocuments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("documents")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      View All
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {storedDocuments.slice(0, 6).map((doc) => (
                      <MinimalDocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </div>
              )}

              {/* Welcome Section - Show when no content */}
              {projects.length === 0 && storedDocuments.length === 0 && (
                <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Knowledge Lens</h3>
                    <p className="text-gray-600 mb-6">Get started by uploading documents or creating your first project to unlock AI-powered insights.</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => setActiveTab("documents")} className="bg-blue-600 hover:bg-blue-700">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("projects")} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Users className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}



          {activeTab === "projects" && (
            <div className="animate-fade-in">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Project Center</h2>
                    <p className="text-muted-foreground">Track ongoing KMRL projects and their progress</p>
                  </div>
                  <CreateProjectDialog onProjectCreated={handleProjectCreated} />
                </div>
                
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-1">No projects yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Get started by creating your first project
                    </p>
                    <CreateProjectDialog onProjectCreated={handleProjectCreated} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <EnhancedProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="animate-fade-in">
              <EnhancedSearchInterface />
            </div>
          )}

          {activeTab === "test" && (
            <div className="animate-fade-in">
              <DocumentTestPanel />
            </div>
          )}
        </main>
      </div>

      {/* AI Assistant Modal */}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
};