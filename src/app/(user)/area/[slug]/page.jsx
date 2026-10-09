import AreaDetail from '@/views/AreaDetail';
import { notFound } from 'next/navigation';
import { getAreaDetailData, getPublicArea } from '@/lib/publicHubServer';
import { BreadcrumbJsonLd } from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const area = await getPublicArea(params.slug);
  if (!area) {
    return {
      title: 'Area Reports | VizhiTN',
      robots: { index: false, follow: false },
    };
  }

  const district = area.district_name_en || area.district_name || 'Tamil Nadu';
  const title = `${area.name_en} Civic Issues, Alerts & Local Updates`;
  const description = `Track public complaints, resolved issues, alerts, and community updates in ${area.name_en}, ${district}.`;
  const canonical = `${SITE_URL}/area/${area.slug}`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${area.name_en} Civic Issues & Local Updates`);
  if (area.name_ta) ogUrl.searchParams.set('title_ta', `${area.name_ta} உள்ளூர் நிலவரம்`);
  if (area.district_slug) ogUrl.searchParams.set('district', area.district_slug);
  ogUrl.searchParams.set('category', 'local-development');
  const ogImageUrl = ogUrl.toString();

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({ params }) {
  const initialData = await getAreaDetailData(params.slug);
  if (!initialData.area) notFound();
  const areaName = initialData.area.name_en || initialData.area.name || params.slug;
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Areas', href: '/areas' },
        { name: areaName, href: `/area/${params.slug}` },
      ]} />
      <AreaDetail initialSlug={params.slug} initialData={initialData} />
    </>
  );
}
