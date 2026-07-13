const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Contact VizhiTN',
  description: 'Contact the VizhiTN team for support, feedback, partnerships, and questions about the Tamil Nadu civic platform.',
  alternates: { canonical: `${SITE_URL}/contact/` },
  openGraph: {
    title: 'Contact VizhiTN',
    description: 'Contact the VizhiTN team for support, feedback, partnerships, and questions about the Tamil Nadu civic platform.',
    url: `${SITE_URL}/contact/`,
    type: 'website',
  },
};

export default function ContactLayout({ children }) {
  return children;
}
