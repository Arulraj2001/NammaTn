import TnTodayArticle from '@/views/TnTodayArticle';
import { notFound } from 'next/navigation';
import { getTnTodayArticle } from '@/lib/tnTodayServer';
import { getTnTodayCanonical } from '@/lib/tnTodayUrl';
import { getPageTitle, getSocialTitle } from '@/lib/metadataTitle';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { article } = await getTnTodayArticle(params.slug);
  if (!article) notFound();

  const title = getPageTitle(article.seo_title || article.title, 'TN Today');
  const socialTitle = getSocialTitle(title);
  const description = article.seo_description || article.subtitle || article.summary || '';
  const image = article.social_image || article.featured_image || `${SITE_URL}/og-image.png`;
  const canonical = getTnTodayCanonical(article.slug);
  const publishedTime = article.publish_date || article.created_date;
  const modifiedTime = article.updated_date || publishedTime;

  return {
    title,
    description,
    keywords: article.seo_keywords || '',
    alternates: { canonical },
    openGraph: {
      type: 'article', title: socialTitle, description, url: canonical, siteName: 'VizhiTN', locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime, modifiedTime,
      authors: [article.author_name || 'VizhiTN Editorial Team'],
      section: article.category || 'general',
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { article, relatedArticles } = await getTnTodayArticle(params.slug);
  if (!article) notFound();
  const canonical = getTnTodayCanonical(article?.slug || params.slug);

  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.seo_title || article.title,
    description: article.seo_description || article.subtitle || '',
    image: article.social_image || article.featured_image ? [article.social_image || article.featured_image] : [],
    datePublished: article.publish_date || article.created_date,
    dateModified: article.updated_date || article.publish_date || article.created_date,
    author: { '@type': 'Person', name: article.author_name || 'VizhiTN Editorial Team' },
    publisher: {
      '@type': 'Organization',
      name: 'VizhiTN',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: article.seo_keywords || '',
    articleSection: article.category || 'general',
  } : null;

  const breadcrumbSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'TN Today', item: `${SITE_URL}/tn-today` },
      { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
    ],
  } : null;

  return (
    <>
      {articleSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />}
      {breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}
      <TnTodayArticle
        initialSlug={params.slug}
        initialArticle={article}
        initialRelatedArticles={relatedArticles}
      />
    </>
  );
}
