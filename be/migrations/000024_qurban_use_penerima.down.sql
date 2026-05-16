TRUNCATE TABLE pengambilan_qurban;
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_penerima_qurban_id_fkey;
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_penerima_qurban_id_key;
ALTER TABLE pengambilan_qurban RENAME COLUMN penerima_qurban_id TO warga_id;
ALTER TABLE pengambilan_qurban
    ADD CONSTRAINT pengambilan_qurban_warga_id_fkey
    FOREIGN KEY (warga_id) REFERENCES warga(id) ON DELETE CASCADE;
ALTER TABLE pengambilan_qurban ADD CONSTRAINT pengambilan_qurban_warga_id_key UNIQUE (warga_id);
