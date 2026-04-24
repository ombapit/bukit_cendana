DROP TABLE IF EXISTS transaksi CASCADE;

CREATE TABLE transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES warga(id),
    tanggal_ipl VARCHAR(6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaksi_warga_id ON transaksi(warga_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal_ipl ON transaksi(tanggal_ipl);