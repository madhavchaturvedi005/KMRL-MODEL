-- Fix company UUIDs to match mock data

-- Delete existing companies if any
DELETE FROM companies;

-- Insert companies with proper UUIDs that match the mock data
INSERT INTO companies (id, name, display_name, domain, admin_emails) VALUES
('00000000-0000-0000-0000-000000000001', 'KMRL', 'Kochi Metro Rail Limited', 'kmrl.com', ARRAY['admin@kmrl.com']),
('00000000-0000-0000-0000-000000000002', 'DMRC', 'Delhi Metro Rail Corporation', 'delhimetrorail.com', ARRAY['admin@delhimetrorail.com']),
('00000000-0000-0000-0000-000000000003', 'BMRCL', 'Bangalore Metro Rail Corporation Limited', 'bmrc.co.in', ARRAY['admin@bmrc.co.in']);

-- Verify the companies were inserted
SELECT id, name, display_name FROM companies ORDER BY name;