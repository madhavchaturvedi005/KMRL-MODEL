import { Company, RegistrationApplication } from '@/types/auth';

export const mockCompanies: Company[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'KMRL',
    displayName: 'Kochi Metro Rail Limited',
    domain: 'kmrl.com',
    adminEmails: ['admin@kmrl.com'],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'DMRC',
    displayName: 'Delhi Metro Rail Corporation',
    domain: 'delhimetrorail.com',
    adminEmails: ['admin@delhimetrorail.com'],
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'BMRCL',
    displayName: 'Bangalore Metro Rail Corporation Limited',
    domain: 'bmrc.co.in',
    adminEmails: ['admin@bmrc.co.in'],
  },
];

export const mockRegistrationApplications: RegistrationApplication[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    companyId: '00000000-0000-0000-0000-000000000001',
    fullName: 'Arjun Nair',
    employeeId: 'STF007',
    jobTitle: 'Station Controller',
    workEmail: 'arjun.nair@kmrl.com',
    mobileNumber: '+91 9876543210',
    idType: 'company_id',
    idDocumentUrl: '/placeholder.svg',
    livePhotoUrl: '/placeholder.svg',
    status: 'pending',
    submittedAt: new Date('2024-12-20'),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    companyId: '00000000-0000-0000-0000-000000000001',
    fullName: 'Meera Krishnan',
    employeeId: 'STF008',
    jobTitle: 'Safety Officer',
    workEmail: 'meera.krishnan@kmrl.com',
    mobileNumber: '+91 9876543211',
    idType: 'national_id',
    idDocumentUrl: '/placeholder.svg',
    livePhotoUrl: '/placeholder.svg',
    status: 'pending',
    submittedAt: new Date('2024-12-19'),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    companyId: '00000000-0000-0000-0000-000000000001',
    fullName: 'Ravi Kumar',
    employeeId: 'STF009',
    jobTitle: 'Field Technician',
    workEmail: 'ravi.kumar@kmrl.com',
    mobileNumber: '+91 9876543212',
    idType: 'passport',
    idDocumentUrl: '/placeholder.svg',
    livePhotoUrl: '/placeholder.svg',
    status: 'pending',
    submittedAt: new Date('2024-12-18'),
  },
];

// Helper functions
export const findCompanyByName = (searchTerm: string): Company[] => {
  return mockCompanies.filter(company => 
    company.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find(company => company.id === id);
};

export const addRegistrationApplication = (application: Omit<RegistrationApplication, 'id' | 'submittedAt'>): RegistrationApplication => {
  const newApplication: RegistrationApplication = {
    ...application,
    id: (mockRegistrationApplications.length + 1).toString(),
    submittedAt: new Date(),
  };
  mockRegistrationApplications.push(newApplication);
  return newApplication;
};

export const getPendingApplications = (): RegistrationApplication[] => {
  return mockRegistrationApplications.filter(app => app.status === 'pending');
};

export const updateApplicationStatus = (
  id: string, 
  status: 'approved' | 'rejected', 
  reviewedBy: string,
  assignedRole?: string,
  rejectionReason?: string
): boolean => {
  const application = mockRegistrationApplications.find(app => app.id === id);
  if (application) {
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = reviewedBy;
    if (assignedRole) application.assignedRole = assignedRole as any;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    return true;
  }
  return false;
};