import StayDetail from '@/views/StayDetail';
import { notFound } from 'next/navigation';
import { getPublicStayDetail } from '@/lib/stayServer';
import { getPageTitle, getSocialTitle } from '@/lib/metadataTitle';
import { toMetaDescription } from '@/lib/metaDescription';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { buildStaySeo } from '@/lib/staySeo';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { listing } = await getPublicStayDetail(params.id);
  if (!listing) notFound();

  const seo = buildStaySeo(listing);
  const stayTitle = getPageTitle(seo.seo_title || listing.title || 'Stay Listing', 'Stay Listing');
  const title = `${stayTitle.replace(/\s*\|\s*VizhiTN\s*$/i, '')} – Stay Listing`;
  const socialTitle = getSocialTitle(title);
  const description = seo.seo_description || toMetaDescription(
    listing.description || listing.title,
    `Stay listing from ${listing.area_name || listing.district_name || 'Tamil Nadu'}.`,
  );
  const canonical = seo.canonical_url || `${SITE_URL}/stay/${listing.id}`;
  const image = listing.image_urls?.[0] || `${SITE_URL}/og-image.png`;

  return {
    title: stayTitle,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'article', title: socialTitle, description, url: canonical, siteName: 'VizhiTN', locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: stayTitle }],
      publishedTime: listing.created_date,
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { listing } = await getPublicStayDetail(params.id);
  if (!listing) notFound();

  const canonical = `${SITE_URL}/stay/${params.id}`;
  const title = listing?.title || 'Stay Listing';

  const breadcrumbItems = [
    { name: 'Stays', href: '/stay' },
    ...(listing.district_slug ? [{
      name: listing.district_name || listing.district_slug.replace(/-/g, ' '),
      href: `/stay?district=${listing.district_slug}`,
    }] : []),
    { name: title, href: `/stay/${params.id}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: title,
        description: listing.description || '',
        url: canonical,
        address: {
          '@type': 'PostalAddress',
          streetAddress: listing.landmark || '',
          addressRegion: listing.district_name || 'Tamil Nadu',
          addressCountry: 'IN',
        },
        ...(listing.rent_amount && { offers: { '@type': 'Offer', priceCurrency: 'INR', price: listing.rent_amount } }),
        image: listing.image_urls?.[0] || undefined,
      }) }} />
      <Breadcrumbs items={breadcrumbItems} />
      <StayDetail initialListing={listing} />
    </>
  );
}
