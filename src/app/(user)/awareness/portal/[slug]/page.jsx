import { getPortalBySlug } from '@/lib/awarenessServer';
import AwarenessPortalDetail from '@/views/AwarenessPortalDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const portal = getPortalBySlug(params.slug);
  if (!portal) notFound();

  const title = portal.name_en;
  const description = portal.description_en;
  const canonical = `${SITE_URL}/awareness/portal/${portal.slug}`;

  return {
    title: `${title} - Government Portal | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  };
}

export default function Page({ params }) {
  const portal = getPortalBySlug(params.slug);
  if (!portal) notFound();

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'Portals', href: '/awareness/portals' },
        { name: portal.name_en, href: `/awareness/portal/${portal.slug}` },
      ]} />
      <AwarenessPortalDetail portal={portal} />
    </>
  );
}
