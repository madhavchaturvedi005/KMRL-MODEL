-- Insert companies data for the request access feature
INSERT INTO companies (id, name, display_name, domain, admin_emails) VALUES
('1', 'KMRL', 'Kochi Metro Rail Limited', 'kmrl.com', ARRAY['admin@kmrl.com']),
('2', 'DMRC', 'Delhi Metro Rail Corporation', 'delhimetrorail.com', ARRAY['admin@delhimetrorail.com']),
('3', 'BMRCL', 'Bangalore Metro Rail Corporation Limited', 'bmrc.co.in', ARRAY['admin@bmrc.co.in'])
ON CONFLICT (id) DO NOTHING;