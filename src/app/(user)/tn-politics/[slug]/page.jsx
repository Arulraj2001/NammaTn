import { notFound, redirect } from 'next/navigation'
import { getPoliticsPost, getPoliticsPosts, getAllMLATrackers } from '@/services/politicsServer'
import TnPoliticsDetailView from '@/views/TnPoliticsDetail'

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const post = await getPoliticsPost(params.slug)
  if (!post) return { title: 'Not Found | VizhiTN' }

  const SITE_URL = 'https://www.vizhitn.in'
  const ogUrl = new URL(`${SITE_URL}/api/og`)
  ogUrl.searchParams.set('title', post.title_en || post.title || 'Tamil Nadu Politics')
  if (post.title_ta) ogUrl.searchParams.set('title_ta', post.title_ta)
  if (post.district_slug) ogUrl.searchParams.set('district', post.district_slug)
  ogUrl.searchParams.set('category', 'tn-politics')
  ogUrl.searchParams.set('urgency', 'medium')
  if (post.civic_receipt_id) ogUrl.searchParams.set('receipt', post.civic_receipt_id)
  const ogImageUrl = ogUrl.toString()

  return {
    title: post.seo_title || post.title_en,
    description: post.seo_description,
    alternates: {
      canonical: post.canonical_url || 
        `https://www.vizhitn.in/tn-politics/${post.slug || post.id}`
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.seo_title || post.title_en,
      description: post.seo_description,
      url: post.canonical_url,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title_en,
          type: 'image/png'
        }
      ],
      publishedTime: post.created_date,
      modifiedTime: post.updated_date
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title_en,
      description: post.seo_description,
      images: [ogImageUrl]
    }
  }
}

export default async function TnPoliticsDetailPage({ params }) {
  const post = await getPoliticsPost(params.slug)
  if (!post) notFound()

  // UUID redirect to slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(params.slug)
  if (isUUID && post.slug) {
    redirect(`/tn-politics/${post.slug}`)
  }

  // Fetch related articles and MLAs for rich interlinking
  const [allPosts, allMLAs] = await Promise.all([
    getPoliticsPosts({ limit: 8 }),
    getAllMLATrackers()
  ])

  const relatedPosts = (allPosts || [])
    .filter(p => p.id !== post.id && p.slug !== post.slug)
    .slice(0, 5)

  return (
    <TnPoliticsDetailView 
      post={post} 
      relatedPosts={relatedPosts} 
      mlaTrackers={allMLAs || []} 
    />
  )
}
