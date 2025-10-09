import { User } from '@/types/auth';

// Single admin user for fallback/development
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
];

// Mock password for admin (in real app, this would be hashed)
export const mockPasswords: Record<string, string> = {
  'ADM001': 'admin123',
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
