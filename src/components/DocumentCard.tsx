import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ArrowRight, Brain, MoreHorizontal, Sparkles, Mail, Upload, Cloud, HardDrive, Database, Globe } from "lucide-react";

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

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-50 text-red-700 border-red-200";
      case "doc":
      case "docx":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "excel":
      case "xlsx":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getSourceInfo = (source: string) => {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.includes("email") || lowerSource.includes("mail")) {
      return {
        icon: <Mail className="h-4 w-4" />,
        label: "Email",
        color: "bg-blue-500 text-white border-blue-600"
      };
    }
    
    if (lowerSource.includes("manual") || lowerSource.includes("upload")) {
      return {
        icon: <Upload className="h-4 w-4" />,
        label: "Manual Upload",
        color: "bg-green-500 text-white border-green-600"
      };
    }
    
    if (lowerSource.includes("sharepoint")) {
      return {
        icon: <Cloud className="h-4 w-4" />,
        label: "SharePoint",
        color: "bg-purple-500 text-white border-purple-600"
      };
    }
    
    if (lowerSource.includes("google") || lowerSource.includes("drive")) {
      return {
        icon: <HardDrive className="h-4 w-4" />,
        label: "Google Drive",
        color: "bg-yellow-500 text-white border-yellow-600"
      };
    }
    
    if (lowerSource.includes("onedrive")) {
      return {
        icon: <Cloud className="h-4 w-4" />,
        label: "OneDrive",
        color: "bg-indigo-500 text-white border-indigo-600"
      };
    }
    
    if (lowerSource.includes("database") || lowerSource.includes("db")) {
      return {
        icon: <Database className="h-4 w-4" />,
        label: "Database",
        color: "bg-gray-600 text-white border-gray-700"
      };
    }
    
    if (lowerSource.includes("web") || lowerSource.includes("website")) {
      return {
        icon: <Globe className="h-4 w-4" />,
        label: "Web",
        color: "bg-cyan-500 text-white border-cyan-600"
      };
    }
    
    return {
      icon: <FileText className="h-4 w-4" />,
      label: source || "Unknown",
      color: "bg-slate-500 text-white border-slate-600"
    };
  };

  const handleClick = () => {
    navigate(`/document/${document.id}`);
  };

  const sourceInfo = getSourceInfo(document.source);

  return (
    <Card className="group relative overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl" onClick={handleClick}>
      {/* Priority indicator */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${getPriorityColor(document.priority)}`} />
      
      <div className="p-6">
        {/* Source Tags Row - At the very top */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Source Tag - Most prominent and visible */}
            <Badge className={`text-sm flex items-center gap-2 px-3 py-1.5 font-semibold shadow-sm ${sourceInfo.color}`}>
              {sourceInfo.icon}
              <span>{sourceInfo.label}</span>
            </Badge>
            
            {/* File Type Tag */}
            <Badge variant="outline" className={`text-sm px-3 py-1.5 font-medium ${getTypeColor(document.type)}`}>
              {document.type.toUpperCase()}
            </Badge>
          </div>
          
          {/* AI Indicator and Priority */}
          <div className="flex items-center gap-2">
            <Badge className="text-sm px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-1.5 shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>AI Analyzed</span>
            </Badge>
            <div className={`w-4 h-4 rounded-full ${getPriorityColor(document.priority)} shadow-sm`} />
          </div>
        </div>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-start gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-sm flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors leading-tight mb-2">
                  {document.title}
                </h3>
                {/* Meta information */}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(document.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">{document.department}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Summary Section - Much larger and fully visible */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900">AI Summary</h4>
                <p className="text-sm text-blue-700">Generated insights and key points</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {document.summary.headline}
              </p>
              {document.summary.keyPoints && document.summary.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Points:</h5>
                  <ul className="space-y-1">
                    {document.summary.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {document.summary.keyPoints.length > 3 && (
                    <p className="text-xs text-gray-600 italic">
                      +{document.summary.keyPoints.length - 3} more key points available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 py-3"
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
          >
            <span className="font-semibold">View Full Document</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            className="px-4 py-3 border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};