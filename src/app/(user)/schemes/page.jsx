import AwarenessSchemes from '@/views/AwarenessSchemes';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Tamil Nadu Government Schemes Encyclopedia (திட்டங்கள்) 2026',
  description: 'Complete verified directory of 200+ Tamil Nadu government welfare schemes — Magalir Urimai, Pudhumai Penn, CMCHIS Health, OAP Pension, Scholarships, and eligibility guides.',
  alternates: { canonical: '/schemes' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Tamil Nadu Government Schemes Encyclopedia 2026 | VizhiTN',
    description: 'Explore welfare schemes, benefits, documents needed, and application procedures for Tamil Nadu citizens.',
    url: '/schemes',
    type: 'website',
    images: [{ url: 'https://www.vizhitn.in/images/evergreen/magalir-urimai.jpg', width: 1200, height: 630, alt: 'Tamil Nadu Government Schemes' }]
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Government Schemes', href: '/schemes' }]} />
      <AwarenessSchemes />
    </>
  );
}
