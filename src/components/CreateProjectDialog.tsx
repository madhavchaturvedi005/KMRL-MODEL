import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Calendar, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { projectStorage, Project } from "@/services/projectStorage";

interface CreateProjectDialogProps {
  onProjectCreated: (project: Project) => void;
}

const departmentOptions = [
  "Engineering",
  "Construction", 
  "Safety",
  "IT",
  "Operations",
  "Finance",
  "Procurement",
  "Environmental Planning",
  "Quality Assurance",
  "Maintenance"
];

const teamMemberOptions = [
  "Rajesh Kumar",
  "Priya Sharma", 
  "Amit Singh",
  "Sunita Patel",
  "Vikram Reddy",
  "Anita Desai",
  "Ravi Menon",
  "Deepika Nair",
  "Suresh Pillai",
  "Kavitha Krishnan"
];

export const CreateProjectDialog = ({ onProjectCreated }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium" as Project['priority'],
    startDate: "",
    endDate: "",
    team: [] as string[],
    assignedTo: [] as string[],
    keyMilestones: [""] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error", 
        description: "Project description is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Start date and end date are required.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newProject = projectStorage.saveProject({
        ...formData,
        status: "Planning",
        keyMilestones: formData.keyMilestones.filter(milestone => milestone.trim() !== ""),
        createdBy: "Current User" // In a real app, this would come from auth context
      });

      onProjectCreated(newProject);
      
      toast({
        title: "Project Created",
        description: `${newProject.name} has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        startDate: "",
        endDate: "",
        team: [],
        assignedTo: [],
        keyMilestones: [""]
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addTeamMember = (member: string) => {
    if (!formData.team.includes(member)) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, member]
      }));
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(t => t !== member)
    }));
  };

  const addAssignee = (assignee: string) => {
    if (!formData.assignedTo.includes(assignee)) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, assignee]
      }));
    }
  };

  const removeAssignee = (assignee: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(a => a !== assignee)
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      keyMilestones: [...prev.keyMilestones, ""]
    }));
  };

  const updateMilestone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyMilestones: prev.keyMilestones.map((milestone, i) => 
        i === index ? value : milestone
      )
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyMilestones: prev.keyMilestones.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project objectives and scope"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: Project['priority']) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              Team Departments
            </Label>
            <Select onValueChange={addTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="Add department to team" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.team.map(member => (
                <Badge key={member} variant="secondary" className="flex items-center gap-1">
                  {member}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTeamMember(member)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              Assigned Team Members
            </Label>
            <Select onValueChange={addAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Assign team members" />
              </SelectTrigger>
              <SelectContent>
                {teamMemberOptions.map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.assignedTo.map(assignee => (
                <Badge key={assignee} variant="outline" className="flex items-center gap-1">
                  {assignee}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeAssignee(assignee)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Key Milestones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Key Milestones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-3 w-3 mr-1" />
                Add Milestone
              </Button>
            </div>
            <div className="space-y-2">
              {formData.keyMilestones.map((milestone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={milestone}
                    onChange={(e) => updateMilestone(index, e.target.value)}
                    placeholder="Enter milestone description"
                  />
                  {formData.keyMilestones.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};