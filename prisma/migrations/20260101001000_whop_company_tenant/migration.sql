-- Create Company table (B2B tenant)
CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "companyId" TEXT NOT NULL,
  "name" TEXT,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_companyId_key" ON "Company"("companyId");

-- Add companyId FK to FailedPayment
ALTER TABLE "FailedPayment" ADD COLUMN "companyId" TEXT;

-- Backfill existing rows into a legacy company so NOT NULL is safe
INSERT INTO "Company" ("id", "createdAt", "updatedAt", "companyId", "name")
VALUES ('__legacy__', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '__legacy__', 'Legacy')
ON CONFLICT ("companyId") DO NOTHING;

UPDATE "FailedPayment"
SET "companyId" = '__legacy__'
WHERE "companyId" IS NULL;

ALTER TABLE "FailedPayment" ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "FailedPayment"
  ADD CONSTRAINT "FailedPayment_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "FailedPayment_companyId_idx" ON "FailedPayment"("companyId");

