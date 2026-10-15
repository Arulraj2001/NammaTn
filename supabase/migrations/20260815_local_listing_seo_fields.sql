ALTER TABLE "local_listing" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "local_listing" ADD COLUMN IF NOT EXISTS "seo_title" TEXT;
ALTER TABLE "local_listing" ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
ALTER TABLE "local_listing" ADD COLUMN IF NOT EXISTS "seo_keywords" TEXT;
ALTER TABLE "local_listing" ADD COLUMN IF NOT EXISTS "canonical_url" TEXT;
ALTER TABLE "local_listing" ADD COLUMN IF NOT EXISTS "is_indexable" BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_local_listing_slug ON "local_listing"("slug");
CREATE INDEX IF NOT EXISTS idx_local_listing_is_indexable ON "local_listing"("is_indexable");
CREATE INDEX IF NOT EXISTS idx_local_listing_seo_title ON "local_listing"("seo_title");
