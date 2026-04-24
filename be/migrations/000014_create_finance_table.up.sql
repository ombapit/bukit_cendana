CREATE TABLE IF NOT EXISTS finance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_transaksi  VARCHAR(255)    NOT NULL,
    deskripsi       TEXT            NOT NULL DEFAULT '',
    kategori        VARCHAR(100)    NOT NULL DEFAULT '',
    debit           DECIMAL(15,2)   NOT NULL DEFAULT 0,
    kredit          DECIMAL(15,2)   NOT NULL DEFAULT 0,
    referensi_id    UUID,
    referensi_tipe  VARCHAR(50)     NOT NULL DEFAULT '',
    tanggal         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_tanggal    ON finance(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_finance_referensi  ON finance(referensi_id, referensi_tipe);
CREATE INDEX IF NOT EXISTS idx_finance_kategori   ON finance(kategori);
