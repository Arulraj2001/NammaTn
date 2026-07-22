import CSRDashboard from '@/views/CSRDashboard';

export const metadata = {
  title: 'Tamil Nadu CSR Civic Impact Dashboard',
  description: 'Connect responsible CSR initiatives with transparent Tamil Nadu civic projects, verified community needs, and measurable public impact.',
  alternates: { canonical: '/csr' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CSRDashboard />;
}
