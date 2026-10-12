// src/app/(user)/tn-politics/today/page.jsx
import { getTodayDigest, getWeeklyDigest, getMonthlyDigest } from '@/lib/dailyDigestServer'
import DailyDigestView from '@/views/DailyDigestView'

export const revalidate = 900 // 15 minutes cache revalidation

export async function generateMetadata() {
  const digest = await getTodayDigest()

  const title = `Today's Tamil Nadu Administration Digest (7:00 PM) | CM Vijay & Governance Ledger | VizhiTN`
  const description = digest.headline_en || 'Daily 7:00 PM IST comprehensive governance recap of Tamil Nadu Government decisions, Secretariat G.O. orders, CM Cell redressal, and cabinet milestones.'

  return {
    title,
    description,
    keywords: [
      'tn government decisions today',
      'cm vijay today news',
      'tamil nadu today governance digest',
      'today tn cabinet decisions',
      'tangedco eb news today',
      'cm cell 1100 status',
      'tamil nadu secretariate updates'
    ],
    alternates: {
      canonical: 'https://www.vizhitn.in/tn-politics/today'
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: 'https://www.vizhitn.in/tn-politics/today',
      type: 'article',
      locale: 'ta_IN',
      siteName: 'VizhiTN'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  }
}

export default async function TodayDigestPage() {
  const [digest, weekly, monthly] = await Promise.all([
    getTodayDigest(),
    getWeeklyDigest('2026-w41'),
    getMonthlyDigest('2026-10')
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: digest.title_en,
    description: digest.headline_en,
    datePublished: digest.published_at,
    dateModified: new Date().toISOString(),
    inLanguage: ['en-IN', 'ta-IN'],
    publisher: {
      '@type': 'Organization',
      name: 'VizhiTN',
      url: 'https://www.vizhitn.in'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://www.vizhitn.in/tn-politics/today'
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
