'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, ImageOff } from 'lucide-react';

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % items.length), [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const item = items[current];
  const isVideo = item?.type === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Inner click stops propagation so clicking image/video doesn't close */}
      <div
        className="relative max-w-full max-h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Media */}
        {isVideo ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[80vh] rounded-lg"
          />
        ) : (
          <img
            src={item.url}
            alt={item.caption || `Evidence ${current + 1}`}
            className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
          />
        )}

        {/* Caption */}
        {item?.caption && (
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap max-w-xs truncate">
            {item.caption}
          </p>
        )}
      </div>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {current + 1} / {items.length}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────
function EvidenceThumbnail({ item, onClick }) {
  const [imgError, setImgError] = useState(false);
  const isVideo = item?.type === 'video';
  const thumbUrl = item?.thumbnail_url || item?.url;

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Open ${isVideo ? 'video' : 'photo'} evidence`}
    >
      {!imgError && thumbUrl ? (
        <img
          src={thumbUrl}
          alt={item.caption || 'Evidence'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageOff size={24} className="text-gray-400" />
        </div>
      )}

      {/* Video overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="bg-white/90 rounded-full p-2">
            <Play size={18} className="text-gray-900 ml-0.5" />
          </div>
        </div>
      )}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function EvidenceGallery({ evidence = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
          Evidence
        </h2>
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-600">
          <ImageOff size={32} className="mb-2" />
          <p className="text-sm">No evidence uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
        Evidence
        <span className="ml-2 text-xs font-normal text-gray-400 normal-case">
          ({evidence.length} item{evidence.length !== 1 ? 's' : ''})
        </span>
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {evidence.map((item, idx) => (
          <EvidenceThumbnail
            key={item.id || idx}
            item={item}
            onClick={() => setLightboxIndex(idx)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={evidence}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
