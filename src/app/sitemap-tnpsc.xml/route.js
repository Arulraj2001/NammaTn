// src/app/sitemap-tnpsc.xml/route.js
// Dedicated Google XML Sitemap for the VizhiTN TNPSC Portal.
// Covers Exam Hubs, Subjects, Pre-chapter Topic Summaries, and Solved PYQ Papers.

import { 
  TNPSC_EXAMS, 
  TNPSC_SUBJECTS, 
  TNPSC_TOPICS, 
  TNPSC_PYQ_PAPERS 
} from '@/lib/tnpscData';

const SITE_URL = 'https://vizhitn.in';
export const revalidate = 86400; // 24-hour cache

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const urls = [];
  const now = new Date().toISOString();

  // 1. TNPSC Main Hub
  urls.push({
    loc: `${SITE_URL}/tnpsc`,
    lastmod: now,
    changefreq: 'daily',
    priority: '1.0',
  });

  // 2. PYQ Main Hub
  urls.push({
    loc: `${SITE_URL}/tnpsc/pyq`,
    lastmod: now,
    changefreq: 'weekly',
    priority: '0.9',
  });

  // 3. Exam Hubs
  TNPSC_EXAMS.forEach((ex) => {
    urls.push({
      loc: `${SITE_URL}/tnpsc/exams/${ex.slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.9',
    });
  });

  // 4. Subjects
  TNPSC_SUBJECTS
    .filter((s) => s.slug !== 'all')
    .forEach((sub) => {
      urls.push({
        loc: `${SITE_URL}/tnpsc/${sub.slug}`,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.85',
      });
    });

  // 5. High-Yield Topic Summaries & Practice
  TNPSC_TOPICS.forEach((t) => {
    urls.push({
      loc: `${SITE_URL}/tnpsc/topics/${t.slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.85',
    });
  });

  // 6. Solved PYQ Papers
  TNPSC_PYQ_PAPERS.forEach((p) => {
    urls.push({
      loc: `${SITE_URL}/tnpsc/pyq/${p.slug}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8',
    });
  });

  const itemsXml = urls
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${itemsXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}

