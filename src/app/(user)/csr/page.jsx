import CSRDashboard from '@/views/CSRDashboard';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Tamil Nadu CSR Civic Impact Dashboard',
  description: 'Connect responsible CSR initiatives with transparent Tamil Nadu civic projects, verified community needs, and measurable public impact.',
  alternates: { canonical: '/csr' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'CSR Dashboard', href: '/csr' }]} /><CSRDashboard /></>;
}
