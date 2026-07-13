const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read how VizhiTN collects, uses, stores, and protects personal data, cookies, analytics, and advertising information.',
  alternates: { canonical: `${SITE_URL}/privacy-policy/` },
  openGraph: {
    title: 'Privacy Policy',
    description: 'Read how VizhiTN collects, uses, stores, and protects personal data, cookies, analytics, and advertising information.',
    url: `${SITE_URL}/privacy-policy/`,
    type: 'website',
  },
};

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
