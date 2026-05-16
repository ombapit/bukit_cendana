-- Clear existing records (FK reference changes to new table)
TRUNCATE TABLE pengambilan_qurban;

-- Drop old FK + unique constraints on warga_id
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_warga_id_fkey;
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_warga_id_key;

-- Rename column (idempotent: only if warga_id still exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pengambilan_qurban' AND column_name = 'warga_id'
  ) THEN
    ALTER TABLE pengambilan_qurban RENAME COLUMN warga_id TO penerima_qurban_id;
  END IF;
END $$;

-- Ensure penerima_qurban has primary key (in case table was auto-migrated without explicit PK)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'penerima_qurban'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE penerima_qurban ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Drop new constraints if they exist (idempotent retry safety)
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_penerima_qurban_id_fkey;
ALTER TABLE pengambilan_qurban DROP CONSTRAINT IF EXISTS pengambilan_qurban_penerima_qurban_id_key;

-- Add new FK + unique
ALTER TABLE pengambilan_qurban
    ADD CONSTRAINT pengambilan_qurban_penerima_qurban_id_fkey
    FOREIGN KEY (penerima_qurban_id) REFERENCES penerima_qurban(id) ON DELETE CASCADE;

ALTER TABLE pengambilan_qurban
    ADD CONSTRAINT pengambilan_qurban_penerima_qurban_id_key
    UNIQUE (penerima_qurban_id);
