import RWADashboard from '@/views/RWADashboard';

export const metadata = {
  title: 'Resident Welfare Association Civic Dashboard',
  description: 'Discover verified Resident Welfare Associations and coordinate transparent, privacy-conscious civic action across Tamil Nadu communities.',
  alternates: { canonical: '/rwa' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <RWADashboard />;
}
