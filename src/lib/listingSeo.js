import { toMetaDescription } from '@/lib/metaDescription';

const SITE_URL = 'https://www.vizhitn.in';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
    || 'local-service';
}

function compactCSV(values) {
  return [...new Set(values.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .slice(0, 12)
    .join(', ');
}

export function buildListingSeo(listing = {}) {
  const businessName = listing.business_name || 'Local Service';
  const districtText = listing.district_name || listing.district_slug || 'Tamil Nadu';
  const areaText = listing.area_name || listing.area_slug || '';
  const categoryText = listing.category || 'service';
  const locationText = areaText ? `${areaText}, ${districtText}` : districtText;
  const verificationBadge = listing.is_verified ? '✓ Verified' : '';

  const seoTitle = (listing.seo_title || '').trim() || `${businessName}${verificationBadge ? ` ${verificationBadge}` : ''} in ${locationText} | VizhiTN`;
  const descriptionSource = listing.description || listing.business_name || '';
  const seoDescription = (listing.seo_description || '').trim() || toMetaDescription(
    descriptionSource,
    `${businessName} - ${categoryText} service in ${locationText}. Read reviews, contact details, and ratings on VizhiTN.`,
    160,
  );

  const slug = (listing.slug || '').trim() || slugify(`${businessName} ${categoryText} ${areaText ? `in ${areaText}` : ''}`);
  const keywords = compactCSV([
    businessName,
    categoryText,
    districtText,
    areaText,
    `${categoryText} in ${districtText}`,
    `${areaText ? `${areaText} ${categoryText}` : `${districtText} ${categoryText}`}`,
    'local services',
    'verified businesses',
    'Tamil Nadu services',
    'VizhiTN listings',
  ]);

  const canonicalUrl = (listing.canonical_url || '').trim() || `${SITE_URL}/listing/${listing.id || slug}`;

  return {
    slug,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: keywords,
    canonical_url: canonicalUrl,
    is_indexable: listing.is_indexable !== false,
  };
}
