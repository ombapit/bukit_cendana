DROP TABLE IF EXISTS ipls CASCADE;
DROP TABLE IF EXISTS transaksi CASCADE;

CREATE TABLE ipls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES warga(id),
    tanggal_ipl VARCHAR(6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ipls_warga_id ON ipls(warga_id);
CREATE INDEX IF NOT EXISTS idx_ipls_tanggal_ipl ON ipls(tanggal_ipl);
