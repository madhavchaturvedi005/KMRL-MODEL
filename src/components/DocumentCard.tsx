import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, ArrowRight, Brain, Mail, Upload, Cloud, HardDrive, Database, Globe } from "lucide-react";
import { EnhancedDocument } from "@/services/enhancedDocumentService";

interface DocumentCardProps {
  document: EnhancedDocument;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-amber-500";
      default:
        return "border-l-emerald-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return "text-red-600 bg-red-50";
      case "doc":
      case "docx":
        return "text-blue-600 bg-blue-50";
      case "excel":
      case "xlsx":
        return "text-green-600 bg-green-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.includes("email") || lowerSource.includes("mail")) {
      return <Mail className="h-3.5 w-3.5 text-blue-600" />;
    }
    if (lowerSource.includes("manual") || lowerSource.includes("upload")) {
      return <Upload className="h-3.5 w-3.5 text-green-600" />;
    }
    if (lowerSource.includes("sharepoint")) {
      return <Cloud className="h-3.5 w-3.5 text-purple-600" />;
    }
    if (lowerSource.includes("google") || lowerSource.includes("drive")) {
      return <HardDrive className="h-3.5 w-3.5 text-yellow-600" />;
    }
    if (lowerSource.includes("onedrive")) {
      return <Cloud className="h-3.5 w-3.5 text-indigo-600" />;
    }
    if (lowerSource.includes("database") || lowerSource.includes("db")) {
      return <Database className="h-3.5 w-3.5 text-gray-600" />;
    }
    if (lowerSource.includes("web") || lowerSource.includes("website")) {
      return <Globe className="h-3.5 w-3.5 text-cyan-600" />;
    }
    
    return <FileText className="h-3.5 w-3.5 text-gray-600" />;
  };

  const handleClick = () => {
    navigate(`/document/${document.id}`);
  };

  // Get file extension from file_name
  const fileExtension = document.file_name?.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <Card 
      className={`group p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(document.priority)} bg-white hover:bg-gray-50/50`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
            <FileText className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
              {document.title}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{document.department || 'General'}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
      </div>

      {/* Summary */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {document.ai_summary || 'Document uploaded and ready for processing...'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {getSourceIcon(document.source)}
            <span className="text-xs text-gray-500 capitalize">{document.source}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(fileExtension)}`}>
            {fileExtension}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Brain className="h-3 w-3" />
            <span>{document.processing_status === 'completed' ? 'AI' : document.processing_status}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(document.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};