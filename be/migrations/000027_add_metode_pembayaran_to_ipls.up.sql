ALTER TABLE ipls
    ADD COLUMN IF NOT EXISTS metode_pembayaran VARCHAR(20) NOT NULL DEFAULT 'lainnya';

ALTER TABLE ipls
    DROP CONSTRAINT IF EXISTS chk_ipls_metode_pembayaran;

ALTER TABLE ipls
    ADD CONSTRAINT chk_ipls_metode_pembayaran
    CHECK (metode_pembayaran IN ('cash', 'transfer', 'qris', 'lainnya'));
