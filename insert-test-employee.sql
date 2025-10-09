-- Insert a test employee with login credentials
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
) VALUES (
    'EMP001',
    'Test Employee',
    'test@company.com',
    'Staff',
    'IT',
    'Software Developer',
    'staff',
    'active',
    true,
    'test123',  -- This is the login_id they'll use to login
    'password123',  -- This is the login_password (should be hashed in production)
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    login_id = EXCLUDED.login_id,
    login_password = EXCLUDED.login_password,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Insert an admin user as well
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
) VALUES (
    'ADM001',
    'Admin User',
    'admin@company.com',
    'Administrator',
    'Administration',
    'System Administrator',
    'admin',
    'active',
    true,
    'admin',  -- login_id
    'admin123',  -- login_password
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    login_id = EXCLUDED.login_id,
    login_password = EXCLUDED.login_password,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the records were created
SELECT employee_id, full_name, email, login_id, login_password, is_active, status, role, designation
FROM employees 
WHERE employee_id IN ('EMP001', 'ADM001');