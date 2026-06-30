import React from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { Flame, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { getTrendingPosts } from "@/services/trending";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";

export default function TrendingNow() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["trending-posts-home"],
    queryFn: () => getTrendingPosts(4),
    staleTime: 120_000,
  });

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          {T("Trending Now", "இப்போது டிரெண்டிங்")}
        </h2>
        <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          {T("Dashboard", "டாஷ்போர்டு")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <PostSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}>
          {posts.map(post => (
            <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}