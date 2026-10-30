ALTER TABLE ipls
    ADD COLUMN IF NOT EXISTS nominal DECIMAL(15,2) NOT NULL DEFAULT 0;

UPDATE ipls AS i
SET nominal = COALESCE(
    (SELECT f.kredit FROM finance AS f WHERE f.referensi_id = i.id AND f.referensi_tipe = 'ipl' LIMIT 1),
    (SELECT w.iuran FROM warga AS w WHERE w.id = i.warga_id),
    0
)
WHERE i.nominal = 0;

ALTER TABLE ipls
    DROP CONSTRAINT IF EXISTS chk_ipls_nominal;

ALTER TABLE ipls
    ADD CONSTRAINT chk_ipls_nominal CHECK (nominal >= 0);
