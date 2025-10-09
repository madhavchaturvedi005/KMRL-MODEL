-- Create a function to verify hashed passwords
-- This assumes you're using bcrypt or similar hashing

-- First, enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the password verification function
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- If using bcrypt (most common)
  -- This checks if the input password matches the stored hash
  RETURN crypt(input_password, stored_hash) = stored_hash;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, return false for security
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative function if you're using a different hashing method
-- Uncomment and modify this if bcrypt doesn't work for your hashes
/*
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- For SHA256 or other methods, you might need different logic
  -- Example for SHA256:
  -- RETURN encode(digest(input_password, 'sha256'), 'hex') = stored_hash;
  
  -- For now, return false - you'll need to implement your specific hash verification
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Test the function (replace with actual hash from your database)
-- SELECT verify_password('test123', '$2b$10$..your_actual_hash_here..');

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO anon;