import { User } from '@/types/auth';

// Mock user database
export const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'ADM001',
    name: 'Admin User',
    email: 'admin@kmrl.com',
    role: 'Station Controller',
    department: 'Administration',
    loginType: 'admin',
    status: 'active',
    lastLogin: new Date('2024-12-19'),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    employeeId: 'STF001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@kmrl.com',
    role: 'Station Controller',
    department: 'Operations',
    loginType: 'staff',
    status: 'active',
    lastLogin: new Date('2024-12-18'),
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    employeeId: 'STF002',
    name: 'Priya Sharma',
    email: 'priya.sharma@kmrl.com',
    role: 'Procurement Officer',
    department: 'Procurement',
    loginType: 'staff',
    status: 'active',
    lastLogin: new Date('2024-12-17'),
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    employeeId: 'STF003',
    name: 'Amit Singh',
    email: 'amit.singh@kmrl.com',
    role: 'Rolling Stock Engineer',
    department: 'Engineering',
    loginType: 'staff',
    status: 'active',
    lastLogin: new Date('2024-12-16'),
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    employeeId: 'STF004',
    name: 'Sunita Patel',
    email: 'sunita.patel@kmrl.com',
    role: 'Safety Officer',
    department: 'Safety',
    loginType: 'staff',
    status: 'active',
    lastLogin: new Date('2024-12-15'),
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    employeeId: 'STF005',
    name: 'Vikram Reddy',
    email: 'vikram.reddy@kmrl.com',
    role: 'Field Technician',
    department: 'Maintenance',
    loginType: 'staff',
    status: 'active',
    lastLogin: new Date('2024-12-14'),
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '7',
    employeeId: 'STF006',
    name: 'Anita Desai',
    email: 'anita.desai@kmrl.com',
    role: 'Station Controller',
    department: 'Operations',
    loginType: 'staff',
    status: 'inactive',
    lastLogin: new Date('2024-12-10'),
    createdAt: new Date('2024-03-01'),
  },
];

// Mock passwords (in real app, these would be hashed)
export const mockPasswords: Record<string, string> = {
  'ADM001': 'admin123',
  'STF001': 'staff123',
  'STF002': 'staff123',
  'STF003': 'staff123',
  'STF004': 'staff123',
  'STF005': 'staff123',
  'STF006': 'staff123',
};

// Helper function to find user by employee ID
export const findUserByEmployeeId = (employeeId: string): User | undefined => {
  return mockUsers.find(user => user.employeeId === employeeId);
};

// Helper function to validate password
export const validatePassword = (employeeId: string, password: string): boolean => {
  return mockPasswords[employeeId] === password;
};

// Helper function to add new user
export const addUser = (user: User, password: string): void => {
  mockUsers.push(user);
  mockPasswords[user.employeeId] = password;
};

// Helper function to get all users (for admin panel)
export const getAllUsers = (): User[] => {
  return mockUsers;
};

// Helper function to update user status
export const updateUserStatus = (employeeId: string, status: 'active' | 'inactive'): boolean => {
  const user = mockUsers.find(u => u.employeeId === employeeId);
  if (user) {
    user.status = status;
    return true;
  }
  return false;
};

// Helper function to update last login
export const updateLastLogin = (employeeId: string): void => {
  const user = mockUsers.find(u => u.employeeId === employeeId);
  if (user) {
    user.lastLogin = new Date();
  }
};