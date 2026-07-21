import PostDetail from '@/views/PostDetail';
import { getPublicPostDetail } from '@/lib/postServer';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { post } = await getPublicPostDetail(params.id);
  if (!post) return { title: 'Report Not Found', robots: { index: false } };

  const postTitle = post.title_en || post.title || 'Civic Report';
  const title = `${postTitle} – Civic Report | VizhiTN`;
  const description = (post.content_en || post.description || `Civic report from ${post.area_name || post.district_name || 'Tamil Nadu'}.`).slice(0, 160);
  const canonical = `${SITE_URL}/post/${post.id}/`;
  const image = post.before_photos?.[0] || post.media_urls?.[0] || post.image_url || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      type: 'article', title, description, url: canonical, siteName: 'VizhiTN', locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: postTitle }],
      publishedTime: post.created_date,
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { post, complaintTrackers } = await getPublicPostDetail(params.id);
  const canonical = `${SITE_URL}/post/${params.id}/`;
  const title = post?.title_en || post?.title || 'Civic Report';

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

  const breadcrumbSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Explore', item: `${SITE_URL}/explore/` },
      ...(post.district_slug ? [{
        '@type': 'ListItem', position: 3,
        name: post.district_name || post.district_slug.replace(/-/g, ' '),
        item: `${SITE_URL}/${post.district_slug}/`,
      }] : []),
      { '@type': 'ListItem', position: post.district_slug ? 4 : 3, name: title, item: canonical },
    ],
  } : null;

  return (
    <>
      {postSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }} />}
      {breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}
      <PostDetail
        initialId={params.id}
        initialPost={post}
        initialComplaintTrackers={complaintTrackers}
      />
    </>
  );
}
