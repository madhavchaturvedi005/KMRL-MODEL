-- Run this AFTER creating the employees table to update storage policies with proper admin checks

-- Drop temporary policies
DROP POLICY IF EXISTS "Authenticated users can view ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view live photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete live photos" ON storage.objects;

-- Create proper admin-only policies (updated for your schema)
CREATE POLICY "Admins can view ID documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'id-documents' AND 
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND login_type = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can view live photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'live-photos' AND 
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND login_type = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete ID documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'id-documents' AND 
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND login_type = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete live photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'live-photos' AND 
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND login_type = 'admin' 
    AND is_active = true
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';