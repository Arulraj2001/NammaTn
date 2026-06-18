import React from 'react';
import Providers from './providers';
import '@/index.css';

const SITE_URL = 'https://nammatn.in';
const SITE_NAME = 'NammaTN';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NammaTN – Tamil Nadu Civic Complaint & Community Platform',
    template: '%s | NammaTN',
  },
  description:
    'NammaTN is Tamil Nadu\'s public civic platform — report local issues, track resolutions, join live community discussions, access government schemes, and celebrate community wins.',
  keywords: [
    'Tamil Nadu civic complaints', 'TN government issues', 'NammaTN',
    'Tamil Nadu community platform', 'civic issues Tamil Nadu', 'report potholes TN',
    'Tamil Nadu water supply complaint', 'TN pulse live feed', 'community wins TN',
    'citizen awareness Tamil Nadu', 'government schemes Tamil Nadu', 'RTI Tamil Nadu',
  ],
  authors: [{ name: 'NammaTN Team', url: SITE_URL }],
  creator: 'NammaTN',
  publisher: 'NammaTN',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: 'ta_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'NammaTN – Tamil Nadu Civic Complaint & Community Platform',
    description:
      'Report local civic issues, track real-time resolutions, and connect with your Tamil Nadu community.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'NammaTN – Tamil Nadu Civic Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NammaTN – Tamil Nadu Civic Platform',
    description:
      'Report local civic issues, track resolutions, and connect with your community.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@NammaTN',
    site: '@NammaTN',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-IN': SITE_URL,
      'ta-IN': `${SITE_URL}/ta`,
    },
  },
  verification: {
    google: 'nammatn-google-site-verification',
  },
  category: 'civic technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="color-scheme" content="light dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NammaTN" />
        {/* Geo targeting — Tamil Nadu, India */}
        <meta name="geo.region" content="IN-TN" />
        <meta name="geo.placename" content="Tamil Nadu, India" />
        <meta name="DC.language" content="en-IN" />
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hzgrzcablefquddisqkf.supabase.co" />
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'NammaTN',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description:
                "Tamil Nadu's civic complaint and community platform.",
              areaServed: {
                '@type': 'State',
                name: 'Tamil Nadu',
                containedInPlace: { '@type': 'Country', name: 'India' },
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                url: `${SITE_URL}/contact`,
              },
              sameAs: [
                'https://twitter.com/NammaTN',
                'https://www.facebook.com/NammaTN',
              ],
            }),
          }}
        />
        {/* WebSite structured data with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'NammaTN',
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

