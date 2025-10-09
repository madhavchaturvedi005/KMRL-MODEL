-- Add an employee with your email as login_id
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
    'yourpassword',  -- Replace with your desired password
    NOW(),
    NOW()
) ON CONFLICT (employee_id) DO UPDATE SET
    login_id = EXCLUDED.login_id,
    login_password = EXCLUDED.login_password,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the record was created
SELECT employee_id, full_name, email, login_id, login_password, is_active, status, role
FROM employees 
WHERE login_id = 'meetbhavsar34@gmail.com';
-- Chec
k what employees currently exist in the table
SELECT employee_id, full_name, email, login_id, is_active, status, role
FROM employees 
ORDER BY created_at DESC;