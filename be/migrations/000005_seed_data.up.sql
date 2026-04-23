-- =============================================
-- SEED: Permissions
-- =============================================
INSERT INTO permissions (id, name, code, module, description) VALUES
-- User module
('a0000000-0000-0000-0000-000000000001', 'View Users', 'user.view', 'user', 'Can view user list and detail'),
('a0000000-0000-0000-0000-000000000002', 'Create User', 'user.create', 'user', 'Can create new users'),
('a0000000-0000-0000-0000-000000000003', 'Update User', 'user.update', 'user', 'Can update existing users'),
('a0000000-0000-0000-0000-000000000004', 'Delete User', 'user.delete', 'user', 'Can delete users'),
-- Role module
('b0000000-0000-0000-0000-000000000001', 'View Roles', 'role.view', 'role', 'Can view role list and detail'),
('b0000000-0000-0000-0000-000000000002', 'Create Role', 'role.create', 'role', 'Can create new roles'),
('b0000000-0000-0000-0000-000000000003', 'Update Role', 'role.update', 'role', 'Can update existing roles'),
('b0000000-0000-0000-0000-000000000004', 'Delete Role', 'role.delete', 'role', 'Can delete roles'),
-- Permission module
('c0000000-0000-0000-0000-000000000001', 'View Permissions', 'permission.view', 'permission', 'Can view permission list'),
('c0000000-0000-0000-0000-000000000002', 'Create Permission', 'permission.create', 'permission', 'Can create new permissions'),
('c0000000-0000-0000-0000-000000000003', 'Update Permission', 'permission.update', 'permission', 'Can update existing permissions'),
('c0000000-0000-0000-0000-000000000004', 'Delete Permission', 'permission.delete', 'permission', 'Can delete permissions'),
-- Menu module
('d0000000-0000-0000-0000-000000000001', 'View Menus', 'menu.view', 'menu', 'Can view menu list'),
('d0000000-0000-0000-0000-000000000002', 'Create Menu', 'menu.create', 'menu', 'Can create new menus'),
('d0000000-0000-0000-0000-000000000003', 'Update Menu', 'menu.update', 'menu', 'Can update existing menus'),
('d0000000-0000-0000-0000-000000000004', 'Delete Menu', 'menu.delete', 'menu', 'Can delete menus'),
-- Dashboard module
('e0000000-0000-0000-0000-000000000001', 'View Dashboard', 'dashboard.view', 'dashboard', 'Can view dashboard'),
-- Report module
('f0000000-0000-0000-0000-000000000001', 'View Reports', 'report.view', 'report', 'Can view reports'),
('f0000000-0000-0000-0000-000000000002', 'Export Reports', 'report.export', 'report', 'Can export reports')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED: Roles
-- =============================================
INSERT INTO roles (id, name, description, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'superadmin', 'Super Administrator with full access', true),
('10000000-0000-0000-0000-000000000002', 'admin', 'Administrator with management access', true),
('10000000-0000-0000-0000-000000000003', 'manager', 'Manager with limited management access', true),
('10000000-0000-0000-0000-000000000004', 'staff', 'Regular staff with basic access', true)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEED: Role Permissions
-- =============================================
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000002', id FROM permissions
ON CONFLICT DO NOTHING;

-- Manager gets view + some management
INSERT INTO role_permissions (role_id, permission_id) VALUES
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'), -- user.view
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002'), -- user.create
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003'), -- user.update
('10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001'), -- role.view
('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001'), -- dashboard.view
('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001'), -- report.view
('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002')  -- report.export
ON CONFLICT DO NOTHING;

-- Staff gets basic view
INSERT INTO role_permissions (role_id, permission_id) VALUES
('10000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001'), -- dashboard.view
('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001')  -- report.view
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED: Users (password: password123)
-- Salt: 6fb71394abaa225566ebebf7ee3d23f0
-- Hash dari: salt + "password123"
-- =============================================
INSERT INTO users (id, username, email, password, salt, full_name, is_active, role_id) VALUES
('20000000-0000-0000-0000-000000000001', 'superadmin', 'superadmin@example.com', '$2a$10$9OuU2sm/7ZM7L88dmxf54uNcAGHVAyvQrTsZHTELSWH14gSkBZ3sy', '6fb71394abaa225566ebebf7ee3d23f0', 'Super Administrator', true, '10000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002', 'admin', 'admin@example.com', '$2a$10$9OuU2sm/7ZM7L88dmxf54uNcAGHVAyvQrTsZHTELSWH14gSkBZ3sy', '6fb71394abaa225566ebebf7ee3d23f0', 'Administrator', true, '10000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000003', 'manager', 'manager@example.com', '$2a$10$9OuU2sm/7ZM7L88dmxf54uNcAGHVAyvQrTsZHTELSWH14gSkBZ3sy', '6fb71394abaa225566ebebf7ee3d23f0', 'Manager User', true, '10000000-0000-0000-0000-000000000003'),
('20000000-0000-0000-0000-000000000004', 'staff', 'staff@example.com', '$2a$10$9OuU2sm/7ZM7L88dmxf54uNcAGHVAyvQrTsZHTELSWH14gSkBZ3sy', '6fb71394abaa225566ebebf7ee3d23f0', 'Staff User', true, '10000000-0000-0000-0000-000000000004')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- SEED: Menus (hierarchical with RBAC)
-- =============================================
-- Root menus
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('30000000-0000-0000-0000-000000000001', 'Dashboard', '/dashboard', 'dashboard', NULL, 1, true, 'e0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', 'User Management', '/users', 'people', NULL, 2, true, 'a0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000003', 'Access Control', '/access', 'shield', NULL, 3, true, 'b0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000004', 'Reports', '/reports', 'bar-chart', NULL, 4, true, 'f0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000005', 'Settings', '/settings', 'settings', NULL, 5, true, 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Sub menus: User Management
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('31000000-0000-0000-0000-000000000001', 'User List', '/users/list', 'list', '30000000-0000-0000-0000-000000000002', 1, true, 'a0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000002', 'Create User', '/users/create', 'user-plus', '30000000-0000-0000-0000-000000000002', 2, true, 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Sub menus: Access Control
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('32000000-0000-0000-0000-000000000001', 'Roles', '/access/roles', 'key', '30000000-0000-0000-0000-000000000003', 1, true, 'b0000000-0000-0000-0000-000000000001'),
('32000000-0000-0000-0000-000000000002', 'Permissions', '/access/permissions', 'lock', '30000000-0000-0000-0000-000000000003', 2, true, 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Sub menus: Reports
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('33000000-0000-0000-0000-000000000001', 'View Reports', '/reports/view', 'eye', '30000000-0000-0000-0000-000000000004', 1, true, 'f0000000-0000-0000-0000-000000000001'),
('33000000-0000-0000-0000-000000000002', 'Export Reports', '/reports/export', 'download', '30000000-0000-0000-0000-000000000004', 2, true, 'f0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Sub menus: Settings
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('34000000-0000-0000-0000-000000000001', 'Menu Management', '/settings/menus', 'menu', '30000000-0000-0000-0000-000000000005', 1, true, 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
