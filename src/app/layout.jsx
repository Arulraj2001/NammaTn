import React from 'react';
import Providers from './providers';
import '@/index.css';

// AdSense pub ID is injected at runtime by the admin panel via window.__ADSENSE_PUB_ID__
// See: AdminMonetization.jsx → AdSense Settings tab

const SITE_URL = 'https://vizhitn.in';
const SITE_NAME = 'VizhiTN';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VizhiTN – Tamil Nadu Civic Complaint & Community Platform',
    template: '%s | VizhiTN',
  },
  description:
    'VizhiTN is Tamil Nadu\'s public civic platform — report local issues, track resolutions, join live community discussions, access government schemes, and celebrate community wins.',
  keywords: [
    'Tamil Nadu civic complaints', 'TN government issues', 'VizhiTN',
    'Tamil Nadu community platform', 'civic issues Tamil Nadu', 'report potholes TN',
    'Tamil Nadu water supply complaint', 'TN pulse live feed', 'community wins TN',
    'citizen awareness Tamil Nadu', 'government schemes Tamil Nadu', 'RTI Tamil Nadu',
  ],
  authors: [{ name: 'VizhiTN Team', url: SITE_URL }],
  creator: 'VizhiTN',
  publisher: 'VizhiTN',
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
    title: 'VizhiTN – Tamil Nadu Civic Complaint & Community Platform',
    description:
      'Report local civic issues, track real-time resolutions, and connect with your Tamil Nadu community.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'VizhiTN – Tamil Nadu Civic Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VizhiTN – Tamil Nadu Civic Platform',
    description:
      'Report local civic issues, track resolutions, and connect with your community.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@VizhiTN',
    site: '@VizhiTN',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' }
    ],
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
    google: 'VizhiTN-google-site-verification',
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
        <meta name="apple-mobile-web-app-title" content="VizhiTN" />
        {/* Geo targeting — Tamil Nadu, India */}
        <meta name="geo.region" content="IN-TN" />
        <meta name="geo.placename" content="Tamil Nadu, India" />
        <meta name="DC.language" content="en-IN" />
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hzgrzcablefquddisqkf.supabase.co" />
        {/* AdSense preconnect — reduces ad load latency */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        <link rel="dns-prefetch" href="//www.googletagservices.com" />
        {/* Google AdSense script — publisher ID loaded from admin settings at runtime */}
        <script
          id="adsense-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var pubId = typeof window !== 'undefined' && window.__ADSENSE_PUB_ID__;
                if (pubId && pubId !== 'ca-pub-PLACEHOLDER') {
                  var s = document.createElement('script');
                  s.async = true;
                  s.crossOrigin = 'anonymous';
                  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + pubId;
                  document.head.appendChild(s);
                }
              })();
            `,
          }}
        />
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'VizhiTN',
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
                'https://twitter.com/VizhiTN',
                'https://www.facebook.com/VizhiTN',
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
              name: 'VizhiTN',
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

