-- Create registration_applications table with proper file URL storage
CREATE TABLE IF NOT EXISTS registration_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    full_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    work_email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    id_type VARCHAR(20) NOT NULL CHECK (id_type IN ('company_id', 'national_id', 'passport')),
    
    -- File storage URLs
    id_document_url TEXT NOT NULL,  -- URL to the uploaded ID document
    id_document_filename TEXT,      -- Original filename for reference
    live_photo_url TEXT NOT NULL,   -- URL to the uploaded live photo
    live_photo_filename TEXT,       -- Original filename for reference
    
    -- Application status and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES employees(id),
    assigned_role VARCHAR(100),
    rejection_reason TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registration_applications_status ON registration_applications(status);
CREATE INDEX IF NOT EXISTS idx_registration_applications_company_id ON registration_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_registration_applications_submitted_at ON registration_applications(submitted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_registration_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registration_applications_updated_at 
    BEFORE UPDATE ON registration_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_registration_applications_updated_at();

-- Enable Row Level Security
ALTER TABLE registration_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create registration applications" ON registration_applications 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all registration applications" ON registration_applications 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

CREATE POLICY "Admins can update registration applications" ON registration_applications 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'registration_applications' 
ORDER BY ordinal_position;