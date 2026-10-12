// src/app/(user)/tn-politics/weekly/[week]/page.jsx
import { notFound } from 'next/navigation'
import { getWeeklyDigest } from '@/lib/dailyDigestServer'
import WeeklyMonthlyDigestView from '@/views/WeeklyMonthlyDigestView'

export const revalidate = 86400

export async function generateStaticParams() {
  return [{ week: '2026-w41' }]
}

export async function generateMetadata({ params }) {
  const resolved = await params
  const weekSlug = resolved.week
  const data = await getWeeklyDigest(weekSlug)

  if (!data) return { title: 'Weekly Digest Not Found | VizhiTN' }

  return {
    title: `${data.title_en} | VizhiTN Governance Recap`,
    description: data.headline_en,
    alternates: {
      canonical: `https://www.vizhitn.in/tn-politics/weekly/${weekSlug}`
    },
    robots: { index: true, follow: true }
  }
}

export default async function WeeklyDigestPage({ params }) {
  const resolved = await params
  const weekSlug = resolved.week
  const data = await getWeeklyDigest(weekSlug)

  if (!data) notFound()

  return <WeeklyMonthlyDigestView type="weekly" data={data} />
}
