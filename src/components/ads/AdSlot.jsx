import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ExternalLink } from "lucide-react";

async function fetchAds(placement) {
  const now = new Date().toISOString().split("T")[0];
  const ads = await base44.entities.Ad.filter({ active: true, placement }, "-created_date", 5);
  return ads.filter((ad) => {
    if (ad.start_date && ad.start_date > now) return false;
    if (ad.end_date && ad.end_date < now) return false;
    return true;
  });
}

async function trackImpression(id) {
  const ad = await base44.entities.Ad.filter({ id });
  if (ad[0]) await base44.entities.Ad.update(id, { impression_count: (ad[0].impression_count || 0) + 1 });
}

async function trackClick(id) {
  const ad = await base44.entities.Ad.filter({ id });
  if (ad[0]) await base44.entities.Ad.update(id, { click_count: (ad[0].click_count || 0) + 1 });
}

export default function AdSlot({ placement, className = "" }) {
  const ref = useRef(null);
  const [picked, setPicked] = useState(null);
  const [tracked, setTracked] = useState(false);

  const { data: ads = [] } = useQuery({
    queryKey: ["ads-slot", placement],
    queryFn: () => fetchAds(placement),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (ads.length > 0) {
      const idx = Math.floor(Math.random() * ads.length);
      setPicked(ads[idx]);
    }
  }, [ads]);

  useEffect(() => {
    if (!picked || tracked) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackImpression(picked.id);
          setTracked(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [picked, tracked]);

  if (!picked) return null;

  if (picked.ad_type === "native") {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <span className="absolute top-2 right-2 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-medium">
          Sponsored
        </span>
        <a
          href={picked.redirect_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackClick(picked.id)}
          className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            {picked.image_url && (
              <img src={picked.image_url} alt={picked.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            )}
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-0.5">Sponsored</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">{picked.title}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">{new URL(picked.redirect_url).hostname} <ExternalLink className="w-3 h-3" /></p>
            </div>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <span className="absolute top-1 right-1 z-10 text-[9px] bg-black/40 text-white px-1.5 py-0.5 rounded font-medium">
        Ad
      </span>
      <a
        href={picked.redirect_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackClick(picked.id)}
        className="block rounded-2xl overflow-hidden hover:opacity-95 transition-opacity"
      >
        {picked.image_url ? (
          <img src={picked.image_url} alt={picked.title} className="w-full h-auto object-cover" />
        ) : (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-4 px-6 font-semibold text-sm">
            {picked.title}
          </div>
        )}
      </a>
    </div>
  );
}