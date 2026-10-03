import { notFound, redirect } from 'next/navigation'
import { getPoliticsPost, getPoliticsPosts, getAllMLATrackers } from '@/services/politicsServer'
import TnPoliticsDetailView from '@/views/TnPoliticsDetail'

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const post = await getPoliticsPost(params.slug)
  if (!post) return { title: 'Not Found | VizhiTN' }

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
      publishedTime: post.created_date,
      modifiedTime: post.updated_date
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
