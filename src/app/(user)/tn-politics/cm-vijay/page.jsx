import { getPoliticsPosts } from '@/services/politicsServer'
import CmVijayTrackerView from '@/views/CmVijayTrackerView'
import { CM_PROFILE, CM_FAQS } from '@/lib/cmVijayData'

export const revalidate = 1800

const SITE_URL = 'https://www.vizhitn.in'
const CANONICAL_URL = `${SITE_URL}/tn-politics/cm-vijay`

export async function generateMetadata() {
  const title = "CM Vijay Administration Tracker — What Did He Do? Schemes, G.O.s & CM Cell Helpline | VizhiTN"
  const description = "Track what Chief Minister C. Joseph Vijay did in Tamil Nadu: Kamarajar Breakfast Scheme, Kuruvai paddy prices, EV buses, ₹1,000 degree grants, official G.O.s, and 1100 CM Cell grievance redressal."

  const ogUrl = new URL(`${SITE_URL}/api/og`)
  ogUrl.searchParams.set('title', 'CM Vijay Administration & Civic Tracker')
  ogUrl.searchParams.set('title_ta', 'முதலமைச்சர் விஜய் அரசு செயல்பாடுகள் & திட்டங்கள்')
  ogUrl.searchParams.set('district', 'chennai')
  ogUrl.searchParams.set('category', 'tn-politics')
  ogUrl.searchParams.set('urgency', 'medium')
  const ogImageUrl = ogUrl.toString()

  return {
    title,
    description,
    keywords: [
      "what did CM Vijay do",
      "CM Vijay Tamil Nadu",
      "CM Vijay schemes list",
      "TVK Vijay government decisions",
      "Vijay CM announcements today",
      "விஜய் என்ன செய்தார்",
      "முதல்வர் விஜய் திட்டங்கள்",
      "CM Cell helpline 1100",
      "Tamil Nadu Chief Minister Vijay tracker"
    ],
    alternates: {
      canonical: CANONICAL_URL
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    },
    openGraph: {
      title,
      description,
      url: CANONICAL_URL,
      type: 'profile',
      siteName: 'VizhiTN — Tamil Nadu Civic Platform',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "CM Vijay Administration Tracker Tamil Nadu",
          type: "image/png"
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl]
    }
  }
}

export default async function CmVijayPage() {
  // Fetch latest related dispatches from db
  const relatedPosts = await getPoliticsPosts({ limit: 6, partySlug: 'tvk' })

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": CANONICAL_URL,
        "url": CANONICAL_URL,
        "name": "CM Vijay Administration & Civic Tracker",
        "description": "Public proof tracker for Tamil Nadu Chief Minister C. Joseph Vijay's governance, schemes, and decisions.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "TN Politics",
              "item": `${SITE_URL}/tn-politics`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "CM Vijay Tracker",
              "item": CANONICAL_URL
            }
          ]
        },
        "mainEntity": {
          "@type": "Person",
          "name": CM_PROFILE.name_en,
          "alternateName": CM_PROFILE.name_ta,
          "jobTitle": CM_PROFILE.title_en,
          "memberOf": {
            "@type": "PoliticalParty",
            "name": CM_PROFILE.party_name
          },
          "worksFor": {
            "@type": "GovernmentOrganization",
            "name": "Government of Tamil Nadu",
            "url": "https://www.tn.gov.in"
          },
          "telephone": CM_PROFILE.helpline_main,
          "image": `${SITE_URL}${CM_PROFILE.photo_url}`
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": CM_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question_en,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer_en
          }
        }))
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CmVijayTrackerView relatedPosts={relatedPosts || []} />
    </>
  )
}
