// Server Component — fetches post data for metadata/SEO at request time.
// PostDetail client component below handles all interactivity (completely untouched).
import React from 'react';
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
    const { data } = await supabase
      .from('post')
      .select('id,title,description,area_slug,district_slug,category_slug,post_type,created_date,featured_image,status,civic_receipt_id,upvotes,downvotes')
      .eq('id', id)
      .maybeSingle();
    // Only index publicly visible, active posts
    if (!data || data.status !== 'active') return null;
    return data;
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
            ? [{ '@type': 'ListItem', position: 3, name: post.district_slug.replace(/-/g, ' '), item: `${SITE_URL}/district/${post.district_slug}` }]
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
