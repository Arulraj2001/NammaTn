import React from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getTopDiscussions } from "@/services/trending";

export default function MostDiscussed() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [] } = useQuery({
    queryKey: ["top-discussions-home"],
    queryFn: () => getTopDiscussions(5),
    staleTime: 120_000,
  });

  if (posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            {T("Most Discussed", "அதிகம் விவாதிக்கப்பட்டவை")}
          </h2>
          <Link to="/explore" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {T("More", "மேலும்")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {posts.map((post, i) => (
            <Link key={post.id} to={`/post/${post.id}`} className="flex items-start gap-3 group">
              <span className="text-2xl font-bold text-slate-200 dark:text-slate-700 leading-none w-6 flex-shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {lang === "ta" ? post.title_ta || post.title_en : post.title_en}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{post.district_name}</span>
                  <span className="flex items-center gap-0.5 text-xs text-slate-400">
                    <MessageSquare className="w-3 h-3" />{post.comment_count || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}