// src/components/ads/NativeBanner.jsx
// Profitablerate-cpm native banner (4:1). Injected via the provided ad-network
// invoke script + container. Rendered in the page body where placed.
// Excluded on admin/dashboard so the ad network can't intercept internal clicks.
'use client';
import { usePathname } from 'next/navigation';

export default function NativeBanner() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        async
        data-cfasync="false"
        src="https://pl31335207.profitableratecpmnetwork.com/6d82023cc3d3f05d27b42339c81b2e71/invoke.js"
      />
      <div id="container-6d82023cc3d3f05d27b42339c81b2e71" />
    </div>
  );
}