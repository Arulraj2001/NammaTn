import OfficeDetail from '@/views/OfficeDetail';
import { notFound } from 'next/navigation';
import { OFFICES, getOfficeBySlug } from '@/lib/offices';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export function generateStaticParams() {
  return OFFICES.map(office => ({ slug: office.slug }));
}

export async function generateMetadata({ params }) {
  const office = getOfficeBySlug(params.slug);
  if (!office) notFound();

  const title = `${office.name_en} Status & Citizen Reports in Tamil Nadu`;
  const description = `Check community-reported waiting times, service status, and citizen experiences for ${office.name_en} locations across Tamil Nadu.`;
  const canonical = `${SITE_URL}/office/${office.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export default function Page({ params, searchParams }) {
  const office = getOfficeBySlug(params.slug);
  if (!office) notFound();
  return (
    <>
      <Breadcrumbs items={[
        { name: 'Government Offices', href: '/offices' },
        { name: office.name_en, href: `/office/${params.slug}` },
      ]} />
      <OfficeDetail
        initialSlug={params.slug}
        initialDistrict={searchParams?.district || ''}
      />
    </>
  );
}
