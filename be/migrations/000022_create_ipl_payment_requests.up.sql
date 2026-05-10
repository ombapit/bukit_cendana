CREATE TABLE IF NOT EXISTS ipl_payment_requests (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id         UUID NOT NULL REFERENCES warga(id),
    tanggal_ipl_start VARCHAR(6) NOT NULL,
    tanggal_ipl_end   VARCHAR(6) NOT NULL,
    jumlah_bulan     INTEGER NOT NULL DEFAULT 1,
    total_amount     BIGINT NOT NULL,
    reference_id     VARCHAR(100) UNIQUE NOT NULL,
    ipaymu_trx_id    VARCHAR(100),
    payment_url      TEXT,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ipl_payment_warga_id    ON ipl_payment_requests(warga_id);
CREATE INDEX IF NOT EXISTS idx_ipl_payment_reference_id ON ipl_payment_requests(reference_id);
CREATE INDEX IF NOT EXISTS idx_ipl_payment_status       ON ipl_payment_requests(status);
