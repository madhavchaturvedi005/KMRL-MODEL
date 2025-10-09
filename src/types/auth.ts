export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  loginType: LoginType;
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
}

export type LoginType = 'admin' | 'staff';

export type UserRole = 'Administrator' | 'Station Controller' | 'Procurement Officer' | 'Rolling Stock Engineer' | 'Safety Officer' | 'Field Technician';

export interface LoginCredentials {
  employeeId: string;
  password: string;
}

export interface SignupData {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department: string;
  loginType: LoginType;
}

// Registration Application Types
export interface Company {
  id: string;
  name: string;
  displayName: string;
  domain: string;
  adminEmails: string[];
}

export interface RegistrationApplication {
  id: string;
  companyId: string;
  fullName: string;
  employeeId: string;
  jobTitle: string;
  workEmail: string;
  mobileNumber: string;
  idType: 'company_id' | 'national_id' | 'passport';
  idDocumentUrl: string;
  livePhotoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  assignedRole?: UserRole;
  rejectionReason?: string;
}

export interface RegistrationApplicationData {
  companyId: string;
  fullName: string;
  employeeId: string;
  jobTitle: string;
  workEmail: string;
  mobileNumber: string;
  idType: 'company_id' | 'national_id' | 'passport';
  idDocument: File;
  livePhoto: File;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  submitRegistrationApplication: (data: RegistrationApplicationData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}
