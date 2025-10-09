# Hashed Password Authentication Setup

Since your `login_password` field contains hashed passwords, here's how to set up the system:

## Step 1: Create Password Verification Function

Run the `create-password-verification-function.sql` script in your Supabase SQL Editor. This creates a function to verify hashed passwords.

## Step 2: Determine Your Hash Method

First, check what hashing method you're using. Common methods:

- **bcrypt** (recommended) - hashes look like `$2b$10$...`
- **SHA256** - hashes are 64 character hex strings
- **MD5** - hashes are 32 character hex strings
- **Custom method** - you'll need to modify the function

## Step 3: Test the Function

```sql
-- Test with your actual data
SELECT verify_password('your_test_password', 'your_actual_hash_from_db');
```

## Step 4: Update Employees with Hashed Passwords

```sql
-- Example: Add employees with hashed passwords
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
    login_password  -- This should be the hashed password
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
    'admin',
    '$2b$10$your_bcrypt_hash_here'  -- Replace with actual hash
);
```

## How It Works Now:

1. **User enters login_id and password**
2. **System finds employee by login_id**
3. **If login_password exists:**
   - Uses `verify_password()` function to check hash
   - Creates custom session in localStorage
4. **If login_password is null:**
   - Falls back to Supabase Auth with email/password
5. **Session management handles both types**

## Benefits:

✅ **Secure hashed passwords** - Never store plain text
✅ **Flexible authentication** - Supports both hashed and Supabase Auth
✅ **Custom login IDs** - User-friendly login experience
✅ **Backward compatible** - Works with existing Supabase Auth users

## If You Need Help:

Let me know:
1. What hashing method you're using
2. An example of what your hashes look like (first few characters)
3. If the `verify_password` function works with your hashes

I can then customize the verification function for your specific setup!