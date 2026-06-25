-- Migration: Add Bribe Tracker Fields to post table
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_requested" BOOLEAN DEFAULT false;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_status" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_amount" NUMERIC DEFAULT 0;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_department" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_officer_designation" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_specific_location" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "bribe_audio_url" TEXT;
