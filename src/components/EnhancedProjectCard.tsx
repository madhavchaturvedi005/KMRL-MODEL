import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, FileText, ArrowRight, Clock, CheckCircle, AlertCircle, TrendingUp, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  completion: number;
  team: string[];
  lastUpdate: string;
  keyMilestones: string[];
  documentsCount: number;
  updatesCount: number;
  priority: "high" | "medium" | "low";
  startDate: string;
  endDate: string;
  assignedTo: string[];
}

interface EnhancedProjectCardProps {
  project: Project;
}

export const EnhancedProjectCard = ({ project }: EnhancedProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "In Progress":
        return <TrendingUp className="h-3.5 w-3.5" />;
      case "Review":
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const handleViewDetails = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleViewDetails}>
      {/* Priority indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityDot(project.priority)}`} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <div className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`} />
            </div>
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">{project.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Status and Progress */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={`text-xs border ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="ml-1">{project.status}</span>
          </Badge>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{project.completion}%</span>
            <Progress value={project.completion} className="w-16 h-1.5" />
          </div>
        </div>

        {/* Team and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Team avatars */}
            <div className="flex -space-x-1.5">
              {project.assignedTo.slice(0, 3).map((user, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.assignedTo.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">+{project.assignedTo.length - 3}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{project.documentsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{project.team.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(project.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
        >
          <span>View Project</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};
