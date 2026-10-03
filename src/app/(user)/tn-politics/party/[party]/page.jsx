import { notFound } from 'next/navigation'
import { getPoliticsPostsByParty } from '@/services/politicsServer'
import PartyView from '@/views/PartyPage'

export const revalidate = 3600

const PARTIES = {
  'tvk': { name: 'TVK', fullName: 'Tamilaga Vettri Kazhagam', nameTa: 'தமிழக வெற்றி கழகம்' },
  'dmk': { name: 'DMK', fullName: 'Dravida Munnetra Kazhagam', nameTa: 'திராவிட முன்னேற்றக் கழகம்' },
  'aiadmk': { name: 'AIADMK', fullName: 'All India Anna Dravida Munnetra Kazhagam', nameTa: 'அதிமுக' },
  'bjp-tn': { name: 'BJP TN', fullName: 'Bharatiya Janata Party Tamil Nadu', nameTa: 'பாஜக தமிழ்நாடு' },
  'ntk': { name: 'NTK', fullName: 'Naam Tamilar Katchi', nameTa: 'நாம் தமிழர் கட்சி' },
  'pmk': { name: 'PMK', fullName: 'Pattali Makkal Katchi', nameTa: 'பாட்டாளி மக்கள் கட்சி' }
}

export async function generateMetadata({ params }) {
  const party = PARTIES[params.party]
  if (!party) return { title: 'Not Found | VizhiTN' }

  return {
    title: `${party.fullName} (${party.name}) News & Updates | VizhiTN TN Politics`,
    description: `Latest ${party.name} party news, speeches, policy positions and updates from Tamil Nadu. ${party.fullName} coverage on VizhiTN.`,
    alternates: {
      canonical: `https://www.vizhitn.in/tn-politics/party/${params.party}`
    },
    robots: { index: true, follow: true }
  }
}

export default async function PartyPage({ params }) {
  const party = PARTIES[params.party]
  if (!party) notFound()

  const posts = await getPoliticsPostsByParty(params.party, 20)
  return <PartyView party={party} partySlug={params.party} posts={posts} />
}
