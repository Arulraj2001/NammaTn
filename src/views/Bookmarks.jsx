import React, { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { Bookmark, Trash2, ArrowRight, BookmarkX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { getBookmarks, removeBookmark } from "@/services/bookmarks";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/AuthContext";

const TYPE_COLORS = {
  complaint: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  appreciation: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  alert: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  local_update: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  discussion: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
};

export default function Bookmarks() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [bookmarks, setBookmarks] = useState([]);
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
      return;
    }
    setBookmarks(getBookmarks());
  }, [isAuthenticated, isLoadingAuth]);

  const handleRemove = (id) => {
    removeBookmark(id);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {T("Saved Posts", "சேமித்த பதிவுகள்")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{bookmarks.length} {T("items saved", "உருப்படிகள் சேமிக்கப்பட்டன")}</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <BookmarkX className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {T("No saved posts yet. Bookmark posts to read them later.", "இன்னும் சேமிக்கப்பட்ட பதிவுகள் இல்லை.")}
          </p>
          <Link to="/explore" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            {T("Explore Posts", "பதிவுகளை ஆராயுங்கள்")} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {bookmarks.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[b.post_type] || "bg-slate-100 text-slate-600"}`}>
                      {b.post_type?.replace("_", " ")}
                    </span>
                    {b.district_name && (
                      <span className="text-xs text-slate-400">{b.district_name}</span>
                    )}
                  </div>
                  <Link to={`/post/${b.id}`} className="block">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                      {lang === "ta" ? b.title_ta || b.title_en : b.title_en}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 mt-1">
                    {T("Saved", "சேமித்தது")} {b.saved_at ? formatDistanceToNow(new Date(b.saved_at), { addSuffix: true }) : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(b.id)}
                  className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title={T("Remove bookmark", "புக்மார்க்கை நீக்கு")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}