import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupData, AuthContextType, RegistrationApplicationData } from '@/types/auth';
import { AuthService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    const result = await AuthService.login(credentials);
    
    if (result.success && result.user) {
      setUser(result.user);
    }
    
    setIsLoading(false);
    return { success: result.success, error: result.error };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // For now, signup is disabled as employees should be created through admin approval
    setIsLoading(false);
    return { success: false, error: 'Direct signup is not available. Please use the Request Access feature.' };
  };

  const submitRegistrationApplication = async (data: RegistrationApplicationData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    const result = await AuthService.submitRegistrationApplication(data);
    
    setIsLoading(false);
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
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
