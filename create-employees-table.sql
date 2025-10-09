-- Create employees table with all required columns
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    login_type VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (login_type IN ('admin', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_login_type ON employees(login_type);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_employees_updated_at();

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own employee data" ON employees;
DROP POLICY IF EXISTS "Admins can view all employee data" ON employees;
DROP POLICY IF EXISTS "Admins can update employee data" ON employees;
DROP POLICY IF EXISTS "Admins can insert employee data" ON employees;

-- RLS Policies for employees
CREATE POLICY "Users can view own employee data" ON employees 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all employee data" ON employees 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

CREATE POLICY "Admins can update employee data" ON employees 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

CREATE POLICY "Admins can insert employee data" ON employees 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE id = auth.uid() AND login_type = 'admin'
    )
);

-- Insert sample admin user (replace UUID with actual auth user ID)
-- You'll need to get the actual UUID from Supabase Auth after creating the user
INSERT INTO employees (id, employee_id, name, email, role, department, login_type, status) 
VALUES 
-- Replace 'REPLACE_WITH_ACTUAL_AUTH_UUID' with the real UUID from Supabase Auth
-- ('REPLACE_WITH_ACTUAL_AUTH_UUID', 'ADM001', 'KMRL Admin', 'admin@kmrl.com', 'Administrator', 'Administration', 'admin', 'active')
-- Uncomment and update the line above after creating the auth user

-- For now, let's create a sample entry to test the structure
('00000000-0000-0000-0000-000000000001', 'ADM001', 'KMRL Admin', 'admin@kmrl.com', 'Administrator', 'Administration', 'admin', 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;