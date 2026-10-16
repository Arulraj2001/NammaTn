import TnTodayArticle from '@/views/TnTodayArticle';
import { notFound } from 'next/navigation';
import { getTnTodayArticle } from '@/lib/tnTodayServer';
import { getTnTodayCanonical } from '@/lib/tnTodayUrl';
import { getPageTitle, getSocialTitle } from '@/lib/metadataTitle';
import { toMetaDescription } from '@/lib/metaDescription';
import { getArticleAuthor, getPublisherSchema } from '@/lib/schemaIdentity';
import { generateNewsArticleSchema } from '@/lib/seo/newsSchema';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params, searchParams }) {
  const { article } = await getTnTodayArticle(params.slug);
  if (!article) notFound();

  const isTamil = searchParams?.lang === 'ta';
  const tamilTitle = article.seo_title_ta || article.title_ta || '';
  const tamilDesc = article.seo_description_ta || article.subtitle_ta || article.summary_ta || '';

  const rawTitle = (isTamil && tamilTitle) ? tamilTitle : (article.seo_title || article.title);
  const title = getPageTitle(rawTitle, 'TN Today');
  const socialTitle = getSocialTitle(title);

  const rawDesc = (isTamil && tamilDesc) ? tamilDesc : (article.seo_description || article.subtitle || article.summary);
  const description = toMetaDescription(
    rawDesc,
    isTamil ? 'தமிழ்நாடு சமூக செய்திகள் மற்றும் பொது நல தகவல்கள் — VizhiTN.' : 'Tamil Nadu civic news and public-interest update from VizhiTN.',
  );

  const categorySlug = article.category || 'general';
  const cleanImage = article.featured_image && !article.featured_image.includes('/api/og?')
    ? article.featured_image
    : `${SITE_URL}/images/tntoday/${categorySlug}.webp`;

  let socialImage = article.social_image;
  if (!socialImage || socialImage.includes('/api/og?')) {
    const ogUrl = new URL(`${SITE_URL}/api/og/tn-today`);
    ogUrl.searchParams.set('title', article.seo_title || article.title || 'TN Today');
    if (tamilTitle) ogUrl.searchParams.set('title_ta', tamilTitle);
    ogUrl.searchParams.set('category', categorySlug);
    ogUrl.searchParams.set('lang', (isTamil || tamilTitle) ? 'ta' : 'en');
    if (cleanImage) ogUrl.searchParams.set('image', cleanImage);
    socialImage = ogUrl.toString();
  }
  const image = socialImage;
  const canonical = getTnTodayCanonical(article.slug);
  const pageUrl = isTamil ? `${canonical}?lang=ta` : canonical;
  const publishedTime = article.publish_date || article.created_date;
  const modifiedTime = article.updated_date || publishedTime;

  const keywordsList = [
    isTamil ? article.seo_keywords_ta : article.seo_keywords,
    article.seo_keywords,
    article.seo_keywords_ta,
    article.category,
    'Tamil Nadu News',
    'TN Today',
    'தமிழ்நாடு செய்திகள்',
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords: keywordsList,
    alternates: {
      canonical,
      languages: {
        'en-IN': canonical,
        'ta-IN': `${canonical}?lang=ta`,
        'x-default': canonical,
      },
    },
    openGraph: {
      type: 'article',
      title: socialTitle,
      description,
      url: pageUrl,
      siteName: 'VizhiTN',
      locale: isTamil ? 'ta_IN' : 'en_IN',
      alternateLocale: isTamil ? ['en_IN'] : ['ta_IN'],
      images: [{ url: image, width: 1200, height: 675, alt: title }],
      publishedTime,
      modifiedTime,
      authors: [article.author_name || 'VizhiTN Editorial Team'],
      section: article.category || 'general',
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [image] },
    other: {
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      ...(tamilTitle ? { 'article:headline:ta': tamilTitle } : {}),
      ...(tamilDesc ? { 'article:description:ta': tamilDesc } : {}),
    },
  };
}

export default async function Page({ params, searchParams }) {
  const { article, relatedArticles } = await getTnTodayArticle(params.slug);
  if (!article) notFound();
  const canonical = getTnTodayCanonical(article?.slug || params.slug);
  const isTamil = searchParams?.lang === 'ta';

  const articleSchema = article
    ? generateNewsArticleSchema({
        headline: (isTamil && article.title_ta) ? article.title_ta : (article.seo_title || article.title),
        headlineTa: article.seo_title_ta || article.title_ta || null,
        description: (isTamil && article.subtitle_ta) ? article.subtitle_ta : (article.seo_description || (article.subtitle || '').slice(0, 160)),
        descriptionTa: article.seo_description_ta || (article.subtitle_ta || '').slice(0, 160),
        url: isTamil ? `${canonical}?lang=ta` : canonical,
        imageUrl: (article.featured_image && !article.featured_image.includes('/api/og?'))
          ? article.featured_image
          : `${SITE_URL}/images/tntoday/${article.category || 'general'}.webp`,
        datePublished: article.publish_date || article.created_date,
        dateModified: article.updated_date || article.publish_date || article.created_date,
        authorName: article.author_name || 'VizhiTN Team',
        author: getArticleAuthor(article.author_name),
        publisher: getPublisherSchema(),
        section: article.category || 'Tamil Nadu News',
        language: isTamil ? 'ta-IN' : 'en-IN',
      })
    : null;

  const breadcrumbSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isTamil ? 'முகப்பு' : 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'TN Today', item: `${SITE_URL}/tn-today` },
      { '@type': 'ListItem', position: 3, name: (isTamil && article.title_ta) ? article.title_ta : article.title, item: canonical },
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
        initialLang={searchParams?.lang}
      />
    </>
  );
}
