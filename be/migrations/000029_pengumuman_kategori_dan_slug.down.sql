DROP INDEX IF EXISTS idx_pengumuman_slug;
ALTER TABLE pengumuman DROP COLUMN IF EXISTS slug;
DROP TABLE IF EXISTS pengumuman_kategori;
