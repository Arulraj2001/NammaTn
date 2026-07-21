// src/app/(user)/category/[slug]/page.jsx
import React from 'react';
import { CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import PageSchema from '@/components/seo/PageSchema';
import { CategoryDistrictLinks } from '@/components/seo/InternalLinks';
import CategoryDetail from '@/views/CategoryDetail';
import { getCategoryHubData } from '@/lib/publicHubServer';

export const revalidate = 3600;

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
  const initialData = await getCategoryHubData(slug);

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

      <CategoryDetail initialSlug={slug} initialData={initialData} />

      {/* Internal links: category → district cross-links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100 dark:border-slate-800">
        <CategoryDistrictLinks categorySlug={slug} categoryName={label} />
      </div>
    </>
  );
}
