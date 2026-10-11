import AwarenessFaqs from '@/views/AwarenessFaqs';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getAllFaqs } from '@/lib/awarenessServer';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Tamil Nadu Citizen FAQs: Civic Procedures & Government Answers | VizhiTN',
  description: 'Verified answers to the most common questions Tamil Nadu citizens ask: RTI filing, ration card updates, CMCHIS coverage, DVAC bribe reporting, police FIR rights, and new EB connections.',
  alternates: { canonical: `${SITE_URL}/awareness/faqs` },
  robots: { index: true, follow: true },
  keywords: [
    'tamil nadu citizen faq',
    'how to file rti in tamil nadu',
    'ration card new member apply tn',
    'cmchis eligibility faq',
    'dvac bribe reporting phone number',
    'police refuse fir what to do',
  ],
  openGraph: {
    title: 'Tamil Nadu Citizen FAQs & Civic Answers | VizhiTN',
    description: 'Practical, verified answers for Tamil Nadu citizens on legal rights, helplines, and government services.',
    url: `${SITE_URL}/awareness/faqs`,
    type: 'website',
    locale: 'en_IN',
  },
};

export default function Page() {
  const faqs = getAllFaqs();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question_en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer_en,
      },
    })),
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Civic FAQs', href: '/awareness/faqs' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AwarenessFaqs />
    </>
  );
}
