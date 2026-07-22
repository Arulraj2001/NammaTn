// src/app/(user)/district/[slug]/page.jsx
// 301 Permanent Redirect to /[city]/ to consolidate authority and prevent duplicate content penalties.

import { notFound, permanentRedirect } from 'next/navigation';
import { DISTRICT_MAP } from '@/lib/seo-data';

export default async function Page({ params }) {
  const { slug } = await params;
  if (!DISTRICT_MAP[slug]) notFound();
  permanentRedirect(`/${slug}/`);
}
