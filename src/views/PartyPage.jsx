'use client'
import { Link } from '@/lib/router-compat'

export default function PartyView({ party, partySlug, posts = [] }) {
  if (!party) return null

  return (
    <div className="party-page max-w-4xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100">
      <div className="breadcrumb text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:underline">Home</Link> › 
        <Link href="/tn-politics" className="hover:underline">TN Politics</Link> › 
        <span className="text-slate-700 dark:text-slate-300 font-semibold">{party.name}</span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white mb-8 border border-slate-800 shadow-md">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 border border-white/20 mb-2">
          {party.name}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{party.fullName}</h1>
        {party.nameTa && <p className="party-name-ta text-base sm:text-lg text-slate-300 mt-1">{party.nameTa}</p>}
      </div>

      <div className="party-posts space-y-4">
        <h2 className="text-xl font-bold tracking-tight mb-4">Latest {party.name} Updates</h2>
        {posts.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            <p>No posts yet for {party.name}. Check back soon.</p>
          </div>
        )}
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/tn-politics/${post.slug || post.id}`}
            className="party-post-item block p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm"
          >
            {post.post_type && (
              <span className="post-type inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-2">
                {post.post_type.replace('_', ' ')}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-bold leading-snug">{post.title_en}</h3>
            {post.seo_description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {post.seo_description}
              </p>
            )}
            <div className="mt-3 pt-2 text-[11px] text-slate-400">
              <span className="post-date">
                {post.created_date ? new Date(post.created_date).toLocaleDateString('en-IN') : 'Recent'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="back-link mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link href="/tn-politics" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to TN Politics
        </Link>
      </div>
    </div>
  )
}
