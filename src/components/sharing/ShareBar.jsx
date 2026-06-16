import React, { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function buildShareText(post, lang) {
  const title = lang === "ta" ? (post.title_ta || post.title_en) : post.title_en;
  return `${title} | TN Voice`;
}

export default function ShareBar({ post, lang = "en", compact = false }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = `${window.location.origin}/post/${post.id}`;
  const text = buildShareText(post, lang);

  const shareLinks = [
    {
      label: "WhatsApp",
      icon: "💬",
      color: "bg-green-500 hover:bg-green-600",
      href: `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`,
    },
    {
      label: "Telegram",
      icon: "✈️",
      color: "bg-sky-500 hover:bg-sky-600",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      label: "X / Twitter",
      icon: "𝕏",
      color: "bg-slate-800 hover:bg-slate-900",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Facebook",
      icon: "f",
      color: "bg-blue-600 hover:bg-blue-700",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 min-w-[200px]"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Share</p>
              <div className="space-y-1">
                {shareLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-sm font-bold w-5 text-center">{s.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{s.label}</span>
                  </a>
                ))}
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-slate-500" />}
                  <span className="text-sm text-slate-700 dark:text-slate-300">{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400 font-medium">Share:</span>
      {shareLinks.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${s.color} text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1`}
          title={s.label}
        >
          <span>{s.icon}</span>
          <span className="hidden sm:inline">{s.label}</span>
        </a>
      ))}
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}