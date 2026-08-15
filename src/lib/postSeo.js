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
    || 'civic-report';
}

function compactCSV(values) {
  return [...new Set(values.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .slice(0, 12)
    .join(', ');
}

export function buildPostSeo(post = {}) {
  const titleText = post.title_en || post.title || 'Civic Report';
  const districtText = post.district_name || post.district_slug || 'Tamil Nadu';
  const areaText = post.area_name || post.area_slug || '';
  const categoryText = post.category_name || post.category_slug || 'civic issue';
  const postTypeText = post.post_type || 'civic report';
  const issueLocation = areaText ? `${areaText}, ${districtText}` : districtText;

  const seoTitle = (post.seo_title || '').trim() || `${titleText} in ${issueLocation} | VizhiTN`;
  const descriptionSource = post.content_en || post.description || post.title_en || post.title || '';
  const seoDescription = (post.seo_description || '').trim() || toMetaDescription(
    descriptionSource,
    `${titleText} was reported in ${issueLocation}. Track updates, public response, and civic status on VizhiTN.`,
    160,
  );

  const slug = (post.slug || '').trim() || slugify(`${titleText} ${areaText ? `in ${areaText}` : ''} ${districtText}`);
  const keywords = compactCSV([
    titleText,
    districtText,
    areaText,
    categoryText,
    postTypeText,
    `${districtText} civic issue`,
    `${districtText} ${categoryText}`,
    'Tamil Nadu civic report',
    'VizhiTN',
    'public complaint',
  ]);

  const canonicalUrl = (post.canonical_url || '').trim() || `${SITE_URL}/post/${post.id || slug}`;

  return {
    slug,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: keywords,
    canonical_url: canonicalUrl,
    is_indexable: post.is_indexable !== false,
  };
}
