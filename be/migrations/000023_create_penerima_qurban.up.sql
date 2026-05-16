CREATE TABLE IF NOT EXISTS penerima_qurban (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama          VARCHAR(255) NOT NULL,
    blok          VARCHAR(50) NOT NULL,
    no_telp       VARCHAR(20) DEFAULT '',
    kondisi_rumah VARCHAR(50) DEFAULT '',
    qr_code       VARCHAR(500) DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_penerima_qurban_blok ON penerima_qurban(blok);
