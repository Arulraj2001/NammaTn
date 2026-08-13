import React from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryPosts } from "@/services/posts";
import { ArrowRight } from "lucide-react";

export default function RelatedPosts({ post, limit = 3 }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [] } = useQuery({
    queryKey: ["category-posts", post.category_slug],
    queryFn: () => getCategoryPosts(post.category_slug, 10),
    enabled: !!post.category_slug,
    staleTime: 120_000,
  });

  const related = posts.filter((p) => p.id !== post.id).slice(0, limit);
  if (related.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5">
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">{T("Related Posts", "தொடர்புடைய பதிவுகள்")}</h3>
      <div className="space-y-3">
        {related.map((p) => (
          <Link
            key={p.id}
            to={`/post/${p.id}`}
            className="flex items-start gap-3 group hover:bg-slate-100/80 dark:hover:bg-slate-700 rounded-xl p-2 -mx-2 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                {lang === "ta" ? (p.title_ta || p.title_en) : p.title_en}
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{p.district_name} • {p.upvotes || 0} upvotes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}