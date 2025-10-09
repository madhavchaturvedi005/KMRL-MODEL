import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  completion: number;
  team: string[];
  lastUpdate: string;
  keyMilestones: string[];
}

interface ProjectTrackerProps {
  projects: Project[];
}

export const ProjectTracker = ({ projects }: ProjectTrackerProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "In Progress":
        return "bg-primary text-primary-foreground";
      case "Review":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "In Progress":
        return <TrendingUp className="h-4 w-4" />;
      case "Review":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDepartmentAvatar = (dept: string) => {
    const initials = dept.substring(0, 2).toUpperCase();
    return initials;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Project Center</h2>
        <p className="text-muted-foreground">Track ongoing KMRL projects and their progress</p>
      </div>

      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {projects.filter(p => p.status === "In Progress").length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-secondary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(projects.reduce((acc, p) => acc + p.completion, 0) / projects.length)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Teams Active</p>
              <p className="text-2xl font-bold text-foreground">
                {new Set(projects.flatMap(p => p.team)).size}
              </p>
            </div>
            <Users className="h-8 w-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                  <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {new Date(project.lastUpdate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{project.team.length} teams</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground mb-1">{project.completion}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <Progress value={project.completion} className="h-2" />
            </div>

            {/* Team Avatars */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Teams:</span>
                <div className="flex -space-x-2">
                  {project.team.map((dept, index) => (
                    <Avatar key={index} className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getDepartmentAvatar(dept)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex gap-1 ml-2">
                  {project.team.map((dept) => (
                    <Badge key={dept} variant="outline" className="text-xs">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Milestones */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Recent Milestones</h4>
              <div className="space-y-2">
                {project.keyMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="ghost" size="sm">
                View Documents
              </Button>
              <Button variant="ghost" size="sm">
                Timeline
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};