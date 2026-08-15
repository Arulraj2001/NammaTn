import ListingDetail from '@/views/ListingDetail';
import { notFound } from 'next/navigation';
import { getPublicListingDetail } from '@/lib/listingServer';
import { getPageTitle, getSocialTitle } from '@/lib/metadataTitle';
import { toMetaDescription } from '@/lib/metaDescription';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { buildListingSeo } from '@/lib/listingSeo';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { listing } = await getPublicListingDetail(params.id);
  if (!listing) notFound();

  const seo = buildListingSeo(listing);
  const listingTitle = getPageTitle(seo.seo_title || listing.business_name || 'Local Service', 'Local Service');
  const title = `${listingTitle.replace(/\s*\|\s*VizhiTN\s*$/i, '')} – Local Service`;
  const socialTitle = getSocialTitle(title);
  const description = seo.seo_description || toMetaDescription(
    listing.description || listing.business_name,
    `Service listing from ${listing.area_name || listing.district_name || 'Tamil Nadu'}.`,
  );
  const canonical = seo.canonical_url || `${SITE_URL}/listing/${listing.id}`;
  const image = listing.photo_urls?.[0] || `${SITE_URL}/og-image.png`;

  return {
    title: listingTitle,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'article', title: socialTitle, description, url: canonical, siteName: 'VizhiTN', locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: listingTitle }],
      publishedTime: listing.created_date,
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { listing } = await getPublicListingDetail(params.id);
  if (!listing) notFound();

  const canonical = `${SITE_URL}/listing/${params.id}`;
  const title = listing?.business_name || 'Local Service';

  const breadcrumbItems = [
    { name: 'Local Services', href: '/listings' },
    ...(listing.district_slug ? [{
      name: listing.district_name || listing.district_slug.replace(/-/g, ' '),
      href: `/listings?district=${listing.district_slug}`,
    }] : []),
    { name: title, href: `/listing/${params.id}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: title,
        description: listing.description || '',
        url: canonical,
        address: {
          '@type': 'PostalAddress',
          addressRegion: listing.district_name || 'Tamil Nadu',
          addressCountry: 'IN',
        },
        telephone: listing.contact_phone || undefined,
        image: listing.photo_urls?.[0] || undefined,
        ...(listing.rating_count > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: listing.rating_sum / listing.rating_count, ratingCount: listing.rating_count } }),
      }) }} />
      <Breadcrumbs items={breadcrumbItems} />
      <ListingDetail initialListing={listing} />
    </>
  );
}
