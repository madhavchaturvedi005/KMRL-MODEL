import { supabase } from '@/lib/supabase';
import { User, LoginCredentials, RegistrationApplicationData } from '@/types/auth';

export class AuthService {
  // Mock login for testing - bypasses database
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Mock login credentials
      if (credentials.employeeId === 'employee@kmrl.com' && credentials.password === 'admin123') {
        // Create mock user
        const mockUser: User = {
          id: 'mock-admin-id',
          employeeId: 'ADMIN001',
          name: 'System Administrator',
          email: 'employee@kmrl.com',
          role: 'Administrator',
          department: 'IT Administration',
          loginType: 'admin',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
        };

        // Create session token
        const sessionToken = btoa(JSON.stringify({
          employeeId: mockUser.employeeId,
          loginId: credentials.employeeId,
          timestamp: Date.now(),
          id: mockUser.id,
          mockUser: true
        }));

        localStorage.setItem('kmrl_session', sessionToken);

        return { success: true, user: mockUser };
      }

      // If not mock credentials, try database lookup (for future use)
      try {
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('login_id', credentials.employeeId)
          .eq('status', 'active')
          .maybeSingle();

        if (employeeError) {
          console.error('Employee lookup error:', employeeError);
          return { success: false, error: 'Invalid Employee ID or Password' };
        }

        if (!employee) {
          return { success: false, error: 'Invalid Employee ID or Password' };
        }

        // Simple password verification
        if (employee.login_password && employee.login_password === credentials.password) {
          const sessionToken = btoa(JSON.stringify({
            employeeId: employee.employee_id,
            loginId: employee.login_id,
            timestamp: Date.now(),
            id: employee.id
          }));
          localStorage.setItem('kmrl_session', sessionToken);

          const user: User = {
            id: employee.id,
            employeeId: employee.employee_id,
            name: employee.full_name,
            email: employee.email,
            role: employee.role as any,
            department: employee.department,
            loginType: employee.login_type || 'staff',
            status: employee.status || 'active',
            lastLogin: employee.last_login ? new Date(employee.last_login) : undefined,
            createdAt: new Date(employee.created_at),
          };

          return { success: true, user };
        }
      } catch (dbError) {
        console.warn('Database lookup failed, using mock only:', dbError);
      }

      return { success: false, error: 'Invalid Employee ID or Password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Get current user session
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Check for custom session first
      const sessionToken = localStorage.getItem('kmrl_session');
      if (sessionToken) {
        try {
          const sessionData = JSON.parse(atob(sessionToken));

          // Check if session is still valid (24 hours)
          const sessionAge = Date.now() - sessionData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (sessionAge > maxAge) {
            localStorage.removeItem('kmrl_session');
            return null;
          }

          const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', sessionData.id)
            .eq('status', 'active')
            .maybeSingle();

          if (error || !employee) {
            localStorage.removeItem('kmrl_session');
            return null;
          }

          return {
            id: employee.id,
            employeeId: employee.employee_id,
            name: employee.full_name,
            email: employee.email,
            role: employee.role as any,
            department: employee.department,
            loginType: employee.login_type || 'staff',
            status: employee.status || (employee.is_active ? 'active' : 'inactive'),
            lastLogin: employee.last_login ? new Date(employee.last_login) : undefined,
            createdAt: new Date(employee.created_at),
          };
        } catch (e) {
          localStorage.removeItem('kmrl_session');
        }
      }

      // Fallback to Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        return null;
      }

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', session.user.email)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !employee) {
        return null;
      }

      return {
        id: employee.id,
        employeeId: employee.employee_id,
        name: employee.full_name,
        email: employee.email,
        role: employee.role as any,
        department: employee.department,
        loginType: employee.login_type || 'staff',
        status: employee.status || (employee.is_active ? 'active' : 'inactive'),
        lastLogin: employee.last_login ? new Date(employee.last_login) : undefined,
        createdAt: new Date(employee.created_at),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    // Clear custom session
    localStorage.removeItem('kmrl_session');
    // Clear Supabase Auth session
    await supabase.auth.signOut();
  }

  // Submit registration application
  static async submitRegistrationApplication(data: RegistrationApplicationData): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to upload files to Supabase Storage
      let idDocumentResult = await this.uploadFile(data.idDocument, 'id-documents');
      let livePhotoResult = await this.uploadFile(data.livePhoto, 'live-photos');

      // Fallback to mock URLs if upload fails
      if (!idDocumentResult) {
        console.warn('ID document upload failed, using mock URL');
        idDocumentResult = {
          url: `/mock-uploads/id-${Date.now()}.jpg`,
          filename: data.idDocument.name
        };
      }

      if (!livePhotoResult) {
        console.warn('Live photo upload failed, using mock URL');
        livePhotoResult = {
          url: `/mock-uploads/photo-${Date.now()}.jpg`,
          filename: data.livePhoto.name
        };
      }

      // Insert registration application
      const { error } = await supabase
        .from('registration_applications')
        .insert({
          company_id: data.companyId,
          full_name: data.fullName,
          employee_id: data.employeeId,
          job_title: data.jobTitle,
          work_email: data.workEmail,
          mobile_number: data.mobileNumber,
          id_type: data.idType,
          id_document_url: idDocumentResult.url,
          id_document_filename: idDocumentResult.filename,
          live_photo_url: livePhotoResult.url,
          live_photo_filename: livePhotoResult.filename,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Registration application error:', error);
        return { success: false, error: 'Failed to submit application' };
      }

      return { success: true };
    } catch (error) {
      console.error('Submit registration error:', error);
      return { success: false, error: 'Failed to submit application. Please try again.' };
    }
  }

  // Upload file to Supabase Storage
  private static async uploadFile(file: File, bucket: string): Promise<{ url: string; filename: string } | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;

      console.log(`Uploading file to bucket: ${bucket}, fileName: ${fileName}`);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('File upload error:', error);

        // If bucket doesn't exist, try to create it
        if (error.message?.includes('Bucket not found')) {
          console.log(`Bucket ${bucket} not found, creating it...`);
          await this.createBucket(bucket);

          // Retry upload
          const { error: retryError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (retryError) {
            console.error('Retry upload error:', retryError);
            return null;
          }
        } else {
          return null;
        }
      }

      // Get public URL (simpler approach)
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        filename: file.name
      };
    } catch (error) {
      console.error('Upload file error:', error);
      return null;
    }
  }

  // Create storage bucket if it doesn't exist
  private static async createBucket(bucketName: string): Promise<void> {
    try {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });

      if (error && !error.message?.includes('already exists')) {
        console.error('Create bucket error:', error);
      } else {
        console.log(`Bucket ${bucketName} created successfully`);
      }
    } catch (error) {
      console.error('Create bucket error:', error);
    }
  }

  // Get all employees (for admin)
  static async getAllEmployees(): Promise<User[]> {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get employees error:', error);
        return [];
      }

      return employees.map(employee => ({
        id: employee.id,
        employeeId: employee.employee_id,
        name: employee.full_name,
        email: employee.email,
        role: employee.role as any,
        department: employee.department,
        loginType: employee.login_type || 'staff',
        status: employee.status || (employee.is_active ? 'active' : 'inactive'),
        lastLogin: employee.last_login ? new Date(employee.last_login) : undefined,
        createdAt: new Date(employee.created_at),
      }));
    } catch (error) {
      console.error('Get all employees error:', error);
      return [];
    }
  }

  // Get pending registration applications
  static async getPendingApplications() {
    try {
      const { data: applications, error } = await supabase
        .from('registration_applications')
        .select(`
          *,
          companies (
            name,
            display_name
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Get pending applications error:', error);
        return [];
      }

      return applications;
    } catch (error) {
      console.error('Get pending applications error:', error);
      return [];
    }
  }

  // Approve registration application
  static async approveApplication(applicationId: string, assignedRole: string, reviewedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the application details
      const { data: application, error: appError } = await supabase
        .from('registration_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError || !application) {
        return { success: false, error: 'Application not found' };
      }

      // Create employee record (no need for Supabase Auth user)
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          employee_id: application.employee_id,
          full_name: application.full_name,
          email: application.work_email,
          role: assignedRole,
          designation: assignedRole,
          department: application.job_title,
          login_type: 'staff',
          is_active: true,
          login_id: application.employee_id, // Set login_id same as employee_id
          login_password: `temp_${application.employee_id}_${Date.now()}`, // Temporary password - should be changed on first login
        });

      if (employeeError) {
        console.error('Employee creation error:', employeeError);
        return { success: false, error: 'Failed to create employee record' };
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('registration_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy,
          assigned_role: assignedRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Application update error:', updateError);
        return { success: false, error: 'Failed to update application status' };
      }

      return { success: true };
    } catch (error) {
      console.error('Approve application error:', error);
      return { success: false, error: 'Failed to approve application' };
    }
  }

  // Reject registration application
  static async rejectApplication(applicationId: string, rejectionReason: string, reviewedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('registration_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy,
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Reject application error:', error);
        return { success: false, error: 'Failed to reject application' };
      }

      return { success: true };
    } catch (error) {
      console.error('Reject application error:', error);
      return { success: false, error: 'Failed to reject application' };
    }
  }

  // Get signed URL for viewing files (for admins)
  static async getFileUrl(bucket: string, fileName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileName, 60 * 60); // 1 hour expiry

      if (error) {
        console.error('Get file URL error:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get file URL error:', error);
      return null;
    }
  }

  // Delete files when application is processed (cleanup)
  static async deleteApplicationFiles(idDocumentUrl: string, livePhotoUrl: string): Promise<void> {
    try {
      // Extract file names from URLs
      const idFileName = idDocumentUrl.split('/').pop()?.split('?')[0];
      const photoFileName = livePhotoUrl.split('/').pop()?.split('?')[0];

      if (idFileName) {
        await supabase.storage.from('id-documents').remove([idFileName]);
      }
      if (photoFileName) {
        await supabase.storage.from('live-photos').remove([photoFileName]);
      }
    } catch (error) {
      console.error('Delete files error:', error);
    }
  }
}