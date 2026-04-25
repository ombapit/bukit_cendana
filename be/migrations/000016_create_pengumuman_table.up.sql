CREATE TABLE IF NOT EXISTS pengumuman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    konten TEXT DEFAULT '',
    gambar VARCHAR(500) DEFAULT '',
    kategori VARCHAR(100) DEFAULT '',
    tags VARCHAR(500) DEFAULT '',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
INSERT INTO permissions (id, name, code, module, description) VALUES
('0a000000-0000-0000-0000-000000000001', 'View Pengumuman', 'pengumuman.view', 'pengumuman', 'Can view pengumuman'),
('0a000000-0000-0000-0000-000000000002', 'Create Pengumuman', 'pengumuman.create', 'pengumuman', 'Can create pengumuman'),
('0a000000-0000-0000-0000-000000000003', 'Update Pengumuman', 'pengumuman.update', 'pengumuman', 'Can update pengumuman'),
('0a000000-0000-0000-0000-000000000004', 'Delete Pengumuman', 'pengumuman.delete', 'pengumuman', 'Can delete pengumuman')
ON CONFLICT (code) DO NOTHING;

-- Grant to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000002', id
FROM permissions
WHERE code IN ('pengumuman.view','pengumuman.create','pengumuman.update','pengumuman.delete')
ON CONFLICT DO NOTHING;

-- Menu: root item
INSERT INTO menus (id, name, path, icon, parent_id, sort_order, is_active, permission_id) VALUES
('37000000-0000-0000-0000-000000000001', 'Pengumuman', '/pengumuman', 'bell', NULL, 8, true, '0a000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
