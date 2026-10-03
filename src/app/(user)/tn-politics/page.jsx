import { notFound } from 'next/navigation'
import { getPoliticsPosts, getAllMLATrackers } from '@/services/politicsServer'
import TnPoliticsView from '@/views/TnPolitics'

export const revalidate = 1800

export async function generateMetadata() {
  return {
    title: 'TN Politics — Tamil Nadu Political News, Speeches & Policy Tracker | VizhiTN',
    description: 'Tamil Nadu politics coverage — CM Vijay TVK government updates, DMK opposition watch, MLA district trackers, speech summaries and policy explainers. Updated daily.',
    alternates: {
      canonical: 'https://www.vizhitn.in/tn-politics'
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: 'TN Politics | VizhiTN',
      description: 'Daily Tamil Nadu political news — TVK government, DMK opposition, MLA trackers',
      url: 'https://www.vizhitn.in/tn-politics',
      type: 'website'
    }
  }
}

export default async function TnPoliticsPage() {
  const [posts, mlaTrackers] = await Promise.all([
    getPoliticsPosts({ limit: 20 }),
    getAllMLATrackers()
  ])

  return <TnPoliticsView posts={posts} mlaTrackers={mlaTrackers} />
}
