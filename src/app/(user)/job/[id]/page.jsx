import JobDetail from '@/views/JobDetail';
import { notFound } from 'next/navigation';
import { getPublicJobDetail } from '@/lib/jobServer';
import { getPageTitle, getSocialTitle } from '@/lib/metadataTitle';
import { toMetaDescription } from '@/lib/metaDescription';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { buildJobSeo } from '@/lib/jobSeo';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { job } = await getPublicJobDetail(params.id);
  if (!job) notFound();

  const seo = buildJobSeo(job);
  const jobTitle = getPageTitle(seo.seo_title || job.title || 'Job Alert', 'Job Alert');
  const title = `${jobTitle.replace(/\s*\|\s*VizhiTN\s*$/i, '')} – Job Alert`;
  const socialTitle = getSocialTitle(title);
  const description = seo.seo_description || toMetaDescription(
    job.description || job.title,
    `Job alert from ${job.area_name || job.district_name || 'Tamil Nadu'}.`,
  );
  const canonical = seo.canonical_url || `${SITE_URL}/job/${job.id}`;

  return {
    title: jobTitle,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'article', title: socialTitle, description, url: canonical, siteName: 'VizhiTN', locale: 'en_IN',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: jobTitle }],
      publishedTime: job.created_date,
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [`${SITE_URL}/og-image.png`] },
  };
}

export default async function Page({ params }) {
  const { job } = await getPublicJobDetail(params.id);
  if (!job) notFound();

  const canonical = `${SITE_URL}/job/${params.id}`;
  const title = job?.title || 'Job Alert';

  const breadcrumbItems = [
    { name: 'Jobs', href: '/jobs' },
    ...(job.district_slug ? [{
      name: job.district_name || job.district_slug.replace(/-/g, ' '),
      href: `/jobs?district=${job.district_slug}`,
    }] : []),
    { name: title, href: `/job/${params.id}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: title,
        description: job.description || '',
        url: canonical,
        datePosted: job.created_date,
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressRegion: job.district_name || 'Tamil Nadu',
            addressCountry: 'IN',
          },
        },
        hiringOrganization: { '@type': 'Organization', name: 'VizhiTN Community' },
        ...(job.salary_info && { baseSalary: { '@type': 'PriceSpecification', priceCurrency: 'INR', price: job.salary_info } }),
      }) }} />
      <Breadcrumbs items={breadcrumbItems} />
      <JobDetail initialJob={job} />
    </>
  );
}
