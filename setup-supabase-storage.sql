-- Step 1: Create Storage Buckets
-- Run this in Supabase SQL Editor

-- Create bucket for ID documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-documents', 
  'id-documents', 
  false,  -- Private bucket (only admins can access)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create bucket for live photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'live-photos', 
  'live-photos', 
  false,  -- Private bucket (only admins can access)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Step 2: Create Storage Policies

-- Policy: Anyone can upload ID documents (for registration)
CREATE POLICY "Anyone can upload ID documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'id-documents'
);

-- Policy: Anyone can upload live photos (for registration)
CREATE POLICY "Anyone can upload live photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'live-photos'
);

-- Note: Admin policies will be created after employees table exists
-- For now, we'll create basic policies and update them later

-- Policy: Admins can view ID documents (temporary - allows all authenticated users)
CREATE POLICY "Authenticated users can view ID documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'id-documents' AND auth.uid() IS NOT NULL
);

-- Policy: Admins can view live photos (temporary - allows all authenticated users)
CREATE POLICY "Authenticated users can view live photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'live-photos' AND auth.uid() IS NOT NULL
);

-- Policy: Admins can delete files (temporary - allows all authenticated users)
CREATE POLICY "Authenticated users can delete ID documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'id-documents' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete live photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'live-photos' AND auth.uid() IS NOT NULL
);

-- Verify buckets were created
SELECT * FROM storage.buckets WHERE id IN ('id-documents', 'live-photos');