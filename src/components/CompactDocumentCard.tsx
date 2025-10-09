import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, ArrowRight, Brain, Mail, Upload, Cloud, HardDrive, Database, Globe } from "lucide-react";

interface DocumentSummary {
  headline: string;
  keyPoints: string[];
  detailed: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  department: string;
  date: string;
  summary: DocumentSummary;
  priority: "high" | "medium" | "low";
  source: string;
}

interface CompactDocumentCardProps {
  document: Document;
}

export const CompactDocumentCard = ({ document }: CompactDocumentCardProps) => {
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
    switch (type.toLowerCase()) {
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
    switch (source.toLowerCase()) {
      case "email":
      case "mail":
        return <Mail className="h-3 w-3 text-blue-600" />;
      case "manual":
      case "upload":
        return <Upload className="h-3 w-3 text-green-600" />;
      case "sharepoint":
        return <Cloud className="h-3 w-3 text-purple-600" />;
      case "google drive":
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
      className={`group p-3 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 ${getPriorityColor(document.priority)}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Document info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {document.title}
            </h4>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              {getSourceIcon(document.source)}
              <span className="font-medium">{document.source}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTypeColor(document.type)}`}>
              <span className="font-medium">{document.type.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(document.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right side - AI indicator and arrow */}
        <div className="flex items-center gap-3 ml-4">
          {/* AI indicator */}
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Brain className="h-3 w-3" />
            <span className="hidden sm:inline">AI</span>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Card>
  );
};