import PostDetail from '@/views/PostDetail';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicPostDetail } from '@/lib/postServer';
import { getPageTitle, getSocialTitle } from '@/lib/metadataTitle';
import { toMetaDescription } from '@/lib/metaDescription';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { CATEGORY_MAP } from '@/lib/seo-data';
import { buildPostSeo } from '@/lib/postSeo';
import { generateNewsArticleSchema } from '@/lib/seo/newsSchema';
import { getPostUrl, getPostCanonicalUrl } from '@/lib/postUrl';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { post } = await getPublicPostDetail(params.id);
  if (!post) notFound();

  const seo = buildPostSeo(post);
  const postTitle = getPageTitle(seo.seo_title || post.title_en || post.title, 'Civic Report');
  const title = `${postTitle.replace(/\s*\|\s*VizhiTN\s*$/i, '')} – Civic Report`;
  const socialTitle = getSocialTitle(title);
  const description = seo.seo_description || toMetaDescription(
    post.content_en || post.description,
    `Civic report from ${post.area_name || post.district_name || 'Tamil Nadu'}.`,
  );
  const canonical = getPostCanonicalUrl(post);
  const image = post.before_photos?.[0] || post.media_urls?.[0] || post.image_url || `${SITE_URL}/og-image.png`;

  return {
    title: postTitle,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'article', title: socialTitle, description, url: canonical, siteName: 'VizhiTN', locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: postTitle }],
      publishedTime: post.created_date,
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { post, complaintTrackers } = await getPublicPostDetail(params.id);
  if (!post) notFound();

  // If accessed by UUID or receipt ID, permanently redirect (308) to the clean keyword slug
  if (post.slug && params.id !== post.slug) {
    permanentRedirect(`/post/${post.slug}`);
  }

  const canonical = getPostCanonicalUrl(post);
  const postUrlPath = getPostUrl(post);
  const title = post?.title_en || post?.title || 'Civic Report';
  const category = CATEGORY_MAP[post.category_slug];

  const newsArticleSchema = generateNewsArticleSchema({
    headline: post.title_en,
    description: post.seo_description || (post.content_en || '').slice(0, 160),
    url: canonical,
    imageUrl: post.media_urls?.[0] || post.before_photos?.[0] || null,
    datePublished: post.created_date,
    dateModified: post.updated_date || post.created_date,
    authorName: post.is_anonymous ? 'VizhiTN Reporter' : (post.author_name || 'VizhiTN Reporter'),
    section: post.category_slug || 'Civic News',
    language: 'en-IN',
  });

  const postSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: title,
    text: post.content_en || post.description || '',
    url: canonical,
    datePublished: post.created_date,
    author: { '@type': 'Person', name: post.author_name || 'VizhiTN Member' },
    interactionStatistic: [{
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: post.upvotes || 0,
    }],
    about: {
      '@type': 'Place',
      name: post.area_name || post.district_name || 'Tamil Nadu',
      address: { '@type': 'PostalAddress', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
    },
  } : null;

  const breadcrumbItems = [
    { name: 'Explore', href: '/explore' },
    ...(post.district_slug ? [{
      name: post.district_name || post.district_slug.replace(/-/g, ' '),
      href: `/${post.district_slug}`,
    }] : []),
    ...(post.district_slug && category ? [{
      name: category.name,
      href: `/${post.district_slug}/${category.slug}`,
    }] : []),
    { name: title, href: postUrlPath },
  ];

  return (
    <>
      {postSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
      <Breadcrumbs items={breadcrumbItems} />
      <PostDetail
        initialId={params.id}
        initialPost={post}
        initialComplaintTrackers={complaintTrackers}
      />
    </>
  );
}
