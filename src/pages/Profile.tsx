import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, Building, Calendar, Shield, Edit, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
  });

  if (!user) {
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSave = () => {
    // In a real app, this would update the user data via API
    console.log('Saving user data:', editedUser);
    setIsEditing(false);
    // You could add a toast notification here
  };

  const handleCancel = () => {
    setEditedUser({
      name: user.name,
      email: user.email,
      department: user.department,
    });
    setIsEditing(false);
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
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{user.employeeId}</span>
                      </div>
                      <Badge className={`w-fit ${getRoleColor(user.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">{user.name}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <div className="p-3 bg-gray-50 rounded-md text-gray-600">
                      {user.employeeId}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {user.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Input
                      id="department"
                      value={editedUser.department}
                      onChange={(e) => setEditedUser({ ...editedUser, department: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      {user.department}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your account details and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="p-3 bg-gray-50 rounded-md flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
