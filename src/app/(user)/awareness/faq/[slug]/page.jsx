import { getFaqBySlug } from '@/lib/awarenessServer';
import AwarenessFaqDetail from '@/views/AwarenessFaqDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const faq = getFaqBySlug(params.slug);
  if (!faq) notFound();

  const title = faq.question_en;
  const description = faq.answer_en.substring(0, 160);
  const canonical = `${SITE_URL}/awareness/faq/${faq.slug}`;

  return {
    title: `${title} | VizhiTN FAQ`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
  };
}

export default function Page({ params }) {
  const faq = getFaqBySlug(params.slug);
  if (!faq) notFound();

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'FAQs', href: '/awareness/faqs' },
        { name: faq.question_en, href: `/awareness/faq/${faq.slug}` },
      ]} />
      <AwarenessFaqDetail faq={faq} />
    </>
  );
}
