import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  completion: number;
  priority: "high" | "medium" | "low";
}

interface MinimalProjectCardProps {
  project: Project;
}

export const MinimalProjectCard = ({ project }: MinimalProjectCardProps) => {
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

  const getStatusIcon = (status: string) => {
    const iconClass = "h-3.5 w-3.5";
    switch (status) {
      case "Completed":
        return <CheckCircle className={`${iconClass} text-emerald-600`} />;
      case "In Progress":
        return <TrendingUp className={`${iconClass} text-blue-600`} />;
      case "Review":
        return <AlertCircle className={`${iconClass} text-amber-600`} />;
      default:
        return <Clock className={`${iconClass} text-slate-600`} />;
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      className={`group p-3 hover:shadow-sm transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(project.priority)} bg-gradient-to-r from-white to-gray-50/30`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(project.status)}
          <h5 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
            {project.name}
          </h5>
        </div>
        <span className="text-xs text-gray-500 font-medium">{project.completion}%</span>
      </div>
      
      <div className="space-y-1">
        <Progress value={project.completion} className="h-1.5" />
        <div className="flex justify-between text-xs text-gray-500">
          <span className="capitalize">{project.status.toLowerCase()}</span>
          <span className="capitalize">{project.priority} priority</span>
        </div>
      </div>
    </Card>
  );
};