# Supabase Setup Guide

This guide will help you set up Supabase for the Knowledge Lens application with authentication and employee data management.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `knowledge-lens` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose the closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key

## Step 3: Set Up Environment Variables

1. Create a `.env` file in your project root:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all necessary tables, indexes, and policies

## Step 5: Create the Admin User

1. In Supabase dashboard, go to Authentication > Users
2. Click "Add user"
3. Enter:
   - Email: `admin@kmrl.com`
   - Password: `admin123` (or your preferred password)
   - Email Confirm: Check this box
4. Click "Create user"
5. Copy the User ID (UUID) from the created user

## Step 6: Insert Admin Employee Record

1. Go back to the SQL Editor
2. Run this query (replace `USER_UUID_HERE` with the actual UUID from step 5):

```sql
INSERT INTO employees (id, employee_id, name, email, role, department, login_type, status) 
VALUES (
    'USER_UUID_HERE', 
    'ADM001', 
    'Admin User', 
    'admin@kmrl.com', 
    'Station Controller', 
    'Administration', 
    'admin', 
    'active'
);
```

## Step 7: Configure Storage

The schema already creates the necessary storage buckets (`id-documents` and `live-photos`). These are set to public for easy access, but you can modify the policies as needed.

## Step 8: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Go to the login page
3. Try logging in with:
   - Employee ID: `ADM001`
   - Password: `admin123` (or whatever you set)

## Step 9: Optional - Set Up Email Templates

1. In Supabase dashboard, go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Storage policies** restrict file access to admins only
3. **Environment variables** should never be committed to version control
4. **Production deployment** should use different credentials than development

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your `.env` file exists and has the correct variables
   - Restart your development server after adding environment variables

2. **"Employee ID not found"**
   - Ensure the admin user was created in both Auth and the employees table
   - Check that the UUIDs match between auth.users and employees tables

3. **"Failed to upload documents"**
   - Verify that storage buckets were created
   - Check storage policies in Supabase dashboard

4. **RLS Policy Issues**
   - Review the policies in Database > Policies
   - Ensure the admin user has the correct login_type in the employees table

## Next Steps

1. **Production Setup**: Create a separate Supabase project for production
2. **Email Configuration**: Set up SMTP for production email sending
3. **File Storage**: Consider using a CDN for better file delivery
4. **Monitoring**: Set up logging and monitoring in Supabase dashboard
5. **Backup**: Configure automated backups for your database

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for error messages
3. Check the Supabase dashboard logs
4. Ensure all environment variables are correctly set