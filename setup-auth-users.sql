-- Setup script to create Supabase Auth users and corresponding employee records

-- First, let's create the employee records with login_id
INSERT INTO employees (
    employee_id,
    full_name,
    email,
    role,
    department,
    designation,
    login_type,
    status,
    is_active,
    login_id,
    login_password,
    created_at,
    updated_at
) VALUES 
-- Admin user
(
    'ADM001',
    'Admin User',
    'admin@company.com',
    'Administrator',
    'Administration',
    'System Administrator',
    'admin',
    'active',
    true,
    'admin',  -- login_id for login
    null,     -- login_password not used when using Supabase Auth
    NOW(),
    NOW()
),
-- Test employee
(
    'EMP001',
    'Test Employee',
    'test@company.com',
    'Staff',
    'IT',
    'Software Developer',
    'staff',
    'active',
    true,
    'test123',  -- login_id for login
    null,       -- login_password not used when using Supabase Auth
    NOW(),
    NOW()
),
-- Your user
(
    'USR001',
    'Meet Bhavsar',
    'meetbhavsar34@gmail.com',
    'Administrator',
    'IT',
    'System Administrator',
    'admin',
    'active',
    true,
    'meetbhavsar34@gmail.com',  -- Your email as login_id
    null,                       -- login_password not used when using Supabase Auth
    NOW(),
    NOW()
)
ON CONFLICT (employee_id) DO UPDATE SET
    login_id = EXCLUDED.login_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the employee records
SELECT employee_id, full_name, email, login_id, is_active, status, role
FROM employees 
WHERE employee_id IN ('ADM001', 'EMP001', 'USR001')
ORDER BY employee_id;