-- Warga permissions
INSERT INTO permissions (id, name, code, module, description) VALUES
('07000000-0000-0000-0000-000000000001', 'View Warga', 'warga.view', 'warga', 'Can view warga list and detail'),
('07000000-0000-0000-0000-000000000002', 'Create Warga', 'warga.create', 'warga', 'Can create new warga'),
('07000000-0000-0000-0000-000000000003', 'Update Warga', 'warga.update', 'warga', 'Can update existing warga'),
('07000000-0000-0000-0000-000000000004', 'Delete Warga', 'warga.delete', 'warga', 'Can delete warga')
ON CONFLICT (code) DO NOTHING;

-- IPL permissions
INSERT INTO permissions (id, name, code, module, description) VALUES
('08000000-0000-0000-0000-000000000001', 'View IPL', 'ipl.view', 'ipl', 'Can view IPL payment list'),
('08000000-0000-0000-0000-000000000002', 'Create IPL', 'ipl.create', 'ipl', 'Can create new IPL payment'),
('08000000-0000-0000-0000-000000000003', 'Update IPL', 'ipl.update', 'ipl', 'Can update IPL payment'),
('08000000-0000-0000-0000-000000000004', 'Delete IPL', 'ipl.delete', 'ipl', 'Can delete IPL payment')
ON CONFLICT (code) DO NOTHING;

-- Grant all new permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000002', id
FROM permissions
WHERE code IN ('warga.view','warga.create','warga.update','warga.delete','ipl.view','ipl.create','ipl.update','ipl.delete')
ON CONFLICT DO NOTHING;
