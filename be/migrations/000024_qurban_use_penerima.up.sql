-- Clear existing records (FK reference changes to new table)
TRUNCATE TABLE pengambilan_qurban;

-- Drop old FK + unique constraints on warga_id
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_warga_id_fkey;
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_warga_id_key;

-- Rename column
ALTER TABLE pengambilan_qurban RENAME COLUMN warga_id TO penerima_qurban_id;

-- Add new FK + unique
ALTER TABLE pengambilan_qurban
    ADD CONSTRAINT pengambilan_qurban_penerima_qurban_id_fkey
    FOREIGN KEY (penerima_qurban_id) REFERENCES penerima_qurban(id) ON DELETE CASCADE;

ALTER TABLE pengambilan_qurban
    ADD CONSTRAINT pengambilan_qurban_penerima_qurban_id_key
    UNIQUE (penerima_qurban_id);
