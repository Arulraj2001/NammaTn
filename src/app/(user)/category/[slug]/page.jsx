// src/app/(user)/category/[slug]/page.jsx
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import PageSchema from '@/components/seo/PageSchema';
import { CategoryDistrictLinks } from '@/components/seo/InternalLinks';

export const revalidate = 3600;

const CategoryDetail = nextDynamic(() => import('@/views/CategoryDetail'), { ssr: false });

function slugToLabel(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug];
  const label = category?.plural ?? slugToLabel(slug);

  const title = `${label} Reports in Tamil Nadu`;
  const description =
    `Browse all ${label.toLowerCase()} reports across Tamil Nadu submitted by citizens. ` +
    `Track ${category?.descriptionFragment ?? label.toLowerCase()} on VizhiTN.`;
  const canonicalUrl = `${SITE_URL}/category/${slug}/`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${label} Reports | VizhiTN`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug];
  const label = category?.plural ?? slugToLabel(slug);
  const canonicalUrl = `${SITE_URL}/category/${slug}/`;

  return (
    <>
      <PageSchema
        url={canonicalUrl}
        name={`${label} Reports in Tamil Nadu`}
        description={
          `Browse all ${label.toLowerCase()} reports across Tamil Nadu submitted by citizens on VizhiTN.`
        }
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Explore', url: `${SITE_URL}/explore/` },
          { name: label, url: canonicalUrl },
        ]}
      />

      <Suspense
        fallback={
          <div className="min-h-[60vh] w-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        }
      >
        <CategoryDetail />
      </Suspense>

      {/* Internal links: category → district cross-links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100 dark:border-slate-800">
        <CategoryDistrictLinks categorySlug={slug} categoryName={label} />
      </div>
    </>
  );
}
