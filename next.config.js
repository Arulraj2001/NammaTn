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
    return [
      {
        source: '/(.*)',
        headers: [
          // Security
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://hzgrzcablefquddisqkf.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com https://vizhitn.in https://*.bing.com https://*.bing.net https://*.clarity.ms https://c.bing.com https://unpkg.com https://*.tile.openstreetmap.org https://*.tn.gov.in https://*.gov.in",
              "connect-src 'self' https://hzgrzcablefquddisqkf.supabase.co wss://hzgrzcablefquddisqkf.supabase.co https://pagead2.googlesyndication.com https://www.google-analytics.com https://*.clarity.ms https://c.bing.com",
              "frame-src 'self' https://pagead2.googlesyndication.com",
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
