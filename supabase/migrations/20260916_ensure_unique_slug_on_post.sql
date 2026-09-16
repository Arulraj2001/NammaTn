-- Migration: 20260916_ensure_unique_slug_on_post.sql
-- Enforces slug uniqueness on the "post" table to support idempotent upserts and automated cron imports without duplicate articles.

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_slug_unique ON "post"("slug") WHERE "slug" IS NOT NULL;
