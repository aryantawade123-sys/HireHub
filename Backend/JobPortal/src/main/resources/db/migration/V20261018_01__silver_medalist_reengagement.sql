BEGIN;

ALTER TABLE application
    ADD COLUMN IF NOT EXISTS silver_medalist BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_application_silver_medalist_reengagement
    ON application (tenant_id, applied_at DESC)
    WHERE silver_medalist = TRUE AND status = 'REJECTED';

COMMIT;
