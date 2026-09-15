import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Canonical URL policy: every non-homepage route omits the trailing slash.
  trailingSlash: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ── Compression & Minification ────────────────────────────────────────────
  compress: true,
  swcMinify: true,

  // ── Performance: image optimisation ──────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'hzgrzcablefquddisqkf.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'vizhitn.in' },
      { protocol: 'https', hostname: '*.bing.com' },
      { protocol: 'https', hostname: '*.bing.net' },
      { protocol: 'https', hostname: '*.tn.gov.in' },
      { protocol: 'https', hostname: '*.gov.in' },
    ],
    minimumCacheTTL: 31536000, // 1 year — immutable optimised images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'none'; img-src 'self' data: blob:;",
  },

  // ── Security + SEO HTTP headers ──────────────────────────────────────────
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [
      // ── Cache headers for high-traffic article/hub pages: cache 1h, serve
      //     stale up to 24h while revalidating in the background (ISR-friendly). ──
      {
        source: '/:city/:issue',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/tn-today/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/post/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Security
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          // HSTS — enforce HTTPS for 2 years, include subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy — restrict script/style/image sources
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://news.google.com https://*.clarity.ms https://pl31335206.profitableratecpmnetwork.com https://pl31335207.profitableratecpmnetwork.com https://quge5.com https://3nbf4.com https://thedirecthor.com https://portalfluently.com https://6opo.com https://fizzyacerbitymellow.com https://auqot.com https://ekhay.com https://b3mny.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://news.google.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://hzgrzcablefquddisqkf.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com https://vizhitn.in https://*.bing.com https://*.bing.net https://*.clarity.ms https://c.bing.com https://unpkg.com https://*.tile.openstreetmap.org https://*.tn.gov.in https://*.gov.in https://pl31335206.profitableratecpmnetwork.com https://pl31335207.profitableratecpmnetwork.com https://3nbf4.com https://image.pollinations.ai https://quge5.com https://news.google.com https://thedirecthor.com https://portalfluently.com https://6opo.com https://fizzyacerbitymellow.com https://exemplarfederallithe.com https://workdeadlinededicate.com",
              "connect-src 'self' https://hzgrzcablefquddisqkf.supabase.co wss://hzgrzcablefquddisqkf.supabase.co https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://news.google.com https://*.clarity.ms https://c.bing.com https://translate.googleapis.com https://api.mymemory.translated.net https://api.indexnow.org https://www.google.com https://pl31335206.profitableratecpmnetwork.com https://pl31335207.profitableratecpmnetwork.com https://3nbf4.com https://quge5.com https://thedirecthor.com https://portalfluently.com https://6opo.com https://fizzyacerbitymellow.com https://exemplarfederallithe.com https://workdeadlinededicate.com https://auqot.com https://ekhay.com https://b3mny.com",
              "frame-src 'self' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://news.google.com https://pl31335206.profitableratecpmnetwork.com https://pl31335207.profitableratecpmnetwork.com https://3nbf4.com https://quge5.com https://thedirecthor.com https://6opo.com https://fizzyacerbitymellow.com https://auqot.com https://ekhay.com https://b3mny.com https://exemplarfederallithe.com https://workdeadlinededicate.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Cache static assets aggressively
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
      // Long cache for static assets
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Short cache for HTML (for SEO freshness)
      {
        source: '/(.*)\\.html',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },

  // ── Redirects for SEO (old URLs → new) ────────────────────────────────────
  async redirects() {
    return [
      // NOTE: Trailing-slash canonicalization is handled by `trailingSlash: false`
      // above (Next.js built-in, emits a permanent 308 `/path/` → `/path`).
      // We deliberately do NOT add a `/:path*/` catch-all here: in Vercel that
      // glob also matches the root `/`, producing an infinite self-redirect loop
      // (ERR_TOO_MANY_REDIRECTS) on the homepage. sitemap + internal links all
      // already emit the canonical no-slash form.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'vizhitn.in' }],
        destination: 'https://www.vizhitn.in/:path*',
        permanent: true,
      },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/tos',     destination: '/terms',           permanent: true },
      // Redirect old /district/:slug to canonical /:slug/ — route file removed to save crawl budget
      { source: '/district/:slug', destination: '/:slug', permanent: true },
      // ── Canonical alias redirects: old issue slugs → current canonical slugs ──
      // These aliases previously served identical content with no redirect,
      // creating duplicate crawl paths. Consolidate to the canonical slug.
      { source: '/:city/electricity',            destination: '/:city/power-cut',    permanent: true },
      { source: '/:city/water-sanitation',       destination: '/:city/water-issue',  permanent: true },
      { source: '/:city/road-infrastructure',    destination: '/:city/road-problem', permanent: true },
    ];
  },

  // ── Package optimisation ──────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react', 'framer-motion', 'recharts',
      '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover', '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip', 'date-fns', 'lodash',
    ],
    // Inline critical CSS, defer non-critical CSS — eliminates render-blocking stylesheet
    optimizeCss: true,
  },

  webpack: (config) => {
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'src/lib/router-compat.jsx');
    return config;
  },
};

export default nextConfig;
