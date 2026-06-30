// Server Component — fetches post data for metadata/SEO at request time.
// PostDetail client component below handles all interactivity (completely untouched).
//
// SEO: Individual posts are noindex. They are thin UGC (1–5 sentences).
// Crawl budget is preserved for district/category hub pages instead.
// Users can still reach posts via direct links — noindex ≠ inaccessible.
import React from 'react';

// ISR: regenerate every hour (keeps post data fresh for direct link visits)
export const revalidate = 3600;
import { createClient } from '@supabase/supabase-js';
import PostDetailClient from './PostDetailClient';

const SITE_URL = 'https://www.vizhitn.in';

// ── Server-side Supabase client ───────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

async function fetchPost(id) {
  try {
    const supabase = getSupabase();

    // 1. Try post table
    const { data: post } = await supabase
      .from('post')
      .select('id,title:title_en,description:content_en,area_slug,district_slug,category_slug,post_type,created_date,status,civic_receipt_id,upvotes,downvotes')
      .eq('id', id)
      .maybeSingle();

    if (post) {
      if (post.status !== 'active') return null;
      return post;
    }

    // 2. Try situation_update table
    const { data: sit } = await supabase
      .from('situation_update')
      .select('id,title,details,area_slug,district_slug,situation_type,created_date,status,confirm_count')
      .eq('id', id)
      .maybeSingle();

    if (sit) {
      if (sit.status !== 'active') return null;
      return {
        id: sit.id,
        title: sit.title,
        description: sit.details,
        area_slug: sit.area_slug,
        district_slug: sit.district_slug,
        category_slug: sit.situation_type === 'eb_shutdown' ? 'power-cut' : (sit.situation_type === 'water_shortage' ? 'water-issue' : 'road-problem'),
        post_type: 'alert',
        created_date: sit.created_date,
        status: sit.status,
        civic_receipt_id: 'SIT-' + sit.id,
        upvotes: sit.confirm_count,
        downvotes: 0
      };
    }

    // 3. Try scam_alert table
    const { data: scam } = await supabase
      .from('scam_alert')
      .select('id,title,description,area_slug,district_slug,created_date,status,confirm_count')
      .eq('id', id)
      .maybeSingle();

    if (scam) {
      if (scam.status !== 'active') return null;
      return {
        id: scam.id,
        title: scam.title,
        description: scam.description,
        area_slug: scam.area_slug,
        district_slug: scam.district_slug,
        category_slug: 'scam',
        post_type: 'alert',
        created_date: scam.created_date,
        status: scam.status,
        civic_receipt_id: 'SCAM-' + scam.id,
        upvotes: scam.confirm_count,
        downvotes: 0
      };
    }

    // 4. Try emergency_post table
    const { data: emerg } = await supabase
      .from('emergency_post')
      .select('id,title,description,area_slug,district_slug,created_date,status,confirm_count')
      .eq('id', id)
      .maybeSingle();

    if (emerg) {
      if (emerg.status !== 'active') return null;
      return {
        id: emerg.id,
        title: emerg.title,
        description: emerg.description,
        area_slug: emerg.area_slug,
        district_slug: emerg.district_slug,
        category_slug: 'scam',
        post_type: 'alert',
        created_date: emerg.created_date,
        status: emerg.status,
        civic_receipt_id: 'EMERG-' + emerg.id,
        upvotes: emerg.confirm_count,
        downvotes: 0
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Next.js generateMetadata ──────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const post = await fetchPost(params.id);

  if (!post) {
    return {
      title: 'Report Not Found',
      robots: { index: false },
    };
  }

  const title = post.title
    ? `${post.title} – Civic Report | VizhiTN`
    : 'Civic Report | VizhiTN';
  const description = post.description
    ? post.description.slice(0, 160)
    : `Civic ${post.post_type || 'report'} from ${post.area_slug || post.district_slug || 'Tamil Nadu'} on VizhiTN.`;
  const canonical = `${SITE_URL}/post/${post.id}`;
  const image = post.featured_image || `${SITE_URL}/og-image.png`;

  // Location info for breadcrumb context
  const locationName = post.area_slug
    ? post.area_slug.replace(/-/g, ' ')
    : post.district_slug
    ? post.district_slug.replace(/-/g, ' ')
    : 'Tamil Nadu';

  return {
    title,
    description,
    alternates: { canonical },
    // noindex: individual posts are thin UGC. Hub pages (district, category)
    // are indexed and surface the same content in aggregated, keyword-rich form.
    robots: {
      index: false,
      follow: true, // still follow links on the post page
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: 'VizhiTN',
      locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: post.created_date,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const post = await fetchPost(params.id);

  // DiscussionForumPosting / SocialMediaPosting schema for civic reports
  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        headline: post.title,
        text: post.description || '',
        url: `${SITE_URL}/post/${post.id}`,
        datePublished: post.created_date,
        author: { '@type': 'Person', name: 'VizhiTN Member' },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: post.upvotes || 0,
          },
        ],
        about: {
          '@type': 'Place',
          name: post.area_slug || post.district_slug || 'Tamil Nadu',
          address: {
            '@type': 'PostalAddress',
            addressRegion: 'Tamil Nadu',
            addressCountry: 'IN',
          },
        },
      }
    : null;

  // BreadcrumbList
  const breadcrumbLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Explore', item: `${SITE_URL}/explore` },
          ...(post.district_slug
            ? [{ '@type': 'ListItem', position: 3, name: post.district_slug.replace(/-/g, ' '), item: `${SITE_URL}/${post.district_slug}/` }]
            : []),
          { '@type': 'ListItem', position: post.district_slug ? 4 : 3, name: post.title || 'Report', item: `${SITE_URL}/post/${post.id}` },
        ],
      }
    : null;

  return (
    <>
      {/* Server-injected structured data — Google reads without running JS */}
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
      <PostDetailClient />
    </>
  );
}
