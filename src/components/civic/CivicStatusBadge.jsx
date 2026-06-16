import React from "react";
import { getCivicStatus } from "@/lib/civicReceipt";
import { useLanguage } from "@/context/LanguageContext";

export default function CivicStatusBadge({ status, size = "md" }) {
  const { lang } = useLanguage();
  const s = getCivicStatus(status);
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {lang === "ta" ? s.label_ta : s.label}
    </span>
  );
}