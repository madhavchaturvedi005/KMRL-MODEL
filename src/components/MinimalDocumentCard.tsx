import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FileText, Brain, Calendar, Mail, Upload, Cloud, HardDrive, Database, Globe } from "lucide-react";
import { EnhancedDocument } from "@/services/enhancedDocumentService";

interface MinimalDocumentCardProps {
  document: EnhancedDocument;
}

export const MinimalDocumentCard = ({ document }: MinimalDocumentCardProps) => {
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

  const getTypeIcon = (type: string) => {
    return <FileText className="h-3.5 w-3.5 text-gray-600" />;
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "email":
      case "mail":
        return <Mail className="h-3 w-3 text-blue-600" />;
      case "manual":
      case "upload":
        return <Upload className="h-3 w-3 text-green-600" />;
      case "sharepoint":
        return <Cloud className="h-3 w-3 text-purple-600" />;
      case "google_drive":
      case "googledrive":
        return <HardDrive className="h-3 w-3 text-yellow-600" />;
      case "onedrive":
        return <Cloud className="h-3 w-3 text-indigo-600" />;
      case "database":
      case "db":
        return <Database className="h-3 w-3 text-gray-600" />;
      case "web":
      case "website":
        return <Globe className="h-3 w-3 text-cyan-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  const handleClick = () => {
    navigate(`/document/${document.id}`);
  };

  return (
    <Card 
      className={`group p-3 hover:shadow-sm transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(document.priority)} bg-gradient-to-r from-white to-gray-50/30`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getTypeIcon(document.file_name)}
          <h5 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
            {document.title}
          </h5>
        </div>
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Brain className="h-3 w-3" />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-gray-600 line-clamp-1">
          {document.ai_summary || 'Processing...'}
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              {getSourceIcon(document.source)}
              <span className="capitalize">{document.source}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(document.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <span className="capitalize">{document.priority}</span>
        </div>
      </div>
    </Card>
  );
};