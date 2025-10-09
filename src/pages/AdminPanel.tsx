import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, User, Settings, Users, BarChart3, Plus, Search, MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserStatus } from '@/data/mockUsers';
import { UserRole, LoginType } from '@/types/auth';
import heroImage from '@/assets/hero-image.jpg';

const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'connections' | 'alerts'>('dashboard');

  if (!user || user.loginType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const allUsers = getAllUsers();
  const staffUsers = allUsers.filter(u => u.loginType === 'staff');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Station Controller':
        return 'bg-blue-100 text-blue-800';
      case 'Procurement Officer':
        return 'bg-green-100 text-green-800';
      case 'Rolling Stock Engineer':
        return 'bg-purple-100 text-purple-800';
      case 'Safety Officer':
        return 'bg-red-100 text-red-800';
      case 'Field Technician':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const filteredUsers = staffUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusChange = (employeeId: string, newStatus: 'active' | 'inactive') => {
    updateUserStatus(employeeId, newStatus);
    // Force re-render by updating state
    setSearchTerm(searchTerm);
  };

  const roleOptions: UserRole[] = ['Station Controller', 'Procurement Officer', 'Rolling Stock Engineer', 'Safety Officer', 'Field Technician'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
                        <p className="text-xs text-gray-500">Admin</p>
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
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="text-xs bg-red-100 text-red-800">
                          Admin
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="w-64 border-r bg-white rounded-md h-fit sticky top-6 self-start hidden md:block">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 px-2 mb-2">Admin Navigation</div>
              <div className="space-y-1">
                <Button variant={activeTab === 'users' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('users')}><span className="mr-2">👥</span> User Management</Button>
                <Button variant={activeTab === 'connections' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('connections')}><span className="mr-2">🔌</span> Connections</Button>
                <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('dashboard')}><span className="mr-2">📊</span> System Analytics</Button>
                <Button variant={activeTab === 'alerts' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('alerts')}><span className="mr-2">⚙️</span> Alert Routing</Button>
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 hidden">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {staffUsers.length} staff, {allUsers.filter(u => u.loginType === 'admin').length} admin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allUsers.filter(u => u.status === 'active').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {allUsers.filter(u => u.status === 'inactive').length} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(allUsers.map(u => u.department)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unique departments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Roles</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(allUsers.map(u => u.role)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Different roles
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest login activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers
                    .filter(u => u.lastLogin)
                    .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role} • {user.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                          <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-gray-600">Manage staff accounts and permissions</p>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new staff account with appropriate role and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input id="employeeId" placeholder="e.g., STF007" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Enter full name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter email address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" placeholder="Enter department" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddUserOpen(false)}>
                      Add User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
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
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(
                                  user.employeeId, 
                                  user.status === 'active' ? 'inactive' : 'active'
                                )}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="connections" className="space-y-6">
            <h2 className="text-2xl font-bold">Connections</h2>
            <p className="text-gray-600">Configure integrations (Email inboxes, SharePoint, Cloud storage)</p>
            <Card>
              <CardHeader>
                <CardTitle>Connectors</CardTitle>
                <CardDescription>Add and manage your ingestion pipelines.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">Add Email Connector</Button>
                  <Button variant="outline">Add SharePoint Connector</Button>
                  <Button variant="outline">Add Cloud Storage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts" className="space-y-6">
            <h2 className="text-2xl font-bold">Alert Routing</h2>
            <p className="text-gray-600">Define recipients based on document type and priority.</p>
            <Card>
              <CardHeader>
                <CardTitle>Routing Rules</CardTitle>
                <CardDescription>Create and manage rules.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <p className="text-sm font-medium mb-2">High Priority → Safety Officers</p>
                    <p className="text-xs text-gray-600">Immediate email + in-app alert</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm font-medium mb-2">Invoices → Procurement Officers</p>
                    <p className="text-xs text-gray-600">Daily digest + dashboard card</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button>Add Rule</Button>
                  <Button variant="outline" className="ml-2">Manage Channels</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
