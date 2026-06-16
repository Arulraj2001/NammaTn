import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { addBookmark, removeBookmark, isBookmarked } from "@/services/bookmarks";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

export default function BookmarkButton({ post, className = "" }) {
  const [saved, setSaved] = useState(false);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  useEffect(() => {
    setSaved(isBookmarked(post.id));
  }, [post.id]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      requireAuth(() => {}, "Sign in to save posts");
      return;
    }
    if (saved) {
      removeBookmark(post.id);
    } else {
      addBookmark(post);
    }
    setSaved(!saved);
  };

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg transition-colors ${
        saved
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      } ${className}`}
      title={saved ? "Remove bookmark" : "Save post"}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  );
}