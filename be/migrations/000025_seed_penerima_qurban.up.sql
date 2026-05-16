-- Add missing qurban.update permission
INSERT INTO permissions (id, name, code, module, description) VALUES
('0b000000-0000-0000-0000-000000000004', 'Update Penerima Qurban', 'qurban.update', 'qurban', 'Can update penerima qurban data')
ON CONFLICT (code) DO NOTHING;

-- Grant qurban.update to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000002', id
FROM permissions WHERE code = 'qurban.update'
ON CONFLICT DO NOTHING;

-- Menu: Penerima Qurban under Master Data
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('35200000-0000-0000-0000-000000000001', 'Penerima Qurban', '/master-data/penerima-qurban', 'users', '35000000-0000-0000-0000-000000000001', 2, true, '0b000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
