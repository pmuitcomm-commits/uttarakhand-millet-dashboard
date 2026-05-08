-- Uttarakhand Millet MIS normalized farmer scheme schema.
-- Run through Alembic in production. This file is provided for DBA review and
-- mirrors the target structures created by revision 20260508_0001.

ALTER TABLE farmers ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS farmer_id BIGINT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS farmer_code TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS district_name TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS block_name TEXT;

UPDATE farmers SET id = farmer_id WHERE id IS NULL AND farmer_id IS NOT NULL;
CREATE SEQUENCE IF NOT EXISTS farmers_id_backfill_seq;
SELECT setval(
    'farmers_id_backfill_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM farmers), 0), 1),
    true
);
UPDATE farmers SET id = nextval('farmers_id_backfill_seq') WHERE id IS NULL;
UPDATE farmers SET farmer_id = id WHERE farmer_id IS NULL AND id IS NOT NULL;
UPDATE farmers SET farmer_code = 'FARMER-' || id WHERE farmer_code IS NULL AND id IS NOT NULL;
UPDATE farmers SET district = district_name WHERE district IS NULL AND district_name IS NOT NULL;
UPDATE farmers SET block = block_name WHERE block IS NULL AND block_name IS NOT NULL;
UPDATE farmers SET district_name = district WHERE district_name IS NULL AND district IS NOT NULL;
UPDATE farmers SET block_name = block WHERE block_name IS NULL AND block IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_farmers_id ON farmers(id);
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_farmers_id'
    ) THEN
        ALTER TABLE farmers ADD CONSTRAINT uq_farmers_id UNIQUE (id);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS ux_farmers_farmer_code ON farmers(farmer_code);
CREATE INDEX IF NOT EXISTS ix_farmers_district ON farmers(district);
CREATE INDEX IF NOT EXISTS ix_farmers_block ON farmers(block);

CREATE TABLE IF NOT EXISTS farmer_scheme_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    scheme_type TEXT NOT NULL CHECK (
        scheme_type IN (
            'cultivation_input',
            'shg_intake',
            'transportation',
            'bukhari_storage',
            'sowing_incentive',
            'block_award'
        )
    ),
    millet_type TEXT NULL,
    quantity NUMERIC NULL,
    area_ha NUMERIC NULL,
    no_of_items INTEGER NULL,
    production NUMERIC NULL,
    type_of_sowing TEXT NULL,
    incentive NUMERIC NULL,
    award NUMERIC NULL,
    transaction_date DATE NULL,
    remarks TEXT NULL,
    source_table TEXT NULL,
    source_record_key TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_farmer_scheme_transactions_farmer_id
    ON farmer_scheme_transactions(farmer_id);
CREATE INDEX IF NOT EXISTS ix_farmer_scheme_transactions_scheme_type
    ON farmer_scheme_transactions(scheme_type);
CREATE INDEX IF NOT EXISTS ix_farmer_scheme_transactions_transaction_date
    ON farmer_scheme_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS ix_farmer_scheme_transactions_scheme_date
    ON farmer_scheme_transactions(scheme_type, transaction_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_farmer_scheme_transactions_source
    ON farmer_scheme_transactions(source_table, source_record_key);

CREATE TABLE IF NOT EXISTS millet_production (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    district_id BIGINT NULL,
    block_id BIGINT NULL,
    millet_id BIGINT NULL,
    season_id BIGINT NULL,
    year INTEGER NULL,
    area_hectare NUMERIC NULL,
    production_ton NUMERIC NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_millet_production_district_year
    ON millet_production(district_id, year);

CREATE TABLE IF NOT EXISTS storage_processing (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    district TEXT NULL,
    block TEXT NULL,
    facility_name TEXT NOT NULL,
    facility_type TEXT NULL,
    capacity_mt NUMERIC NULL,
    operational_status TEXT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_storage_processing_district ON storage_processing(district);
CREATE INDEX IF NOT EXISTS ix_storage_processing_block ON storage_processing(block);
CREATE INDEX IF NOT EXISTS ix_storage_processing_facility_type ON storage_processing(facility_type);

-- Legacy table data migration is implemented in Alembic revision
-- 20260508_0001_normalize_farmer_scheme_transactions.py because it introspects
-- live column names before generating safe INSERT...SELECT statements for:
-- millet_cultivation_inputs, millet_intake_shg_incentives,
-- millet_transportation_expenditure, bukhari_storage, sowing_incentives,
-- and block_level_awards.
