import { getSchemeBySlug } from '@/lib/awarenessServer';
import AwarenessSchemeDetail from '@/views/AwarenessSchemeDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const scheme = getSchemeBySlug(params.slug);
  if (!scheme) notFound();

  const title = scheme.name_en;
  const description = scheme.benefits_en || `Learn about ${title} and eligibility requirements.`;
  const canonical = `${SITE_URL}/awareness/scheme/${scheme.slug}`;

  return {
    title: `${title} - Tamil Nadu Scheme | VizhiTN`,
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
  const scheme = getSchemeBySlug(params.slug);
  if (!scheme) notFound();

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'Schemes', href: '/awareness/schemes' },
        { name: scheme.name_en, href: `/awareness/scheme/${scheme.slug}` },
      ]} />
      <AwarenessSchemeDetail scheme={scheme} />
    </>
  );
}
