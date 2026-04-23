CREATE TABLE IF NOT EXISTS warga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(255) NOT NULL,
    blok VARCHAR(50) NOT NULL,
    no_telp VARCHAR(20),
    iuran DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warga_nama ON warga(nama);
CREATE INDEX IF NOT EXISTS idx_warga_blok ON warga(blok);