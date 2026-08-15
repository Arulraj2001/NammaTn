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
    || 'stay-listing';
}

function compactCSV(values) {
  return [...new Set(values.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .slice(0, 12)
    .join(', ');
}

export function buildStaySeo(listing = {}) {
  const titleText = listing.title || 'Stay Listing';
  const districtText = listing.district_name || listing.district_slug || 'Tamil Nadu';
  const areaText = listing.area_name || listing.area_slug || '';
  const typeText = listing.listing_type === 'pg_available' ? 'PG' 
    : listing.listing_type === 'shared_room' ? 'Shared Room'
    : listing.listing_type === 'roommate_needed' ? 'Roommate'
    : listing.listing_type === 'temporary_stay' ? 'Temporary Stay'
    : listing.listing_type === 'hostel' ? 'Hostel'
    : 'Stay';
  const locationText = areaText ? `${areaText}, ${districtText}` : districtText;
  const rentText = listing.rent_amount ? `₹${listing.rent_amount}` : '';

  const seoTitle = (listing.seo_title || '').trim() || `${titleText} in ${locationText}${rentText ? ` - ${rentText}` : ''} | VizhiTN`;
  const descriptionSource = listing.description || listing.title || '';
  const seoDescription = (listing.seo_description || '').trim() || toMetaDescription(
    descriptionSource,
    `${typeText} available in ${locationText}. View amenities, contact details, and book now on VizhiTN.`,
    160,
  );

  const slug = (listing.slug || '').trim() || slugify(`${typeText} ${titleText} ${areaText ? `in ${areaText}` : ''}`);
  const keywords = compactCSV([
    titleText,
    typeText,
    districtText,
    areaText,
    `${districtText} ${typeText.toLowerCase()}`,
    `${areaText ? `${areaText} stay` : `${districtText} stay`}`,
    'Tamil Nadu accommodation',
    'VizhiTN stay',
    'room rental',
    'PG accommodation',
  ]);

  const canonicalUrl = (listing.canonical_url || '').trim() || `${SITE_URL}/stay/${listing.id || slug}`;

  return {
    slug,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: keywords,
    canonical_url: canonicalUrl,
    is_indexable: listing.is_indexable !== false,
  };
}
