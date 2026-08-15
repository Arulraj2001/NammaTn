import Link from 'next/link';
import { Building2, MapPin, ShieldCheck, Users, TrendingUp } from 'lucide-react';

function formatGroupType(value) {
  if (!value) return 'Community Group';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function RWADetail({ initialData }) {
  const { group, areaPosts = [], districtPosts = [] } = initialData || {};
  if (!group) return null;

  const recentAreaPosts = areaPosts.length ? areaPosts : districtPosts;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-50">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Community Group
                </div>
                <h1 className="text-2xl font-bold md:text-4xl">{group.group_name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-violet-100">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {group.area_name || group.area_slug || 'Local Area'}
                  </span>
                  <span>•</span>
                  <span>{group.district_name || group.district_slug || 'Tamil Nadu'}</span>
                  <span>•</span>
                  <span>{formatGroupType(group.group_type)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{group.member_count || 0}</div>
                <div className="text-[10px] uppercase tracking-wide text-violet-100">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{group.issue_count || 0}</div>
                <div className="text-[10px] uppercase tracking-wide text-violet-100">Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{group.resolved_count || 0}</div>
                <div className="text-[10px] uppercase tracking-wide text-violet-100">Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About this community</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {group.description ||
                'This verified community group coordinates local civic follow-up, public issue tracking, and resident engagement in their area.'}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Users className="h-4 w-4 text-violet-600" />
                  Community status
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {group.plan ? group.plan.replace('_', ' ') : 'Community'} plan
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  Area coverage
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {group.district_name || 'Tamil Nadu'} • {group.area_name || group.area_slug || 'Local area'}
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick facts</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Group type</span>
                <span className="font-medium text-slate-800 dark:text-white">{formatGroupType(group.group_type)}</span>
              </li>
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>District</span>
                <span className="font-medium text-slate-800 dark:text-white">{group.district_name || group.district_slug || 'Tamil Nadu'}</span>
              </li>
              <li className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Area</span>
                <span className="font-medium text-slate-800 dark:text-white">{group.area_name || group.area_slug || 'Local area'}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Verified</span>
                <span className="font-medium text-emerald-600">Yes</span>
              </li>
            </ul>
          </aside>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent local civic activity</h2>
            <Link href={group.district_slug ? `/district/${group.district_slug}` : '/explore'} className="text-sm font-medium text-violet-600 hover:text-violet-700">
              Explore more
            </Link>
          </div>

          {recentAreaPosts.length > 0 ? (
            <div className="space-y-3">
              {recentAreaPosts.slice(0, 6).map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-800 dark:hover:bg-slate-800/70">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{post.title || 'Public civic report'}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {post.civic_status || 'active'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {post.area_name || post.area_slug || 'Local area'} • {post.district_name || post.district_slug || 'Tamil Nadu'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              No recent local civic reports are available yet for this area.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
