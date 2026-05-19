CREATE TABLE IF NOT EXISTS anggota_keluarga (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id      UUID NOT NULL REFERENCES warga(id) ON DELETE CASCADE,
    nama          VARCHAR(255) NOT NULL,
    status_hubungan VARCHAR(100) NOT NULL DEFAULT '',
    no_telp       VARCHAR(20) NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anggota_keluarga_warga_id ON anggota_keluarga(warga_id);
