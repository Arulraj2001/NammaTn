const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'About VizhiTN',
  description: 'Learn how VizhiTN helps Tamil Nadu residents report civic issues, share local alerts, and track community updates.',
  alternates: { canonical: `${SITE_URL}/about/` },
  openGraph: {
    title: 'About VizhiTN',
    description: 'Learn how VizhiTN helps Tamil Nadu residents report civic issues, share local alerts, and track community updates.',
    url: `${SITE_URL}/about/`,
    type: 'website',
  },
};

export default function AboutLayout({ children }) {
  return children;
}
