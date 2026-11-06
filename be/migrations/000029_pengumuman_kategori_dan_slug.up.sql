CREATE TABLE IF NOT EXISTS pengumuman_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pengumuman_kategori (nama) VALUES
    ('Umum'), ('Keamanan'), ('Kebersihan'), ('Kegiatan'), ('Penting'), ('Keuangan')
ON CONFLICT (nama) DO NOTHING;

ALTER TABLE pengumuman ADD COLUMN IF NOT EXISTS slug VARCHAR(300) NOT NULL DEFAULT '';

UPDATE pengumuman
SET slug = trim(both '-' FROM regexp_replace(lower(judul), '[^a-z0-9]+', '-', 'g')) || '-' || substring(id::text, 1, 8)
WHERE slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_pengumuman_slug ON pengumuman(slug);
