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
('f0000000-0000-0000-0000-000000000002', 'Export Reports', 'report.export', 'report', 'Can export reports'),
-- Warga module
('07000000-0000-0000-0000-000000000001', 'View Warga', 'warga.view', 'warga', 'Can view warga list and detail'),
('07000000-0000-0000-0000-000000000002', 'Create Warga', 'warga.create', 'warga', 'Can create new warga'),
('07000000-0000-0000-0000-000000000003', 'Update Warga', 'warga.update', 'warga', 'Can update existing warga'),
('07000000-0000-0000-0000-000000000004', 'Delete Warga', 'warga.delete', 'warga', 'Can delete warga'),
-- IPL module
('08000000-0000-0000-0000-000000000001', 'View IPL', 'ipl.view', 'ipl', 'Can view IPL payment list'),
('08000000-0000-0000-0000-000000000002', 'Create IPL', 'ipl.create', 'ipl', 'Can create new IPL payment'),
('08000000-0000-0000-0000-000000000003', 'Update IPL', 'ipl.update', 'ipl', 'Can update IPL payment'),
('08000000-0000-0000-0000-000000000004', 'Delete IPL', 'ipl.delete', 'ipl', 'Can delete IPL payment'),
-- Finance module (pemasukan/pengeluaran)
('09000000-0000-0000-0000-000000000001', 'View Finance', 'finance.view', 'finance', 'Can view income/expense records'),
('09000000-0000-0000-0000-000000000002', 'Create Finance', 'finance.create', 'finance', 'Can create income/expense records'),
('09000000-0000-0000-0000-000000000003', 'Update Finance', 'finance.update', 'finance', 'Can update income/expense records'),
('09000000-0000-0000-0000-000000000004', 'Delete Finance', 'finance.delete', 'finance', 'Can delete income/expense records')
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
('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002'), -- report.export
('10000000-0000-0000-0000-000000000003', '07000000-0000-0000-0000-000000000001'), -- warga.view
('10000000-0000-0000-0000-000000000003', '08000000-0000-0000-0000-000000000001'), -- ipl.view
('10000000-0000-0000-0000-000000000003', '09000000-0000-0000-0000-000000000001')  -- finance.view
ON CONFLICT DO NOTHING;

-- Staff gets basic view
INSERT INTO role_permissions (role_id, permission_id) VALUES
('10000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001'), -- dashboard.view
('10000000-0000-0000-0000-000000000004', '07000000-0000-0000-0000-000000000001'), -- warga.view
('10000000-0000-0000-0000-000000000004', '08000000-0000-0000-0000-000000000001'), -- ipl.view
('10000000-0000-0000-0000-000000000004', '09000000-0000-0000-0000-000000000001')  -- finance.view
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED: Users (password: password123)
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
('35000000-0000-0000-0000-000000000001', 'Master Data', '/master-data', 'database', NULL, 2, true, '07000000-0000-0000-0000-000000000001'),
('36000000-0000-0000-0000-000000000001', 'Transaksi', '/transactions', 'receipt', NULL, 3, true, '08000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', 'User Management', '/users', 'people', NULL, 4, true, 'a0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000003', 'Access Control', '/access', 'shield', NULL, 5, true, 'b0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000004', 'Reports', '/reports', 'bar-chart', NULL, 6, true, 'f0000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000005', 'Settings', '/settings', 'settings', NULL, 7, true, 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Sub menus: Master Data
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('35100000-0000-0000-0000-000000000001', 'Data Warga', '/master-data/warga', 'users', '35000000-0000-0000-0000-000000000001', 1, true, '07000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Sub menus: Transaksi
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('36100000-0000-0000-0000-000000000001', 'IPL', '/transactions/ipls/list', 'file-text', '36000000-0000-0000-0000-000000000001', 1, true, '08000000-0000-0000-0000-000000000001'),
('36200000-0000-0000-0000-000000000001', 'Pemasukan/Pengeluaran', '/transactions/finance', 'trending-up', '36000000-0000-0000-0000-000000000001', 2, true, '09000000-0000-0000-0000-000000000001')
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
