'use client'
import { Link } from '@/lib/router-compat'

const POST_TYPE_LABELS = {
  speech_summary: '🎤 Speech Summary',
  policy_explainer: '📋 Policy Explainer',
  party_update: '🏛️ Party Update',
  mla_update: '👤 MLA Update',
  performance_tracker: '📊 Performance Tracker',
  controversy: '⚠️ Controversy',
  bylection: '🗳️ By-Election',
  weekly_digest: '📰 Weekly Digest'
}

export default function TnPoliticsDetailView({ post }) {
  if (!post) return null

  return (
    <div className="politics-detail-page max-w-4xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100">
      <div className="breadcrumb text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:underline">Home</Link> › 
        <Link href="/tn-politics" className="hover:underline">TN Politics</Link> › 
        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
          {post.title_en?.slice(0, 40)}...
        </span>
      </div>

      <div className="post-type-label inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-3">
        {POST_TYPE_LABELS[post.post_type] || post.post_type}
      </div>

      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
        {post.title_en}
      </h1>
      {post.title_ta && (
        <h2 className="title-tamil text-lg sm:text-xl font-bold text-slate-600 dark:text-slate-400 mb-4">
          {post.title_ta}
        </h2>
      )}

      <div className="post-meta-bar flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 py-3 border-y border-slate-200 dark:border-slate-800 mb-6 flex-wrap">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {post.author_name || 'VizhiTN Politics Desk'}
        </span>
        <span>•</span>
        <span>
          {post.created_date ? new Date(post.created_date).toLocaleDateString('en-IN', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          }) : 'Recent'}
        </span>
        {post.civic_receipt_id && (
          <>
            <span>•</span>
            <span className="receipt-id font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {post.civic_receipt_id}
            </span>
          </>
        )}
      </div>

      <div className="post-content english-content space-y-4 text-base leading-relaxed text-slate-800 dark:text-slate-200 mb-8">
        {post.content_en?.split('\n').map((para, i) => (
          para.trim() && <p key={i}>{para}</p>
        ))}
      </div>

      {post.content_ta && (
        <div className="post-content tamil-content space-y-4 text-base leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
            தமிழில் படிக்க
          </h3>
          {post.content_ta?.split('\n').map((para, i) => (
            para.trim() && <p key={i}>{para}</p>
          ))}
        </div>
      )}

      <div className="back-link pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link href="/tn-politics" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to TN Politics
        </Link>
      </div>
    </div>
  )
}
