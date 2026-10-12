// src/app/(user)/tn-politics/daily/[date]/page.jsx
import { notFound } from 'next/navigation'
import { getDailyDigestByDate, getAllDigestDates, getWeeklyDigest, getMonthlyDigest } from '@/lib/dailyDigestServer'
import DailyDigestView from '@/views/DailyDigestView'

export const revalidate = 86400 // Daily archive pages are static historical records

export async function generateStaticParams() {
  const dates = await getAllDigestDates()
  return dates.map(date => ({ date }))
}

export async function generateMetadata({ params }) {
  const resolved = await params
  const dateStr = resolved.date
  const digest = await getDailyDigestByDate(dateStr)

  if (!digest) {
    return { title: 'Digest Not Found | VizhiTN' }
  }

  const title = `${digest.title_en} | VizhiTN Governance Archive`
  const description = digest.headline_en

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.vizhitn.in/tn-politics/daily/${dateStr}`
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://www.vizhitn.in/tn-politics/daily/${dateStr}`,
      type: 'article',
      locale: 'ta_IN'
    }
  }
}

export default async function DailyDatedDigestPage({ params }) {
  const resolved = await params
  const dateStr = resolved.date
  const digest = await getDailyDigestByDate(dateStr)

  if (!digest) {
    notFound()
  }

  const [weekly, monthly] = await Promise.all([
    getWeeklyDigest('2026-w41'),
    getMonthlyDigest('2026-10')
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: digest.title_en,
    description: digest.headline_en,
    datePublished: digest.published_at,
    inLanguage: ['en-IN', 'ta-IN'],
    publisher: {
      '@type': 'Organization',
      name: 'VizhiTN',
      url: 'https://www.vizhitn.in'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.vizhitn.in/tn-politics/daily/${dateStr}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DailyDigestView digest={digest} weekly={weekly} monthly={monthly} />
    </>
  )
}
