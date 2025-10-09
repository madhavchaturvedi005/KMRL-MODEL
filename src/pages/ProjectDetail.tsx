import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Calendar, Users, TrendingUp, Clock, CheckCircle, AlertCircle, FileText, MessageSquare, Plus, Upload, MoreHorizontal, Edit, Trash2, Brain, MessageCircle, Bell } from 'lucide-react';
import { DocumentCard } from '@/components/DocumentCard';
import { AIAssistant } from '@/components/AIAssistant';

// Mock data for project details
const mockProject = {
  id: "p1",
  name: "Corridor Expansion Phase 2",
  description: "Expansion of the metro corridor to include 5 new stations with enhanced connectivity and modern infrastructure.",
  status: "In Progress" as const,
  completion: 65,
  team: ["Engineering", "Construction", "Safety", "Operations"],
  lastUpdate: "2024-01-14",
  keyMilestones: [
    "Environmental clearance approved",
    "Land acquisition 90% complete",
    "Construction permits obtained",
    "Safety protocols implemented"
  ],
  documentsCount: 12,
  updatesCount: 8,
  priority: "high" as const,
  startDate: "2023-06-01",
  endDate: "2024-12-31",
  assignedTo: ["Rajesh Kumar", "Priya Sharma", "Amit Singh", "Sunita Patel"],
  budget: "₹2.5 Crores",
  location: "Kochi Metro Corridor"
};

const mockDocuments = [
  {
    id: "1",
    title: "Environmental Impact Assessment Report",
    type: "Environmental Report",
    department: "Engineering",
    date: "2024-01-10",
    summary: {
      headline: "Comprehensive environmental impact assessment for corridor expansion",
      keyPoints: ["Air quality impact minimal", "Noise levels within acceptable limits", "Wildlife impact assessed", "Mitigation measures proposed"],
      detailed: "The environmental impact assessment confirms that the corridor expansion project will have minimal environmental impact. Air quality monitoring shows no significant changes, noise levels remain within acceptable limits, and wildlife impact has been thoroughly assessed with appropriate mitigation measures proposed."
    },
    priority: "high" as const,
    source: "eia-report-phase2.pdf"
  },
  {
    id: "2",
    title: "Safety Protocol Implementation Guide",
    type: "Safety Document",
    department: "Safety",
    date: "2024-01-08",
    summary: {
      headline: "Updated safety protocols for construction phase",
      keyPoints: ["PPE requirements updated", "Emergency procedures revised", "Training schedules planned", "Safety inspections scheduled"],
      detailed: "This document outlines the comprehensive safety protocols for the construction phase of the corridor expansion. It includes updated PPE requirements, revised emergency procedures, planned training schedules, and regular safety inspection protocols."
    },
    priority: "high" as const,
    source: "safety-protocols-construction.pdf"
  },
  {
    id: "3",
    title: "Budget Allocation and Cost Analysis",
    type: "Financial Report",
    department: "Finance",
    date: "2024-01-05",
    summary: {
      headline: "Detailed budget breakdown and cost analysis for Phase 2",
      keyPoints: ["Total budget: ₹2.5 Crores", "Material costs: 60%", "Labor costs: 25%", "Contingency: 15%"],
      detailed: "The financial analysis shows a total budget allocation of ₹2.5 Crores for Phase 2 expansion. Material costs account for 60% of the budget, labor costs for 25%, and a 15% contingency fund has been allocated for unforeseen expenses."
    },
    priority: "medium" as const,
    source: "budget-analysis-phase2.xlsx"
  }
];

const mockUpdates = [
  {
    id: "1",
    author: "Rajesh Kumar",
    role: "Station Controller",
    date: "2024-01-14",
    content: "Environmental clearance has been approved by the state government. We can now proceed with the construction activities as planned.",
    attachments: ["clearance-certificate.pdf"]
  },
  {
    id: "2",
    author: "Priya Sharma",
    role: "Procurement Officer",
    date: "2024-01-12",
    content: "Material procurement for the first phase of construction is complete. All required materials have been delivered to the site.",
    attachments: []
  },
  {
    id: "3",
    author: "Amit Singh",
    role: "Rolling Stock Engineer",
    date: "2024-01-10",
    content: "Technical specifications for the new rolling stock have been finalized. The procurement process will begin next week.",
    attachments: ["technical-specs.pdf", "procurement-plan.docx"]
  }
];

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAI, setShowAI] = useState(false);
  const [isPostUpdateOpen, setIsPostUpdateOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [newDocument, setNewDocument] = useState({ title: '', description: '', file: null as File | null });

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
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

  const handlePostUpdate = () => {
    // In a real app, this would post the update to the backend
    console.log('Posting update:', newUpdate);
    setNewUpdate('');
    setIsPostUpdateOpen(false);
  };

  const handleUploadDocument = () => {
    // In a real app, this would upload the document to the backend
    console.log('Uploading document:', newDocument);
    setNewDocument({ title: '', description: '', file: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-white">KMRL</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Project Details</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAI(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm bg-primary text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.employeeId}</p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/login')} className="text-red-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{mockProject.name}</CardTitle>
                  <Badge className={`text-xs ${getStatusColor(mockProject.status)}`}>
                    {getStatusIcon(mockProject.status)}
                    <span className="ml-1">{mockProject.status}</span>
                  </Badge>
                  <Badge className={`text-xs ${getPriorityColor(mockProject.priority)}`}>
                    {mockProject.priority}
                  </Badge>
                </div>
                <CardDescription className="text-base mb-4">
                  {mockProject.description}
                </CardDescription>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {new Date(mockProject.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>End: {new Date(mockProject.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{mockProject.assignedTo.length} assigned</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{mockProject.documentsCount} documents</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">{mockProject.completion}%</div>
                <div className="text-sm text-gray-500">Complete</div>
                <Progress value={mockProject.completion} className="w-32 mt-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Assigned Team</h4>
                <div className="flex -space-x-2">
                  {mockProject.assignedTo.map((user, index) => (
                    <Avatar key={index} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs bg-primary text-white">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                <p className="text-lg font-semibold text-green-600">{mockProject.budget}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <p className="text-sm text-gray-600">{mockProject.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Project Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                The Corridor Expansion Phase 2 project is progressing well with 65% completion. 
                Key achievements include environmental clearance approval and 90% land acquisition completion. 
                The project team has successfully implemented safety protocols and obtained necessary construction permits. 
                Current focus areas include material procurement and rolling stock specifications finalization. 
                The project is on track to meet the December 2024 deadline with proper risk management in place.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Documents</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                    <DialogDescription>
                      Add a new document to this project
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                        placeholder="Enter document title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDocument.description}
                        onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                        placeholder="Enter document description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files?.[0] || null })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewDocument({ title: '', description: '', file: null })}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadDocument}>
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {mockDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} expanded />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Updates</h2>
              <Dialog open={isPostUpdateOpen} onOpenChange={setIsPostUpdateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post Project Update</DialogTitle>
                    <DialogDescription>
                      Share an update about the project progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="update">Update</Label>
                      <Textarea
                        id="update"
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                        placeholder="What's the latest on this project?"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPostUpdateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePostUpdate}>
                      Post Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {mockUpdates.map((update) => (
                <Card key={update.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(update.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{update.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {update.role}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{update.content}</p>
                      {update.attachments.length > 0 && (
                        <div className="flex gap-2">
                          {update.attachments.map((attachment, index) => (
                            <Button key={index} variant="outline" size="sm" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {attachment}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <h2 className="text-xl font-semibold">Project Timeline</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockProject.keyMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{milestone}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Modal */}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
};

export default ProjectDetail;
