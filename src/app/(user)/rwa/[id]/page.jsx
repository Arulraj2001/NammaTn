import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import RWADetail from '@/views/RWADetail';
import { getRwaGroupDetailData } from '@/lib/rwaServer';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getRwaGroupDetailData(id);
  const group = data?.group;

  if (!group) notFound();

  const title = `${group.group_name} | Verified RWA Community Dashboard`;
  const description = `Learn about ${group.group_name}, its area coverage, community activity, and recent civic reports across ${group.district_name || 'Tamil Nadu'}.`;
  const canonical = `${SITE_URL}/rwa/${group.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
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
  const { id } = await params;
  const initialData = await getRwaGroupDetailData(id);

  if (!initialData.group) notFound();

  const group = initialData.group;
  const canonical = `${SITE_URL}/rwa/${group.id}`;

  return (
    <>
      <Breadcrumbs items={[
        { name: 'RWA Dashboard', href: '/rwa' },
        { name: group.group_name, href: canonical },
      ]} />
      <RWADetail initialData={initialData} />
    </>
  );
}
