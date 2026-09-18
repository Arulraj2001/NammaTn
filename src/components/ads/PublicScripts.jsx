'use client';
// src/components/ads/PublicScripts.jsx
// Loads GA4 analytics ONLY. All third-party ad-network popunder/push scripts
// (profitableratecpmnetwork.com, quge5.com) have been removed permanently.
// No service worker for ad networks will be registered.
// Reserved for Google AdSense only once the publisher account is approved.
import Script from 'next/script';

export default function PublicScripts() {
  return (
    <>
      {/* GA4 — analytics only */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CJ0JDFHPV3"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CJ0JDFHPV3');
        `}
      </Script>
    </>
  );
}