import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          employee_id: string;
          name: string;
          email: string;
          role: string;
          department: string;
          login_type: 'admin' | 'staff';
          status: 'active' | 'inactive';
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          name: string;
          email: string;
          role: string;
          department: string;
          login_type: 'admin' | 'staff';
          status?: 'active' | 'inactive';
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          name?: string;
          email?: string;
          role?: string;
          department?: string;
          login_type?: 'admin' | 'staff';
          status?: 'active' | 'inactive';
          last_login?: string | null;
          updated_at?: string;
        };
      };
      registration_applications: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          employee_id: string;
          job_title: string;
          work_email: string;
          mobile_number: string;
          id_type: 'company_id' | 'national_id' | 'passport';
          id_document_url: string;
          live_photo_url: string;
          status: 'pending' | 'approved' | 'rejected';
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          assigned_role: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          full_name: string;
          employee_id: string;
          job_title: string;
          work_email: string;
          mobile_number: string;
          id_type: 'company_id' | 'national_id' | 'passport';
          id_document_url: string;
          live_photo_url: string;
          status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          assigned_role?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          assigned_role?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          domain: string;
          admin_emails: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          domain: string;
          admin_emails: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          domain?: string;
          admin_emails?: string[];
          updated_at?: string;
        };
      };
    };
  };
}