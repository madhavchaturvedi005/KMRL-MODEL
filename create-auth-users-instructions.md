# Creating Supabase Auth Users

After running the `setup-auth-users.sql` script, you need to create corresponding Supabase Auth users in your Supabase dashboard.

## Steps:

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication > Users**
3. **Click "Add User" and create these users:**

### Admin User
- **Email:** `admin@company.com`
- **Password:** `admin123`
- **Email Confirm:** ✅ (checked)

### Test Employee
- **Email:** `test@company.com`
- **Password:** `password123`
- **Email Confirm:** ✅ (checked)

### Your User
- **Email:** `meetbhavsar34@gmail.com`
- **Password:** `[your-desired-password]`
- **Email Confirm:** ✅ (checked)

## How Login Works Now:

1. **User enters login_id** (e.g., `admin`, `test123`, or `meetbhavsar34@gmail.com`)
2. **System finds employee record** by `login_id`
3. **System gets the employee's email** from the record
4. **System uses Supabase Auth** to authenticate with `email + password`
5. **If successful**, user is logged in with Supabase session

## Test Login Credentials:

After creating the Auth users, you can login with:

- **Employee ID:** `admin` → **Password:** `admin123`
- **Employee ID:** `test123` → **Password:** `password123`
- **Employee ID:** `meetbhavsar34@gmail.com` → **Password:** `[your-password]`

## Benefits:

✅ **Uses Supabase Auth** for secure password handling and sessions
✅ **Custom login_id field** for user-friendly login (not just email)
✅ **Proper session management** with Supabase built-in features
✅ **Password security** handled by Supabase (hashing, etc.)