-- Replace 'PASTE_USER_UUID_HERE' with the actual UUID from Supabase Auth
INSERT INTO employees (id, employee_id, name, email, role, department, login_type, status) VALUES
('PASTE_USER_UUID_HERE', 'ADM001', 'KMRL Admin', 'admin@kmrl.com', 'Administrator', 'Administration', 'admin', 'active');

-- Verify the admin user was created
SELECT * FROM employees WHERE login_type = 'admin';