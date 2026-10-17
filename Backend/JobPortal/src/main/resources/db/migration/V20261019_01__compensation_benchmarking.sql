BEGIN;

ALTER TABLE job
    ADD COLUMN IF NOT EXISTS compensation_minimum NUMERIC(15, 3),
    ADD COLUMN IF NOT EXISTS compensation_maximum NUMERIC(15, 3),
    ADD COLUMN IF NOT EXISTS compensation_currency VARCHAR(3),
    ADD COLUMN IF NOT EXISTS compensation_period VARCHAR(16);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_job_compensation_range') THEN
        ALTER TABLE job
            ADD CONSTRAINT chk_job_compensation_range
            CHECK (
                (compensation_minimum IS NULL AND compensation_maximum IS NULL
                    AND compensation_currency IS NULL AND compensation_period IS NULL)
                OR
                (compensation_minimum IS NOT NULL AND compensation_maximum IS NOT NULL
                    AND compensation_currency IS NOT NULL AND compensation_period IS NOT NULL
                    AND compensation_currency ~ '^[A-Z]{3}$'
                    AND compensation_period IN ('ANNUAL', 'MONTHLY', 'HOURLY')
                    AND compensation_minimum >= 0 AND compensation_minimum <= compensation_maximum)
            );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_public_compensation_benchmark
    ON job (compensation_currency, compensation_period)
    WHERE active = TRUE AND compensation_minimum IS NOT NULL AND compensation_maximum IS NOT NULL;

COMMIT;
