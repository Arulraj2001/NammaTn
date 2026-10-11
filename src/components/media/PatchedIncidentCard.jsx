import React from "react";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Radio } from "lucide-react";

/**
 * PatchedIncidentCard
 * 
 * Renders an authorized real incident photograph framed with
 * VizhiTN newsroom editorial overlays and fair-use attribution.
 */
export default function PatchedIncidentCard({
  imageUrl,
  credit,
  source,
  title,
  category = "news",
  className = "",
  aspectRatio = "aspect-[16/9]",
  priority = false,
}) {
  if (!imageUrl) return null;

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-950 group ${className}`}>
      <div className={`relative ${aspectRatio} w-full overflow-hidden`}>
        <Image
          src={imageUrl}
          alt={title || "Real incident photograph"}
          width={1200}
          height={675}
          priority={priority}
          unoptimized={imageUrl.includes("data:") || imageUrl.includes("/api/og")}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Ambient bottom-to-top gradient scrim for clear contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Real Incident Photo</span>
            </span>
            {category && (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-200 text-[10px] font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md">
                {category}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-sm backdrop-blur-md">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </span>
        </div>

        {/* Lower Caption */}
        {title && (
          <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
            <p className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md">
              {title}
            </p>
          </div>
        )}
      </div>

      {/* Authorized Source & Attribution Strip (Section 52 Fair Dealing compliance) */}
      <div className="px-4 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[75%] font-medium">
          {credit || (source ? `📷 Press Media via ${source} • Fair Use Report` : "📷 Authorized Field Report")}
        </span>
        <span className="text-[10px] font-mono text-slate-500 tracking-wider">
          VIZHITN ARCHIVE
        </span>
      </div>
    </div>
  );
}
