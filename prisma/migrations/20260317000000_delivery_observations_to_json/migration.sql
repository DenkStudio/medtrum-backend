-- Convert delivery observations from String to Json
-- First, convert existing string values to JSON array format
UPDATE "deliveries"
SET "observations" = CASE
  WHEN "observations" IS NULL THEN '[]'::jsonb
  WHEN "observations" = '' THEN '[]'::jsonb
  ELSE jsonb_build_array(
    jsonb_build_object(
      'text', "observations",
      'date', to_char("created_at", 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'authorId', COALESCE("assigned_by", ''),
      'authorName', 'Sistema',
      'type', 'system'
    )
  )
END;

-- AlterTable: change column type from text to jsonb
ALTER TABLE "deliveries" ALTER COLUMN "observations" SET DATA TYPE JSONB USING "observations"::jsonb;
ALTER TABLE "deliveries" ALTER COLUMN "observations" SET DEFAULT '[]'::jsonb;
