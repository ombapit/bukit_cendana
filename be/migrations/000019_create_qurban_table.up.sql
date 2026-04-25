CREATE TABLE IF NOT EXISTS pengambilan_qurban (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id   UUID NOT NULL UNIQUE REFERENCES warga(id) ON DELETE CASCADE,
    status     VARCHAR(50) NOT NULL DEFAULT 'Sudah Diambil',
    created_by VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
INSERT INTO permissions (id, name, code, module, description) VALUES
('0b000000-0000-0000-0000-000000000001', 'View Qurban', 'qurban.view', 'qurban', 'Can view pengambilan qurban'),
('0b000000-0000-0000-0000-000000000002', 'Create Qurban', 'qurban.create', 'qurban', 'Can create pengambilan qurban'),
('0b000000-0000-0000-0000-000000000003', 'Delete Qurban', 'qurban.delete', 'qurban', 'Can delete pengambilan qurban')
ON CONFLICT (code) DO NOTHING;

-- Grant to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000002', id
FROM permissions
WHERE code IN ('qurban.view', 'qurban.create', 'qurban.delete')
ON CONFLICT DO NOTHING;

-- Menu (parent: Transaksi)
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('36300000-0000-0000-0000-000000000001', 'Pengambilan Daging Qurban', '/transactions/qurban', 'beef', '36000000-0000-0000-0000-000000000001', 3, true, '0b000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
