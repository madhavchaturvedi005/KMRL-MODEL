import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, ArrowRight, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  completion: number;
  team: string[];
  lastUpdate: string;
  assignedTo: string[];
  priority: "high" | "medium" | "low";
}

interface CompactProjectCardProps {
  project: Project;
}

export const CompactProjectCard = ({ project }: CompactProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-emerald-600 bg-emerald-50";
      case "In Progress":
        return "text-blue-600 bg-blue-50";
      case "Review":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-3 w-3" />;
      case "In Progress":
        return <TrendingUp className="h-3 w-3" />;
      case "Review":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      className="group p-3 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500" 
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Project info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} />
            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {project.name}
            </h4>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="font-medium">{project.status}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{project.assignedTo.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(project.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right side - Progress and team */}
        <div className="flex items-center gap-3 ml-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <Progress value={project.completion} className="w-12 h-1.5" />
            <span className="text-xs text-gray-500 font-medium min-w-[2rem]">{project.completion}%</span>
          </div>

          {/* Team avatars */}
          <div className="flex -space-x-1">
            {project.assignedTo.slice(0, 2).map((user, index) => (
              <Avatar key={index} className="h-5 w-5 border border-white">
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.assignedTo.length > 2 && (
              <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{project.assignedTo.length - 2}</span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Card>
  );
};