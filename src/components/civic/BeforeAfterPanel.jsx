import React, { useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function PhotoGrid({ photos, onPhotoClick }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((url, i) => (
        <button
          key={i}
          onClick={() => onPhotoClick(url)}
          className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <img
            src={url}
            alt={`Photo ${i + 1}`}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </button>
      ))}
    </div>
  );
}

function PreviewOverlay({ url, onClose }) {
  if (!url) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={url}
        alt="Preview"
        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function BeforeAfterPanel({ beforePhotos = [], afterPhotos = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [preview, setPreview] = useState(null);

  const hasBefore = beforePhotos.length > 0;
  const hasAfter = afterPhotos.length > 0;

  if (!hasBefore && !hasAfter) return null;

  // Single column: only before OR only after
  if (hasBefore && !hasAfter) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <ColumnHeader
          label={T("Evidence — Before", "ஆதாரம் — முன்பு")}
          color="orange"
        />
        <div className="p-4">
          <PhotoGrid photos={beforePhotos} onPhotoClick={setPreview} />
        </div>
        <PreviewOverlay url={preview} onClose={() => setPreview(null)} />
      </div>
    );
  }

  if (!hasBefore && hasAfter) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <ColumnHeader
          label={T("Resolution Proof", "தீர்வு ஆதாரம்")}
          color="green"
        />
        <div className="p-4">
          <PhotoGrid photos={afterPhotos} onPhotoClick={setPreview} />
        </div>
        <PreviewOverlay url={preview} onClose={() => setPreview(null)} />
      </div>
    );
  }

  // Both exist: side-by-side
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Top label */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
          {T("Before & After Comparison", "முன் & பின் ஒப்பீடு")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Before */}
        <div className="border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700">
          <ColumnHeader label={T("Before", "முன்பு")} color="orange" />
          <div className="p-3">
            <PhotoGrid photos={beforePhotos} onPhotoClick={setPreview} />
          </div>
        </div>

        {/* After */}
        <div>
          <ColumnHeader label={T("After", "பின்பு")} color="green" />
          <div className="p-3">
            <PhotoGrid photos={afterPhotos} onPhotoClick={setPreview} />
          </div>
        </div>
      </div>

      <PreviewOverlay url={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function ColumnHeader({ label, color }) {
  const styles = {
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    green:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  };

  return (
    <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border-b ${styles[color]}`}>
      {label}
    </div>
  );
}
