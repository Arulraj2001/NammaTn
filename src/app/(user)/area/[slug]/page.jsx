import AreaDetail from '@/views/AreaDetail';
import { notFound } from 'next/navigation';
import { getAreaDetailData, getPublicArea } from '@/lib/publicHubServer';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const area = await getPublicArea(params.slug);
  if (!area) notFound();

  const district = area.district_name_en || area.district_name || 'Tamil Nadu';
  const title = `${area.name_en} Civic Issues, Alerts & Local Updates`;
  const description = `Track public complaints, resolved issues, alerts, and community updates in ${area.name_en}, ${district}.`;
  const canonical = `${SITE_URL}/area/${area.slug}/`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export default async function Page({ params }) {
  const initialData = await getAreaDetailData(params.slug);
  if (!initialData.area) notFound();
  return <AreaDetail initialSlug={params.slug} initialData={initialData} />;
}
