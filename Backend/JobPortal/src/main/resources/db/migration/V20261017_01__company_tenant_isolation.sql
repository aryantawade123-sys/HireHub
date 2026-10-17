BEGIN;

CREATE TABLE IF NOT EXISTS company_tenants (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    owner_employer_id BIGINT UNIQUE
);

ALTER TABLE employer
    ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

ALTER TABLE job
    ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

ALTER TABLE application
    ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

ALTER TABLE company_tenants
    ADD COLUMN IF NOT EXISTS owner_employer_id BIGINT UNIQUE;

INSERT INTO company_tenants (company_name, owner_employer_id)
SELECT e.company_name, e.id
FROM employer e
WHERE e.tenant_id IS NULL
ON CONFLICT (owner_employer_id) DO NOTHING;

UPDATE employer e
SET tenant_id = t.id
FROM company_tenants t
WHERE t.owner_employer_id = e.id
  AND e.tenant_id IS NULL;

UPDATE job j
SET tenant_id = e.tenant_id
FROM employer e
WHERE e.id = j.employer_id
  AND j.tenant_id IS NULL;

UPDATE application a
SET tenant_id = j.tenant_id
FROM job j
WHERE j.id = a.job_id
  AND a.tenant_id IS NULL;

ALTER TABLE employer
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE job
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE application
    ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employer_company_tenant') THEN
        ALTER TABLE employer
            ADD CONSTRAINT fk_employer_company_tenant
            FOREIGN KEY (tenant_id) REFERENCES company_tenants(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_job_company_tenant') THEN
        ALTER TABLE job
            ADD CONSTRAINT fk_job_company_tenant
            FOREIGN KEY (tenant_id) REFERENCES company_tenants(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_application_company_tenant') THEN
        ALTER TABLE application
            ADD CONSTRAINT fk_application_company_tenant
            FOREIGN KEY (tenant_id) REFERENCES company_tenants(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenant_owner_employer') THEN
        ALTER TABLE company_tenants
            ADD CONSTRAINT fk_tenant_owner_employer
            FOREIGN KEY (owner_employer_id) REFERENCES employer(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employer_tenant_id ON employer(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_tenant_id ON job(tenant_id);
CREATE INDEX IF NOT EXISTS idx_application_tenant_id ON application(tenant_id);

COMMIT;
