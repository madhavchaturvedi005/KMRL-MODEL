-- Enable UUID extension if not already enabled
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

-- Create index for better performance
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_display_name ON companies(display_name);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Companies are viewable by everyone (for company search)
CREATE POLICY "Companies are viewable by everyone" 
    ON companies FOR SELECT 
    USING (true);

-- Insert sample companies data with specific IDs to match mock data
INSERT INTO companies (id, name, display_name, domain, admin_emails) VALUES
('00000000-0000-0000-0000-000000000001', 'KMRL', 'Kochi Metro Rail Limited', 'kmrl.com', ARRAY['admin@kmrl.com']),
('00000000-0000-0000-0000-000000000002', 'DMRC', 'Delhi Metro Rail Corporation', 'delhimetrorail.com', ARRAY['admin@delhimetrorail.com']),
('00000000-0000-0000-0000-000000000003', 'BMRCL', 'Bangalore Metro Rail Corporation Limited', 'bmrc.co.in', ARRAY['admin@bmrc.co.in']),
('00000000-0000-0000-0000-000000000004', 'MMRDA', 'Mumbai Metropolitan Region Development Authority', 'mmrda.maharashtra.gov.in', ARRAY['admin@mmrda.gov.in']),
('00000000-0000-0000-0000-000000000005', 'CMRL', 'Chennai Metro Rail Limited', 'chennaimetrorail.org', ARRAY['admin@chennaimetrorail.org']),
('00000000-0000-0000-0000-000000000006', 'HMRL', 'Hyderabad Metro Rail Limited', 'hmrl.co.in', ARRAY['admin@hmrl.co.in']),
('00000000-0000-0000-0000-000000000007', 'PMRDA', 'Pune Metropolitan Region Development Authority', 'pmrda.gov.in', ARRAY['admin@pmrda.gov.in']),
('00000000-0000-0000-0000-000000000008', 'GMRC', 'Gujarat Metro Rail Corporation', 'gujaratmetrorail.com', ARRAY['admin@gujaratmetrorail.com']);

-- Verify the table was created and data inserted
SELECT * FROM companies ORDER BY display_name;