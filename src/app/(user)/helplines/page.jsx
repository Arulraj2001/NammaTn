import AwarenessEmergency from '@/views/AwarenessEmergency';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Tamil Nadu 24x7 Emergency & Government Helplines Directory',
  description: 'Verified official 24x7 emergency phone numbers in Tamil Nadu — Police 100, Ambulance 108, Minnalagam 1912, GCC 1913, Cyber Crime 1930, Women 181, CM 1100, and District Disaster 1077.',
  alternates: { canonical: '/helplines' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Tamil Nadu 24x7 Emergency & Government Helplines Directory | VizhiTN',
    description: 'Instant 1-tap call direct contacts for power failure, flood rescue, police, cyber crime, and municipal issues across all 38 districts.',
    url: '/helplines',
    type: 'website',
    images: [{ url: 'https://www.vizhitn.in/images/evergreen/tn-helplines.jpg', width: 1200, height: 630, alt: 'Tamil Nadu Emergency Helplines' }]
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Emergency Helplines', href: '/helplines' }]} />
      <AwarenessEmergency />
    </>
  );
}
