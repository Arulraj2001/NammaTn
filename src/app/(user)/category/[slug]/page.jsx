// src/app/(user)/category/[slug]/page.jsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import { getCategoryBySlug } from '@/lib/categories';
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
  const publicCategory = getCategoryBySlug(slug);
  if (!publicCategory) notFound();
  const category = CATEGORY_MAP[slug];
  const label = category?.plural ?? publicCategory.name_en ?? slugToLabel(slug);

  const title = `${label} Reports in Tamil Nadu`;
  const description =
    `Browse all ${label.toLowerCase()} reports across Tamil Nadu submitted by citizens. ` +
    `Track ${category?.descriptionFragment ?? label.toLowerCase()} on VizhiTN.`;
  const canonicalUrl = `${SITE_URL}/category/${slug}`;

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
  const publicCategory = getCategoryBySlug(slug);
  if (!publicCategory) notFound();
  const category = CATEGORY_MAP[slug];
  const label = category?.plural ?? publicCategory.name_en ?? slugToLabel(slug);
  const canonicalUrl = `${SITE_URL}/category/${slug}`;
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
          { name: 'Explore', url: `${SITE_URL}/explore` },
          { name: label, url: canonicalUrl },
        ]}
      />

      {/* Server-rendered H1 + intro — ensures Google sees crawlable content
          even before the client CategoryDetail component hydrates. */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/explore" className="hover:text-blue-600 transition-colors">Explore</Link>
          <span aria-hidden="true">›</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          {label} Reports in Tamil Nadu
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-6">
          Browse all {label.toLowerCase()} reports across Tamil Nadu submitted by citizens on VizhiTN.
          {category?.descriptionFragment
            ? ` Track ${category.descriptionFragment} and stay informed about local conditions in your district.`
            : ` Track local conditions and stay informed about what is happening in your district.`}
          {' '}Reports are community-verified and updated as new information becomes available.
        </p>
      </main>

      <CategoryDetail initialSlug={slug} initialData={initialData} />

      {/* Internal links: category → district cross-links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100 dark:border-slate-800">
        <CategoryDistrictLinks categorySlug={slug} categoryName={label} />
      </div>
    </>
  );
}
