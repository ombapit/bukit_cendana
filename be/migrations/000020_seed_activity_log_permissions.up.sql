-- Activity log permission
INSERT INTO permissions (id, name, code, module, description) VALUES
('0a000000-0000-0000-0000-000000000001', 'View Activity Logs', 'activity_log.view', 'activity_log', 'Can view public page activity logs')
ON CONFLICT DO NOTHING;

-- Grant to superadmin and admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, '0a000000-0000-0000-0000-000000000001'
FROM roles r
WHERE r.name IN ('superadmin', 'admin')
ON CONFLICT DO NOTHING;

-- Menu entry: Activity Logs (under Reports parent if exists, else as root)
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('3a000000-0000-0000-0000-000000000001', 'Activity Logs', '/activity-logs', 'activity', NULL, 8, true, '0a000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
