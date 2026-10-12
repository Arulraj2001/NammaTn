// src/app/(user)/tn-politics/monthly/[month]/page.jsx
import { notFound } from 'next/navigation'
import { getMonthlyDigest } from '@/lib/dailyDigestServer'
import WeeklyMonthlyDigestView from '@/views/WeeklyMonthlyDigestView'

export const revalidate = 86400

export async function generateStaticParams() {
  return [{ month: '2026-10' }]
}

export async function generateMetadata({ params }) {
  const resolved = await params
  const monthSlug = resolved.month
  const data = await getMonthlyDigest(monthSlug)

  if (!data) return { title: 'Monthly Scorecard Not Found | VizhiTN' }

  return {
    title: `${data.title_en} | VizhiTN Governance Ledger`,
    description: data.headline_en,
    alternates: {
      canonical: `https://www.vizhitn.in/tn-politics/monthly/${monthSlug}`
    },
    robots: { index: true, follow: true }
  }
}

export default async function MonthlyDigestPage({ params }) {
  const resolved = await params
  const monthSlug = resolved.month
  const data = await getMonthlyDigest(monthSlug)

  if (!data) notFound()

  return <WeeklyMonthlyDigestView type="monthly" data={data} />
}
