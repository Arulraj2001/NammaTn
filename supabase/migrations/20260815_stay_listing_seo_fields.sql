ALTER TABLE "stay_listing" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "stay_listing" ADD COLUMN IF NOT EXISTS "seo_title" TEXT;
ALTER TABLE "stay_listing" ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
ALTER TABLE "stay_listing" ADD COLUMN IF NOT EXISTS "seo_keywords" TEXT;
ALTER TABLE "stay_listing" ADD COLUMN IF NOT EXISTS "canonical_url" TEXT;
ALTER TABLE "stay_listing" ADD COLUMN IF NOT EXISTS "is_indexable" BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_stay_listing_slug ON "stay_listing"("slug");
CREATE INDEX IF NOT EXISTS idx_stay_listing_is_indexable ON "stay_listing"("is_indexable");
CREATE INDEX IF NOT EXISTS idx_stay_listing_seo_title ON "stay_listing"("seo_title");
