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
    || 'job-alert';
}

function compactCSV(values) {
  return [...new Set(values.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .slice(0, 12)
    .join(', ');
}

export function buildJobSeo(job = {}) {
  const titleText = job.title || 'Job Alert';
  const districtText = job.district_name || job.district_slug || 'Tamil Nadu';
  const areaText = job.area_name || job.area_slug || '';
  const jobTypeText = job.job_type || 'job opportunity';
  const locationText = areaText ? `${areaText}, ${districtText}` : districtText;

  const seoTitle = (job.seo_title || '').trim() || `${titleText} in ${locationText} | VizhiTN`;
  const descriptionSource = job.description || job.title || '';
  const seoDescription = (job.seo_description || '').trim() || toMetaDescription(
    descriptionSource,
    `${titleText} opportunity posted in ${locationText}. Check details, salary info, and apply on VizhiTN job board.`,
    160,
  );

  const slug = (job.slug || '').trim() || slugify(`${titleText} ${areaText ? `in ${areaText}` : ''} ${districtText}`);
  const keywords = compactCSV([
    titleText,
    districtText,
    areaText,
    jobTypeText,
    `${districtText} jobs`,
    `${districtText} ${jobTypeText}`,
    'Tamil Nadu job alert',
    'VizhiTN jobs',
    'local hiring',
    'job opportunity',
  ]);

  const canonicalUrl = (job.canonical_url || '').trim() || `${SITE_URL}/job/${job.id || slug}`;

  return {
    slug,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: keywords,
    canonical_url: canonicalUrl,
    is_indexable: job.is_indexable !== false,
  };
}
