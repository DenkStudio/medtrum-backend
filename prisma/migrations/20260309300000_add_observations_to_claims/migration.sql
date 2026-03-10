-- First reset any non-JSON text values to empty array
UPDATE "claims" SET "observations" = '[]' WHERE "observations" IS NOT NULL AND "observations" NOT LIKE '[%' AND "observations" NOT LIKE '{%';

-- Convert the column from TEXT to JSONB
ALTER TABLE "claims" ALTER COLUMN "observations" TYPE JSONB USING "observations"::jsonb;

-- Set default
ALTER TABLE "claims" ALTER COLUMN "observations" SET DEFAULT '[]';
