export interface Connection {
  id: string;
  name: string;
  type: 'email' | 'sharepoint' | 'maximo' | 'whatsapp' | 'cloud' | 'scanner';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string | null;
  config: {
    [key: string]: any;
  };
  createdDate: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  documentsCount: number;
  description?: string;
}

export interface ConnectionTemplate {
  type: Connection['type'];
  name: string;
  description: string;
  icon: string;
  configFields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'email' | 'url' | 'select' | 'number';
    required: boolean;
    placeholder?: string;
    options?: string[];
    description?: string;
  }[];
  features: string[];
}

export class ConnectionService {
  private readonly STORAGE_KEY = 'kmrl_connections';

  generateId(): string {
    return 'conn_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getConnectionTemplates(): ConnectionTemplate[] {
    return [
      {
        type: 'email',
        name: 'Email Integration',
        description: 'Connect to email accounts to automatically ingest documents from attachments',
        icon: 'Mail',
        configFields: [
          { name: 'server', label: 'Email Server', type: 'text', required: true, placeholder: 'imap.gmail.com' },
          { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '993' },
          { name: 'username', label: 'Username/Email', type: 'email', required: true },
          { name: 'password', label: 'Password/App Password', type: 'password', required: true },
          { name: 'folder', label: 'Folder to Monitor', type: 'text', required: false, placeholder: 'INBOX' },
          { name: 'fileTypes', label: 'File Types', type: 'select', required: false, options: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'All'] }
        ],
        features: [
          'Automatic attachment processing',
          'Real-time email monitoring',
          'Sender-based categorization',
          'Subject line analysis'
        ]
      },
      {
        type: 'sharepoint',
        name: 'SharePoint Repository',
        description: 'Connect to SharePoint document libraries for centralized document access',
        icon: 'FolderOpen',
        configFields: [
          { name: 'siteUrl', label: 'SharePoint Site URL', type: 'url', required: true, placeholder: 'https://company.sharepoint.com/sites/sitename' },
          { name: 'libraryName', label: 'Document Library Name', type: 'text', required: true, placeholder: 'Documents' },
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          { name: 'folder', label: 'Specific Folder Path', type: 'text', required: false, placeholder: '/Engineering/Reports' }
        ],
        features: [
          'Bulk document synchronization',
          'Metadata preservation',
          'Version control tracking',
          'Permission-based access'
        ]
      },
      {
        type: 'maximo',
        name: 'Maximo Exports',
        description: 'Connect to IBM Maximo for maintenance and asset management documents',
        icon: 'Settings',
        configFields: [
          { name: 'serverUrl', label: 'Maximo Server URL', type: 'url', required: true, placeholder: 'https://maximo.company.com' },
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          { name: 'database', label: 'Database Name', type: 'text', required: true, placeholder: 'MAXDB' },
          { name: 'exportPath', label: 'Export Directory', type: 'text', required: false, placeholder: '/exports/documents' }
        ],
        features: [
          'Work order documentation',
          'Asset maintenance records',
          'Preventive maintenance schedules',
          'Compliance reports'
        ]
      },
      {
        type: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Process documents shared via WhatsApp Business API',
        icon: 'MessageCircle',
        configFields: [
          { name: 'phoneNumber', label: 'Business Phone Number', type: 'text', required: true, placeholder: '+91XXXXXXXXXX' },
          { name: 'apiKey', label: 'WhatsApp Business API Key', type: 'password', required: true },
          { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
          { name: 'allowedContacts', label: 'Allowed Contact Numbers', type: 'text', required: false, description: 'Comma-separated list of allowed numbers' }
        ],
        features: [
          'PDF document processing',
          'Image OCR conversion',
          'Contact-based filtering',
          'Real-time notifications'
        ]
      },
      {
        type: 'cloud',
        name: 'Cloud Storage',
        description: 'Connect to cloud storage services like Google Drive, OneDrive, Dropbox',
        icon: 'Cloud',
        configFields: [
          { name: 'provider', label: 'Cloud Provider', type: 'select', required: true, options: ['Google Drive', 'OneDrive', 'Dropbox', 'AWS S3', 'Azure Blob'] },
          { name: 'accessToken', label: 'Access Token/API Key', type: 'password', required: true },
          { name: 'folderPath', label: 'Folder Path', type: 'text', required: false, placeholder: '/KMRL Documents' },
          { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: false }
        ],
        features: [
          'Multi-provider support',
          'Folder synchronization',
          'Automatic file detection',
          'OAuth authentication'
        ]
      },
      {
        type: 'scanner',
        name: 'Document Scanner',
        description: 'Connect to network scanners for hard-copy document digitization',
        icon: 'Scan',
        configFields: [
          { name: 'scannerIp', label: 'Scanner IP Address', type: 'text', required: true, placeholder: '192.168.1.100' },
          { name: 'scannerModel', label: 'Scanner Model', type: 'select', required: true, options: ['Canon imageRUNNER', 'HP LaserJet MFP', 'Xerox WorkCentre', 'Ricoh MP', 'Other'] },
          { name: 'outputFolder', label: 'Output Folder', type: 'text', required: true, placeholder: '\\\\scanner\\scanned_docs' },
          { name: 'resolution', label: 'Scan Resolution (DPI)', type: 'select', required: false, options: ['150', '300', '600', '1200'] },
          { name: 'colorMode', label: 'Color Mode', type: 'select', required: false, options: ['Color', 'Grayscale', 'Black & White'] }
        ],
        features: [
          'High-resolution scanning',
          'OCR text extraction',
          'Batch processing',
          'Quality optimization'
        ]
      }
    ];
  }

  saveConnection(connectionData: Omit<Connection, 'id' | 'createdDate' | 'documentsCount'>): Connection {
    const newConnection: Connection = {
      ...connectionData,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      documentsCount: 0
    };

    const connections = this.getAllConnections();
    connections.push(newConnection);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
    
    return newConnection;
  }

  getAllConnections(): Connection[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading connections from storage:', error);
      return [];
    }
  }

  getConnectionById(id: string): Connection | null {
    const connections = this.getAllConnections();
    return connections.find(conn => conn.id === id) || null;
  }

  updateConnection(id: string, updates: Partial<Connection>): boolean {
    const connections = this.getAllConnections();
    const index = connections.findIndex(conn => conn.id === id);
    
    if (index === -1) return false;
    
    connections[index] = { ...connections[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
    return true;
  }

  deleteConnection(id: string): boolean {
    const connections = this.getAllConnections();
    const filtered = connections.filter(conn => conn.id !== id);
    
    if (filtered.length === connections.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  testConnection(id: string): Promise<{ success: boolean; message: string }> {
    // Simulate connection testing
    return new Promise((resolve) => {
      setTimeout(() => {
        const connection = this.getConnectionById(id);
        if (!connection) {
          resolve({ success: false, message: 'Connection not found' });
          return;
        }

        // Simulate different test results based on connection type
        const success = Math.random() > 0.2; // 80% success rate for demo
        resolve({
          success,
          message: success 
            ? `Successfully connected to ${connection.name}`
            : `Failed to connect to ${connection.name}. Please check your configuration.`
        });
      }, 2000);
    });
  }

  syncConnection(id: string): Promise<{ success: boolean; documentsProcessed: number; message: string }> {
    // Simulate document synchronization
    return new Promise((resolve) => {
      setTimeout(() => {
        const connection = this.getConnectionById(id);
        if (!connection) {
          resolve({ success: false, documentsProcessed: 0, message: 'Connection not found' });
          return;
        }

        const documentsProcessed = Math.floor(Math.random() * 20) + 1;
        const success = Math.random() > 0.1; // 90% success rate for demo

        if (success) {
          // Update connection with new sync time and document count
          this.updateConnection(id, {
            lastSync: new Date().toISOString(),
            documentsCount: connection.documentsCount + documentsProcessed,
            status: 'connected'
          });
        }

        resolve({
          success,
          documentsProcessed: success ? documentsProcessed : 0,
          message: success 
            ? `Successfully synchronized ${documentsProcessed} documents from ${connection.name}`
            : `Synchronization failed for ${connection.name}. Please try again.`
        });
      }, 3000);
    });
  }

  getConnectionStats(): {
    total: number;
    connected: number;
    disconnected: number;
    totalDocuments: number;
  } {
    const connections = this.getAllConnections();
    return {
      total: connections.length,
      connected: connections.filter(c => c.status === 'connected').length,
      disconnected: connections.filter(c => c.status === 'disconnected').length,
      totalDocuments: connections.reduce((sum, c) => sum + c.documentsCount, 0)
    };
  }
}

export const connectionService = new ConnectionService();