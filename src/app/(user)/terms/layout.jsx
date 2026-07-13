const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Terms of Service',
  description: 'Read the terms that govern access to and use of VizhiTN, including community content, acceptable use, and responsibilities.',
  alternates: { canonical: `${SITE_URL}/terms/` },
  openGraph: {
    title: 'Terms of Service',
    description: 'Read the terms that govern access to and use of VizhiTN, including community content, acceptable use, and responsibilities.',
    url: `${SITE_URL}/terms/`,
    type: 'website',
  },
};

export default function TermsLayout({ children }) {
  return children;
}
