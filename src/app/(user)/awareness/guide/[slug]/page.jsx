import { getGuideBySlug } from '@/lib/awarenessServer';
import AwarenessGuideDetail from '@/views/AwarenessGuideDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  const title = guide.title_en;
  const description = `Step-by-step guide: ${guide.title_en}. ${guide.department_en} helpline and resources.`;
  const canonical = `${SITE_URL}/awareness/guide/${guide.slug}`;

  return {
    title: `${title} - Civic Guide | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
  };
}

export default function Page({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'Guides', href: '/awareness/guides' },
        { name: guide.title_en, href: `/awareness/guide/${guide.slug}` },
      ]} />
      <AwarenessGuideDetail guide={guide} />
    </>
  );
}
