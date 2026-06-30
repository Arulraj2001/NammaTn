// Server Component — fetches article data for metadata/SEO at request time.
// The TnTodayArticle client component below handles all interactivity (untouched).
import React from 'react';

// ISR: regenerate every hour — article edits (corrections, updates) surface
// to Google without a full redeploy. Also updates lastModified in sitemap.
export const revalidate = 3600;
import { createClient } from '@supabase/supabase-js';
import TnTodayArticleClient from './TnTodayArticleClient';

const SITE_URL = 'https://www.vizhitn.in';

// ── Server-side Supabase client (anon key is safe — same as browser) ──────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

async function fetchArticle(slug) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('tn_today')
      .select('id,title,subtitle,slug,featured_image,social_image,category,author_name,publish_date,created_date,updated_date,seo_title,seo_description,seo_keywords,reading_time,summary,content,canonical_url')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

// ── Next.js generateMetadata — runs on server, injects <head> before any JS ───
export async function generateMetadata({ params }) {
  const article = await fetchArticle(params.slug);

  if (!article) {
    return {
      title: 'Story Not Found',
      robots: { index: false },
    };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.subtitle || article.summary || '';
  const image = article.social_image || article.featured_image || `${SITE_URL}/og-image.png`;
  const canonical = article.canonical_url || `${SITE_URL}/tn-today/${article.slug}`;
  const publishDate = article.publish_date || article.created_date;
  const modifyDate = article.updated_date || publishDate;

  return {
    title,
    description,
    keywords: article.seo_keywords || '',
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: 'VizhiTN',
      locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: publishDate,
      modifiedTime: modifyDate,
      authors: [article.author_name || 'VizhiTN Editorial Team'],
      section: article.category || 'general',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

// ── Page component — server renders JSON-LD, client component handles UI ──────
export default async function Page({ params }) {
  const article = await fetchArticle(params.slug);

  // Build Article JSON-LD for Google News / article rich results
  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.seo_title || article.title,
        description: article.seo_description || article.subtitle || '',
        image: article.social_image || article.featured_image
          ? [article.social_image || article.featured_image]
          : [],
        datePublished: article.publish_date || article.created_date,
        dateModified: article.updated_date || article.publish_date || article.created_date,
        author: {
          '@type': 'Person',
          name: article.author_name || 'VizhiTN Editorial Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'VizhiTN',
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': article.canonical_url || `${SITE_URL}/tn-today/${article.slug}`,
        },
        keywords: article.seo_keywords || '',
        articleSection: article.category || 'general',
      }
    : null;

  // BreadcrumbList JSON-LD
  const breadcrumbLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'TN Today', item: `${SITE_URL}/tn-today` },
          { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/tn-today/${article.slug}` },
        ],
      }
    : null;

  return (
    <>
      {/* Server-injected structured data — Google reads this without running JS */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}

      {/* Client component handles all interactivity — completely untouched */}
      <TnTodayArticleClient />
    </>
  );
}
