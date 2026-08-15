import { getEmergencyContactBySlug } from '@/lib/awarenessServer';
import AwarenessEmergencyDetail from '@/views/AwarenessEmergencyDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const emergency = getEmergencyContactBySlug(params.slug);
  if (!emergency) notFound();

  const title = emergency.name_en;
  const description = emergency.description_en;
  const canonical = `${SITE_URL}/awareness/emergency/${emergency.slug}`;

  return {
    title: `${title} - Emergency Contact | VizhiTN`,
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
  const emergency = getEmergencyContactBySlug(params.slug);
  if (!emergency) notFound();

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'Emergency', href: '/awareness/emergency' },
        { name: emergency.name_en, href: `/awareness/emergency/${emergency.slug}` },
      ]} />
      <AwarenessEmergencyDetail emergency={emergency} />
    </>
  );
}
