-- Add missing login_type column to existing employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS login_type VARCHAR(20) DEFAULT 'staff' 
CHECK (login_type IN ('admin', 'staff'));

-- Add missing role column (mapped from designation)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role VARCHAR(100);

-- Update role column to match designation for existing records
UPDATE employees SET role = designation WHERE role IS NULL;

-- Add missing status column (mapped from is_active)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'inactive'));

-- Update status based on is_active for existing records
UPDATE employees SET status = CASE 
    WHEN is_active = true THEN 'active' 
    ELSE 'inactive' 
END WHERE status IS NULL OR status = 'active';

-- Add missing last_login column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_employees_login_type ON employees(login_type);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Insert a sample admin user (you'll need to replace the UUID with actual auth user ID)
INSERT INTO employees (
    id, 
    employee_id, 
    full_name, 
    email, 
    department, 
    designation, 
    role,
    login_type, 
    is_active,
    status,
    verification_status
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Replace with actual auth UUID
    'ADM001', 
    'KMRL Admin', 
    'admin@kmrl.com', 
    'Administration', 
    'Administrator',
    'Administrator',
    'admin', 
    true,
    'active',
    'approved'
) ON CONFLICT (employee_id) DO UPDATE SET
    login_type = EXCLUDED.login_type,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Verify the changes
SELECT id, employee_id, full_name, email, designation, role, login_type, is_active, status, verification_status
FROM employees 
WHERE employee_id = 'ADM001';