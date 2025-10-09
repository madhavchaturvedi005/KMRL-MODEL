import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupData, AuthContextType, RegistrationApplicationData } from '@/types/auth';
import { findUserByEmployeeId, validatePassword, addUser, mockUsers, updateLastLogin } from '@/data/mockUsers';
import { addRegistrationApplication } from '@/data/mockCompanies';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // Check for regular user session
    const savedUser = localStorage.getItem('kmrl_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('kmrl_user');
      }
    }


    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = findUserByEmployeeId(credentials.employeeId);
      
      if (!user) {
        setIsLoading(false);
        return { success: false, error: 'Employee ID not found' };
      }
      
      if (!validatePassword(credentials.employeeId, credentials.password)) {
        setIsLoading(false);
        return { success: false, error: 'Invalid password' };
      }
      
      // Update last login
      updateLastLogin(credentials.employeeId);
      
      setUser(user);
      localStorage.setItem('kmrl_user', JSON.stringify(user));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if employee ID already exists
      if (findUserByEmployeeId(data.employeeId)) {
        setIsLoading(false);
        return { success: false, error: 'Employee ID already exists' };
      }
      
      // Check if email already exists
      const existingUser = mockUsers.find(user => user.email === data.email);
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: 'Email already exists' };
      }
      
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        setIsLoading(false);
        return { success: false, error: 'Passwords do not match' };
      }
      
      // Create new user
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        loginType: data.loginType,
        status: 'active',
        createdAt: new Date(),
      };
      
      addUser(newUser, data.password);
      setUser(newUser);
      localStorage.setItem('kmrl_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const submitRegistrationApplication = async (data: RegistrationApplicationData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create URLs for uploaded files (in real app, these would be uploaded to cloud storage)
      const idDocumentUrl = URL.createObjectURL(data.idDocument);
      const livePhotoUrl = URL.createObjectURL(data.livePhoto);
      
      // Add the application to local mock database
      const application = addRegistrationApplication({
        companyId: data.companyId,
        fullName: data.fullName,
        employeeId: data.employeeId,
        jobTitle: data.jobTitle,
        workEmail: data.workEmail,
        mobileNumber: data.mobileNumber,
        idType: data.idType,
        idDocumentUrl,
        livePhotoUrl,
        status: 'pending',
      });

      // Registration stored locally for admin review
      console.log('✅ Registration application submitted successfully');
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Failed to submit application. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kmrl_user');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    submitRegistrationApplication,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};