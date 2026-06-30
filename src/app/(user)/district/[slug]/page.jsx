// src/app/(user)/district/[slug]/page.jsx
// 301 Permanent Redirect to /[city]/ to consolidate authority and prevent duplicate content penalties.

import { permanentRedirect } from 'next/navigation';

export default async function Page({ params }) {
  const { slug } = await params;
  permanentRedirect(`/${slug}/`);
}
