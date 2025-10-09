-- Simple storage setup - Create public buckets first for testing

-- Delete existing buckets if they exist (optional)
-- DELETE FROM storage.buckets WHERE id IN ('id-documents', 'live-photos');

-- Create public buckets for easier testing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
('id-documents', 'id-documents', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
('live-photos', 'live-photos', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Simple policies for public buckets
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload live photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view live photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete live photos" ON storage.objects;

-- Create simple policies for public buckets
CREATE POLICY "Anyone can upload to id-documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'id-documents');

CREATE POLICY "Anyone can upload to live-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'live-photos');

CREATE POLICY "Anyone can view id-documents" ON storage.objects
FOR SELECT USING (bucket_id = 'id-documents');

CREATE POLICY "Anyone can view live-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'live-photos');

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('id-documents', 'live-photos');