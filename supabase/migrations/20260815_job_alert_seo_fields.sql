ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "seo_title" TEXT;
ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "seo_keywords" TEXT;
ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "canonical_url" TEXT;
ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "is_indexable" BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_job_alert_slug ON "job_alert"("slug");
CREATE INDEX IF NOT EXISTS idx_job_alert_is_indexable ON "job_alert"("is_indexable");
CREATE INDEX IF NOT EXISTS idx_job_alert_seo_title ON "job_alert"("seo_title");
