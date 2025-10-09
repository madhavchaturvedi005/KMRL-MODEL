import { supabase } from '@/lib/supabase';
import { Company } from '@/types/auth';

export class CompaniesService {
  // Get all companies
  static async getAllCompanies(): Promise<Company[]> {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('display_name');

      if (error) {
        console.error('Get companies error:', error);
        return [];
      }

      return companies.map(company => ({
        id: company.id,
        name: company.name,
        displayName: company.display_name,
        domain: company.domain,
        adminEmails: company.admin_emails || [],
      }));
    } catch (error) {
      console.error('Get all companies error:', error);
      return [];
    }
  }

  // Search companies by name
  static async searchCompanies(searchTerm: string): Promise<Company[]> {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .order('display_name');

      if (error) {
        console.error('Search companies error:', error);
        return [];
      }

      return companies.map(company => ({
        id: company.id,
        name: company.name,
        displayName: company.display_name,
        domain: company.domain,
        adminEmails: company.admin_emails || [],
      }));
    } catch (error) {
      console.error('Search companies error:', error);
      return [];
    }
  }

  // Get company by ID
  static async getCompanyById(id: string): Promise<Company | null> {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !company) {
        return null;
      }

      return {
        id: company.id,
        name: company.name,
        displayName: company.display_name,
        domain: company.domain,
        adminEmails: company.admin_emails || [],
      };
    } catch (error) {
      console.error('Get company by ID error:', error);
      return null;
    }
  }
}