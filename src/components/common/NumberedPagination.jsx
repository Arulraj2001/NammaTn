"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "...", totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }
  return pages;
}

export default function NumberedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  scrollTargetId,
  itemLabel = "items"
}) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handleSelect = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (scrollTargetId) {
      const el = document.getElementById(scrollTargetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {T(
          `Showing ${startIndex + 1}–${endIndex} of ${totalItems} ${itemLabel}`,
          `மொத்தம் ${totalItems} பதிவுகளில் ${startIndex + 1}–${endIndex} காட்டப்படுகிறது`
        )}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => handleSelect(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{T("Prev", "முந்தைய")}</span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handleSelect(page)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                currentPage === page
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => handleSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span>{T("Next", "அடுத்தது")}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
