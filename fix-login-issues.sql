-- Fix login issues by ensuring we have a test user with proper credentials

-- First, let's see what we have
SELECT employee_id, login_id, login_password, status, is_active FROM employees LIMIT 5;

-- Insert or update a test admin user
INSERT INTO employees (
    employee_id,
    full_name,
    email,
    role,
    department,
    login_type,
    status,
    login_id,
    login_password,
    is_active,
    created_at,
    updated_at
) VALUES (
    'ADMIN001',
    'System Administrator',
    'admin@kmrl.com',
    'Administrator',
    'IT Administration',
    'admin',
    'active',
    'admin@kmrl.com',
    'admin123',
    true,
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    login_id = EXCLUDED.login_id,
    login_password = EXCLUDED.login_password,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the record
SELECT employee_id, login_id, login_password, status, is_active, email 
FROM employees 
WHERE employee_id = 'ADMIN001';