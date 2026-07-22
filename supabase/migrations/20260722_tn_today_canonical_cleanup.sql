-- TN Today canonicals are always derived from the published VizhiTN slug.
-- Clear legacy overrides that pointed at alternate hosts or obsolete slugs.
UPDATE public.tn_today
SET canonical_url = NULL
WHERE canonical_url IS NOT NULL;

COMMENT ON COLUMN public.tn_today.canonical_url IS
  'Deprecated: public canonical URLs are derived from the current VizhiTN article slug.';
