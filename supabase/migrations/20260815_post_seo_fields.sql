ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "seo_title" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "seo_keywords" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "canonical_url" TEXT;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "is_indexable" BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_post_slug ON "post"("slug");
CREATE INDEX IF NOT EXISTS idx_post_is_indexable ON "post"("is_indexable");
CREATE INDEX IF NOT EXISTS idx_post_seo_title ON "post"("seo_title");
