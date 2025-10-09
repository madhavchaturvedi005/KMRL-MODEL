-- Check if registration_applications table exists and its structure

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'registration_applications'
);

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'registration_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'registration_applications' 
AND table_schema = 'public';