-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    admin_emails TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    login_type VARCHAR(20) NOT NULL CHECK (login_type IN ('admin', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registration_applications table
CREATE TABLE registration_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    full_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    work_email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    id_type VARCHAR(20) NOT NULL CHECK (id_type IN ('company_id', 'national_id', 'passport')),
    id_document_url TEXT NOT NULL,
    live_photo_url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(200),
    assigned_role VARCHAR(100),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_registration_applications_status ON registration_applications(status);
CREATE INDEX idx_registration_applications_company_id ON registration_applications(company_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registration_applications_updated_at BEFORE UPDATE ON registration_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample companies
INSERT INTO companies (name, display_name, domain, admin_emails) VALUES
('KMRL', 'Kochi Metro Rail Limited', 'kmrl.com', ARRAY['admin@kmrl.com']),
('DMRC', 'Delhi Metro Rail Corporation', 'delhimetrorail.com', ARRAY['admin@delhimetrorail.com']),
('BMRCL', 'Bangalore Metro Rail Corporation Limited', 'bmrc.co.in', ARRAY['admin@bmrc.co.in']);

-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'admin-user-uuid' with the actual UUID from Supabase Auth
-- INSERT INTO employees (id, employee_id, name, email, role, department, login_type, status) VALUES
-- ('admin-user-uuid', 'ADM001', 'Admin User', 'admin@kmrl.com', 'Station Controller', 'Administration', 'admin', 'active');

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('id-documents', 'id-documents', true),
('live-photos', 'live-photos', true);

-- Set up Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (public read)
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);

-- RLS Policies for employees (users can only see their own data, admins can see all)
CREATE POLICY "Users can view own employee data" ON employees FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all employee data" ON employees FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

-- RLS Policies for registration_applications (admins can see all, users can create)
CREATE POLICY "Anyone can create registration applications" ON registration_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all registration applications" ON registration_applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);
CREATE POLICY "Admins can update registration applications" ON registration_applications FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

-- Storage policies
CREATE POLICY "Anyone can upload to id-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'id-documents');
CREATE POLICY "Anyone can upload to live-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'live-photos');
CREATE POLICY "Admins can view id-documents" ON storage.objects FOR SELECT USING (
    bucket_id = 'id-documents' AND 
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);
CREATE POLICY "Admins can view live-photos" ON storage.objects FOR SELECT USING (
    bucket_id = 'live-photos' AND 
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);