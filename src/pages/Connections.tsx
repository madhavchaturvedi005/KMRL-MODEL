import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Mail,
  FolderOpen,
  MessageCircle,
  Cloud,
  Scan,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { connectionService, Connection, ConnectionTemplate } from '@/services/connectionService';

const getStatusColor = (status: Connection['status']) => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'disconnected':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: Connection['status']) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4" />;
    case 'disconnected':
      return <XCircle className="h-4 w-4" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    default:
      return <XCircle className="h-4 w-4" />;
  }
};

const getTypeIcon = (type: Connection['type']) => {
  switch (type) {
    case 'email':
      return <Mail className="h-5 w-5" />;
    case 'sharepoint':
      return <FolderOpen className="h-5 w-5" />;
    case 'maximo':
      return <Settings className="h-5 w-5" />;
    case 'whatsapp':
      return <MessageCircle className="h-5 w-5" />;
    case 'cloud':
      return <Cloud className="h-5 w-5" />;
    case 'scanner':
      return <Scan className="h-5 w-5" />;
    default:
      return <Settings className="h-5 w-5" />;
  }
};

const CreateConnectionDialog = ({ onConnectionCreated }: { onConnectionCreated: (connection: Connection) => void }) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConnectionTemplate | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [connectionName, setConnectionName] = useState('');
  const [syncFrequency, setSyncFrequency] = useState<Connection['syncFrequency']>('daily');
  const [isCreating, setIsCreating] = useState(false);

  const templates = connectionService.getConnectionTemplates();

  const handleTemplateSelect = (template: ConnectionTemplate) => {
    setSelectedTemplate(template);
    setConnectionName(template.name);
    setFormData({});
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    // Validate required fields
    const missingFields = selectedTemplate.configFields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newConnection = connectionService.saveConnection({
        name: connectionName,
        type: selectedTemplate.type,
        status: 'pending',
        lastSync: null,
        config: formData,
        syncFrequency,
        description: selectedTemplate.description
      });

      onConnectionCreated(newConnection);
      
      toast({
        title: "Connection Created",
        description: `${connectionName} has been configured successfully.`,
      });

      // Reset form
      setSelectedTemplate(null);
      setConnectionName('');
      setFormData({});
      setSyncFrequency('daily');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Connection</DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Choose a connection type to get started:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.type} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(template.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm">{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Key Features:</p>
                      <ul className="text-xs space-y-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1 w-1 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getTypeIcon(selectedTemplate.type)}
              </div>
              <div>
                <h3 className="font-medium">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTemplate(null)}
                className="ml-auto"
              >
                Change
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="connectionName">Connection Name *</Label>
                <Input
                  id="connectionName"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="Enter a name for this connection"
                  required
                />
              </div>

              <div>
                <Label htmlFor="syncFrequency">Sync Frequency</Label>
                <Select value={syncFrequency} onValueChange={(value: Connection['syncFrequency']) => setSyncFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Configuration</h4>
                {selectedTemplate.configFields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && '*'}
                    </Label>
                    {field.type === 'select' ? (
                      <Select 
                        value={formData[field.name] || ''} 
                        onValueChange={(value) => handleFieldChange(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                    {field.description && (
                      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Connection'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ConnectionCard = ({ 
  connection, 
  onTest, 
  onSync, 
  onDelete 
}: { 
  connection: Connection;
  onTest: (id: string) => void;
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTypeIcon(connection.type)}
            </div>
            <div>
              <CardTitle className="text-base">{connection.name}</CardTitle>
              <CardDescription className="text-sm">{connection.description}</CardDescription>
            </div>
          </div>
          <Badge className={`text-xs border ${getStatusColor(connection.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(connection.status)}
              {connection.status}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Documents Processed</p>
            <p className="font-medium">{connection.documentsCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Sync</p>
            <p className="font-medium">
              {connection.lastSync 
                ? new Date(connection.lastSync).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Sync Frequency</p>
            <p className="font-medium capitalize">{connection.syncFrequency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{new Date(connection.createdDate).toLocaleDateString()}</p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTest(connection.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Test
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSync(connection.id)}
              disabled={connection.status !== 'connected'}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(connection.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Connections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncingConnection, setSyncingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = () => {
    setIsLoading(true);
    try {
      const allConnections = connectionService.getAllConnections();
      setConnections(allConnections);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load connections.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionCreated = (newConnection: Connection) => {
    setConnections(prev => [...prev, newConnection]);
  };

  const handleTestConnection = async (id: string) => {
    setTestingConnection(id);
    try {
      const result = await connectionService.testConnection(id);
      
      // Update connection status based on test result
      connectionService.updateConnection(id, {
        status: result.success ? 'connected' : 'error'
      });
      
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      
      loadConnections();
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test connection.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSyncConnection = async (id: string) => {
    setSyncingConnection(id);
    try {
      const result = await connectionService.syncConnection(id);
      
      toast({
        title: result.success ? "Sync Successful" : "Sync Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      
      loadConnections();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize connection.",
        variant: "destructive",
      });
    } finally {
      setSyncingConnection(null);
    }
  };

  const handleDeleteConnection = (id: string) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      connectionService.deleteConnection(id);
      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast({
        title: "Connection Deleted",
        description: "Connection has been removed successfully.",
      });
    }
  };

  const stats = connectionService.getConnectionStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-lg font-semibold">Data Source Connections</h1>
          </div>
          <CreateConnectionDialog onConnectionCreated={handleConnectionCreated} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Settings className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.disconnected}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documents Processed</p>
                  <p className="text-2xl font-bold">{stats.totalDocuments.toLocaleString()}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
          </div>

          {/* Connections List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Connections</h2>
              {connections.length > 0 && (
                <Button variant="outline" size="sm" onClick={loadConnections}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>

            {connections.length === 0 ? (
              <Card className="p-12 text-center">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No connections configured</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your data sources to start ingesting documents automatically
                </p>
                <CreateConnectionDialog onConnectionCreated={handleConnectionCreated} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {connections.map((connection) => (
                  <div key={connection.id} className="relative">
                    <ConnectionCard
                      connection={connection}
                      onTest={handleTestConnection}
                      onSync={handleSyncConnection}
                      onDelete={handleDeleteConnection}
                    />
                    {testingConnection === connection.id && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Testing connection...</span>
                        </div>
                      </div>
                    )}
                    {syncingConnection === connection.id && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Synchronizing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Connections;