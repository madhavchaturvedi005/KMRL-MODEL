export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  completion: number;
  team: string[];
  lastUpdate: string;
  keyMilestones: string[];
  documentsCount: number;
  updatesCount: number;
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  assignedTo: string[];
  createdBy?: string;
  createdDate?: string;
}

export class ProjectStorageService {
  private readonly STORAGE_KEY = 'kmrl_projects';

  generateId(): string {
    return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  saveProject(project: Omit<Project, 'id' | 'createdDate'>): Project {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      documentsCount: 0,
      updatesCount: 0,
      completion: 0,
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    const projects = this.getAllProjects();
    projects.push(newProject);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    
    return newProject;
  }

  getAllProjects(): Project[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultProjects();
    } catch (error) {
      console.error('Error loading projects from storage:', error);
      return this.getDefaultProjects();
    }
  }

  getDefaultProjects(): Project[] {
    return [
      {
        id: "p1",
        name: "Corridor Expansion Phase 2",
        description: "Expansion of the metro corridor to include 5 new stations with enhanced connectivity and modern infrastructure.",
        status: "In Progress",
        completion: 65,
        team: ["Engineering", "Construction", "Safety"],
        lastUpdate: "2024-01-14",
        keyMilestones: ["Environmental clearance approved", "Land acquisition 90% complete"],
        documentsCount: 12,
        updatesCount: 8,
        priority: "high",
        startDate: "2023-06-01",
        endDate: "2024-12-31",
        assignedTo: ["Rajesh Kumar", "Priya Sharma", "Amit Singh", "Sunita Patel"],
        createdBy: "System",
        createdDate: "2023-06-01T00:00:00.000Z"
      },
      {
        id: "p2",
        name: "Smart Ticketing System Upgrade",
        description: "Implementation of contactless ticketing system with mobile app integration and real-time payment processing.",
        status: "Planning",
        completion: 25,
        team: ["IT", "Operations"],
        lastUpdate: "2024-01-12",
        keyMilestones: ["Vendor selection completed", "Technical specifications finalized"],
        documentsCount: 8,
        updatesCount: 5,
        priority: "medium",
        startDate: "2024-02-01",
        endDate: "2024-08-31",
        assignedTo: ["Vikram Reddy", "Anita Desai"],
        createdBy: "System",
        createdDate: "2024-01-01T00:00:00.000Z"
      }
    ];
  }

  getProjectById(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(project => project.id === id) || null;
  }

  updateProject(id: string, updates: Partial<Project>): boolean {
    const projects = this.getAllProjects();
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) return false;
    
    projects[index] = { ...projects[index], ...updates, lastUpdate: new Date().toISOString().split('T')[0] };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    return true;
  }

  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter(project => project.id !== id);
    
    if (filtered.length === projects.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  searchProjects(query: string): Project[] {
    const projects = this.getAllProjects();
    const lowercaseQuery = query.toLowerCase();
    
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.team.some(team => team.toLowerCase().includes(lowercaseQuery)) ||
      project.assignedTo.some(person => person.toLowerCase().includes(lowercaseQuery))
    );
  }

  getProjectsByStatus(status: Project['status']): Project[] {
    const projects = this.getAllProjects();
    return projects.filter(project => project.status === status);
  }

  getProjectsByPriority(priority: Project['priority']): Project[] {
    const projects = this.getAllProjects();
    return projects.filter(project => project.priority === priority);
  }

  initializeDefaultProjects(): void {
    const existingProjects = localStorage.getItem(this.STORAGE_KEY);
    if (!existingProjects) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.getDefaultProjects()));
    }
  }
}

export const projectStorage = new ProjectStorageService();