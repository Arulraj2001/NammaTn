const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'How to Use VizhiTN',
  description: 'Learn how to report civic issues, browse local alerts, and participate safely in the VizhiTN community.',
  alternates: { canonical: `${SITE_URL}/how-to-use/` },
  openGraph: {
    title: 'How to Use VizhiTN',
    description: 'Learn how to report civic issues, browse local alerts, and participate safely in the VizhiTN community.',
    url: `${SITE_URL}/how-to-use/`,
    type: 'website',
  },
};

export default function HowToUseLayout({ children }) {
  return children;
}
