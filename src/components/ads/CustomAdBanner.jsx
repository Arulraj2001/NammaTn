"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { ExternalLink, Sparkles, Megaphone, X } from "lucide-react";
import { fetchActiveCustomAds, recordCustomAdClick, recordCustomAdImpression, getAdSenseConfig } from "@/services/adService";

export default function CustomAdBanner({ slot = "sidebar", district, fallbackType = "sponsorship" }) {
  const [activeAd, setActiveAd] = useState(null);
  const [adsenseConfig, setAdsenseConfig] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadAd = async (isInitial = true) => {
    setImageError(false);
    const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
    const ads = await fetchActiveCustomAds(slot, district, pagePath);
    if (ads && ads.length > 0) {
      const chosen = ads[Math.floor(Math.random() * ads.length)];
      setActiveAd(chosen);
      if (chosen?.id && isInitial) {
        recordCustomAdImpression(chosen.id);
      }
    } else {
      setActiveAd(null);
      const config = await getAdSenseConfig();
      setAdsenseConfig(config);
    }
  };

  useEffect(() => {
    loadAd(true);

    const handleAdUpdate = () => {
      loadAd(false);
    };

    window.addEventListener("vizhitn_ads_updated", handleAdUpdate);
    window.addEventListener("storage", handleAdUpdate);

    return () => {
      window.removeEventListener("vizhitn_ads_updated", handleAdUpdate);
      window.removeEventListener("storage", handleAdUpdate);
    };
  }, [slot, district]);

  if (dismissed) return null;

  const handleClick = (ad) => {
    if (ad?.id) {
      recordCustomAdClick(ad.id);
    }
  };

  // ── Render Custom Active Direct Ad Banner ──────────────────────────────────
  if (activeAd) {
    const isExternal = activeAd.target_url?.startsWith("http");

    // Special layout for mobile sticky footer banner
    if (slot === "sticky_footer") {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t-2 border-amber-400 p-2.5 shadow-2xl flex items-center justify-between gap-3">
          <a
            href={activeAd.target_url || "#"}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            onClick={() => handleClick(activeAd)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            {activeAd.image_url && !imageError ? (
              <img
                src={activeAd.image_url}
                alt=""
                onError={() => setImageError(true)}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0">
                AD
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{activeAd.title}</p>
              <p className="text-[11px] text-amber-300 truncate">{activeAd.description || activeAd.cta_text || "Learn More"}</p>
            </div>
          </a>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={activeAd.target_url || "#"}
              target={isExternal ? "_blank" : "_self"}
              onClick={() => handleClick(activeAd)}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-2xs whitespace-nowrap"
            >
              {activeAd.cta_text || "Open"}
            </a>
            <button onClick={() => setDismissed(true)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    const hasValidImage = activeAd.image_url && !imageError;

    return (
      <div className="my-4 relative overflow-hidden rounded-2xl border-2 border-amber-400 dark:border-amber-500/60 shadow-md group bg-slate-900 text-white">
        <span className="absolute top-2 right-2 z-10 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Sponsored
        </span>

        <a
          href={activeAd.target_url || "#"}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noopener noreferrer" : ""}
          onClick={() => handleClick(activeAd)}
          className="block group relative"
        >
          {hasValidImage ? (
            <div className="relative overflow-hidden">
              <img
                src={activeAd.image_url}
                alt={activeAd.title || "Advertisement"}
                className={`w-full ${
                  slot === "sidebar" || slot === "sidebar_bottom"
                    ? "h-44 sm:h-48 object-cover object-center"
                    : "h-auto max-h-[320px] object-cover object-center"
                } group-hover:scale-102 transition-transform duration-500`}
                onError={() => setImageError(true)}
              />
              {activeAd.cta_text && (
                <div className="p-3 bg-slate-900/95 backdrop-blur-xs border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{activeAd.title}</p>
                    {activeAd.description && (
                      <p className="text-[11px] text-slate-300 truncate">{activeAd.description}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg shadow-xs group-hover:bg-amber-400 transition-colors flex-shrink-0">
                    {activeAd.cta_text} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
                <Megaphone className="w-4 h-4" /> {activeAd.category || "Featured Partner"}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug group-hover:text-amber-300 transition-colors mb-1.5">
                {activeAd.title}
              </h3>
              {activeAd.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {activeAd.description}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-xs group-hover:bg-amber-400 transition-colors">
                {activeAd.cta_text || "Learn More"} <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </a>
      </div>
    );
  }

  // ── Render AdSense Slot fallback if configured ──────────────────────────────
  if (adsenseConfig?.enabled && adsenseConfig?.pub_id) {
    const slotId = adsenseConfig[`slot_${slot}`] || adsenseConfig.slot_banner;
    if (slotId) {
      return (
        <div className="my-4 min-h-[90px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adsenseConfig.pub_id}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      );
    }
  }

  // ── Render Default VizhiTN Sponsor CTA Fallback ─────────────────────────────
  if (fallbackType === "sponsorship") {
    return (
      <div className="my-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-4 sm:p-5 text-white border-2 border-blue-400/80 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 bg-white/20 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full mb-2">
              📢 Promote Your Business
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight mb-1">
              Get 5x More Inquiries in Your District on VizhiTN
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-3">
              Feature your shop, PG room, clinic, or service at the top of local listings across Tamil Nadu.
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              Sponsor Your District →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
