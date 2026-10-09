import React from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import { getCategoryBySlug, CATEGORY_ALIASES, resolveCategorySlug } from '@/lib/categories';
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
  const canonicalSlug = resolveCategorySlug(slug);
  const publicCategory = getCategoryBySlug(canonicalSlug);
  if (!publicCategory) {
    return {
      title: 'Category Reports',
      robots: { index: false, follow: false },
    };
  }

  const category = CATEGORY_MAP[canonicalSlug] || CATEGORY_MAP[slug];
  const label = category?.plural ?? publicCategory.name_en ?? slugToLabel(canonicalSlug);

  const title = `${label} Reports in Tamil Nadu`;
  const description =
    `Browse all ${label.toLowerCase()} reports across Tamil Nadu submitted by citizens. ` +
    `Track ${category?.descriptionFragment ?? label.toLowerCase()} on VizhiTN.`;
  const canonicalUrl = `${SITE_URL}/category/${canonicalSlug}`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${label} Reports & Alerts in Tamil Nadu`);
  if (publicCategory.name_ta) ogUrl.searchParams.set('title_ta', `${publicCategory.name_ta} தகவல்கள் & புகார்கள்`);
  ogUrl.searchParams.set('category', canonicalSlug);
  ogUrl.searchParams.set('urgency', 'medium');
  const ogImageUrl = ogUrl.toString();

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${label} Reports | VizhiTN`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} Reports | VizhiTN`,
      description,
      images: [ogImageUrl],
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

  // Canonical redirect for aliases (e.g., /category/power-cut -> /category/electricity)
  if (CATEGORY_ALIASES[slug]) {
    permanentRedirect(`/category/${CATEGORY_ALIASES[slug]}`);
  }

  const canonicalSlug = resolveCategorySlug(slug);
  const publicCategory = getCategoryBySlug(canonicalSlug);
  if (!publicCategory) notFound();

  const category = CATEGORY_MAP[canonicalSlug] || CATEGORY_MAP[slug];
  const label = category?.plural ?? publicCategory.name_en ?? slugToLabel(canonicalSlug);
  const canonicalUrl = `${SITE_URL}/category/${canonicalSlug}`;
  const initialData = await getCategoryHubData(canonicalSlug);


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

      <CategoryDetail initialSlug={canonicalSlug} initialData={initialData} />

      {/* Internal links: category → district cross-links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100 dark:border-slate-800">
        <CategoryDistrictLinks categorySlug={canonicalSlug} categoryName={label} />
      </div>
    </>
  );
}
