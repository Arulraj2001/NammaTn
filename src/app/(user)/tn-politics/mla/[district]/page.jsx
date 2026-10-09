import { notFound } from 'next/navigation'
import { getMLATracker, getAllMLATrackers, getPoliticsPosts, getDistrictCivicPosts } from '@/services/politicsServer'
import MLATrackerView from '@/views/MLATracker'

export const revalidate = 86400

export async function generateMetadata({ params }) {
  const mla = await getMLATracker(params.district)
  if (!mla) return { title: 'Not Found | VizhiTN' }

  return {
    title: `${mla.district_name} MLA ${mla.mla_name} — ${mla.party_name} Performance Tracker`,
    description: `Track ${mla.district_name} MLA ${mla.mla_name} (${mla.party_name}) performance, key actions, and civic issues in ${mla.district_name} district.`,
    alternates: {
      canonical: `https://www.vizhitn.in/tn-politics/mla/${params.district}`
    },
    robots: { index: true, follow: true }
  }
}

export default async function MLATrackerPage({ params }) {
  const [mla, posts, allMLAs, districtPosts] = await Promise.all([
    getMLATracker(params.district),
    getPoliticsPosts({ limit: 6 }),
    getAllMLATrackers(),
    getDistrictCivicPosts(params.district, 6)
  ])
  
  if (!mla) notFound()

  return (
    <MLATrackerView
      mla={mla}
      recentPosts={posts}
      allMLAs={allMLAs}
      districtPosts={districtPosts}
    />
  )
}
