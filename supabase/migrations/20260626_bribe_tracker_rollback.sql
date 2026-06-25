-- Rollback: Remove Bribe Tracker Fields from post table
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_requested";
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_status";
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_amount";
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_department";
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_officer_designation";
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_specific_location";
ALTER TABLE "post" DROP COLUMN IF EXISTS "bribe_audio_url";
