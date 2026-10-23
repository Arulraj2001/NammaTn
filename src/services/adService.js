import { supabase } from "@/api/supabaseClient";

const DEFAULT_ADSENSE_CONFIG = {
  pub_id: "",
  slot_banner: "",
  slot_sidebar: "",
  slot_infeed: "",
  enabled: false,
};

// ─── AdSense Config Persistence ───────────────────────────────────────────────

export async function getAdSenseConfig() {
  // 1. Try fetching from server API (which reads Supabase site_settings)
  try {
    const res = await fetch("/api/admin/adsense", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.config) {
        if (typeof window !== "undefined") {
          localStorage.setItem("VizhiTN_adsense_config", JSON.stringify(data.config));
          if (data.config.pub_id) {
            window.__ADSENSE_PUB_ID__ = data.config.pub_id;
            window.__ADSENSE_SLOTS__ = {
              banner: data.config.slot_banner,
              sidebar: data.config.slot_sidebar,
              infeed: data.config.slot_infeed,
            };
          }
        }
        return data.config;
      }
    }
  } catch (err) {
    // API failed, fallback to direct Supabase or local cache
  }

  // 2. Direct Supabase fallback
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "adsense_config")
      .limit(1)
      .maybeSingle();

    if (data?.value) {
      const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      if (typeof window !== "undefined") {
        localStorage.setItem("VizhiTN_adsense_config", JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    // direct DB query failed
  }

  // 3. Browser localStorage fallback
  try {
    const savedLocal = localStorage.getItem("VizhiTN_adsense_config");
    if (savedLocal) {
      return JSON.parse(savedLocal);
    }
  } catch (e) {
    // fallback
  }

  return DEFAULT_ADSENSE_CONFIG;
}

export async function saveAdSenseConfig(config) {
  // 1. Send to server API to persist in Supabase and sync public/ads.txt
  const res = await fetch("/api/admin/adsense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.error || "Failed to save AdSense settings to database");
  }

  const savedConfig = result.config || config;

  // 2. Cache in localStorage & global window variables
  try {
    localStorage.setItem("VizhiTN_adsense_config", JSON.stringify(savedConfig));
    if (typeof window !== "undefined") {
      window.__ADSENSE_PUB_ID__ = savedConfig.pub_id || "";
      window.__ADSENSE_SLOTS__ = {
        banner: savedConfig.slot_banner,
        sidebar: savedConfig.slot_sidebar,
        infeed: savedConfig.slot_infeed,
      };
    }
  } catch (e) {
    // ignore local storage errors
  }

  return result;
}

// ─── Custom Direct Banner Ads Service ─────────────────────────────────────────

const CUSTOM_ADS_LOCAL_KEY = "VizhiTN_custom_ads";

const DEFAULT_INITIAL_ADS = [
  {
    id: "ad_ostrune_web_dev",
    title: "Ostrune — Sub-Second Web Engineering & SEO",
    description: "Build 100/100 Core Web Vitals Next.js applications with guaranteed Google ranking for Tamil Nadu businesses.",
    target_url: "https://ostrune.netlify.app/",
    image_url: "/banners/ostrune_web_dev.webp?v=v2",
    category: "Featured Web & SEO Partner",
    slot: "sidebar",
    target_page: "all",
    district: "all",
    targeting: "all",
    cta_text: "Get Free Audit",
    status: "active",
    created_at: new Date().toISOString(),
    clicks: 0,
    impressions: 0,
  },
  {
    id: "ad_ostrune_seo",
    title: "Ostrune — Guaranteed Google Top 3 Ranking",
    description: "Drive organic Tamil Nadu traffic and dominate local Google search with high domain authority SEO strategies.",
    image_url: "/banners/ostrune_seo.webp?v=v2",
    target_url: "https://ostrune.netlify.app/",
    category: "Featured SEO Agency",
    slot: "infeed",
    target_page: "all",
    district: "all",
    targeting: "all",
    cta_text: "Boost Ranking",
    status: "active",
    created_at: new Date().toISOString(),
    clicks: 0,
    impressions: 0,
  },
  {
    id: "ad_ostrune_mobile_app",
    title: "Ostrune — Native iOS & Android App Development",
    description: "Transform your business into a high-converting mobile app with real-time push notifications and fast UI.",
    image_url: "/banners/ostrune_mobile_app.webp?v=v2",
    target_url: "https://ostrune.netlify.app/",
    category: "Featured Mobile App Partner",
    slot: "infeed",
    target_page: "all",
    district: "all",
    targeting: "all",
    cta_text: "Build App Now",
    status: "active",
    created_at: new Date().toISOString(),
    clicks: 0,
    impressions: 0,
  },
  {
    id: "ad_ostrune_ecommerce",
    title: "Ostrune — High Conversion E-Commerce Stores",
    description: "Launch your online shop with instant Razorpay/UPI checkout, inventory control, and sub-second loading speed.",
    image_url: "/banners/ostrune_ecommerce.webp?v=v2",
    target_url: "https://ostrune.netlify.app/",
    category: "Featured E-Commerce Partner",
    slot: "banner",
    target_page: "all",
    district: "all",
    targeting: "all",
    cta_text: "Launch Store",
    status: "active",
    created_at: new Date().toISOString(),
    clicks: 0,
    impressions: 0,
  },
  {
    id: "ad_ostrune_uiux",
    title: "Ostrune — Premium Website & UI/UX Redesign",
    description: "Modernize your outdated website into a breathtaking digital experience with high conversion UX design.",
    image_url: "/banners/ostrune_uiux.webp?v=v2",
    target_url: "https://ostrune.netlify.app/",
    category: "Featured UI/UX Agency",
    slot: "home_hero",
    target_page: "all",
    district: "all",
    targeting: "all",
    cta_text: "Redesign Site",
    status: "active",
    created_at: new Date().toISOString(),
    clicks: 0,
    impressions: 0,
  },
  {
    id: "ad_vizhitn_sponsorship_sidebar",
    title: "VizhiTN District Partner — Get 5x Inquiries",
    description: "Sponsor your district on VizhiTN to feature your business at the top of local directory searches.",
    target_url: "/sponsors",
    image_url: "",
    category: "Featured District Sponsor",
    slot: "sidebar_bottom",
    target_page: "all",
    district: "all",
    targeting: "all",
    cta_text: "Sponsor Your District",
    status: "active",
    created_at: new Date().toISOString(),
    clicks: 0,
    impressions: 0,
  }
];

export function getLocalCustomAds() {
  try {
    const saved = localStorage.getItem(CUSTOM_ADS_LOCAL_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(CUSTOM_ADS_LOCAL_KEY, JSON.stringify(DEFAULT_INITIAL_ADS));
    return DEFAULT_INITIAL_ADS;
  } catch {
    return DEFAULT_INITIAL_ADS;
  }
}

export function saveLocalCustomAds(ads, skipEvent = false) {
  try {
    localStorage.setItem(CUSTOM_ADS_LOCAL_KEY, JSON.stringify(ads));
    if (typeof window !== "undefined" && !skipEvent) {
      window.dispatchEvent(new Event("vizhitn_ads_updated"));
    }
  } catch {
    // ignore
  }
}

export function clearAdSystemStorageCache() {
  try {
    localStorage.removeItem(CUSTOM_ADS_LOCAL_KEY);
    localStorage.removeItem("VizhiTN_adsense_config");
    localStorage.setItem(CUSTOM_ADS_LOCAL_KEY, JSON.stringify(DEFAULT_INITIAL_ADS));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vizhitn_ads_updated"));
    }
  } catch {
    // ignore
  }
}

// ─── Ad Collision & Overlap Evaluator ──────────────────────────────────────────

export function checkAdCollision(newAd, existingAds, editingId = null) {
  if (!newAd) return [];
  return (existingAds || []).filter((ad) => {
    if (editingId && ad.id === editingId) return false;
    if (ad.id === newAd.id) return false;
    if (ad.status !== "active") return false;

    // Slot overlap
    const slotOverlap = ad.slot === "all" || newAd.slot === "all" || ad.slot === newAd.slot;
    if (!slotOverlap) return false;

    // District overlap
    const districtOverlap = ad.district === "all" || newAd.district === "all" || ad.district === newAd.district;
    if (!districtOverlap) return false;

    // Page overlap
    const pageOverlap = ad.target_page === "all" || newAd.target_page === "all" || ad.target_page === newAd.target_page;
    if (!pageOverlap) return false;

    // Device overlap
    const deviceOverlap = (ad.targeting || "all") === "all" || (newAd.targeting || "all") === "all" || ad.targeting === newAd.targeting;
    if (!deviceOverlap) return false;

    return true;
  });
}

export async function fetchActiveCustomAds(slot, district, pagePath = "") {
  let localAds = getLocalCustomAds();
  if (!localAds || !Array.isArray(localAds) || localAds.length === 0) {
    localAds = DEFAULT_INITIAL_ADS;
  }
  const now = new Date().toISOString();

  const isMatching = (ad) => {
    if (!ad || ad.status !== "active") return false;
    if (ad.slot && ad.slot !== "all" && ad.slot !== slot) return false;
    if (ad.district && ad.district !== "all" && district && ad.district !== district) return false;
    if (ad.expires_at && new Date(ad.expires_at) < new Date(now)) return false;

    // Page-specific targeting check
    if (ad.target_page && ad.target_page !== "all") {
      if (ad.target_page === "custom" && ad.custom_path) {
        if (pagePath && !pagePath.includes(ad.custom_path)) return false;
      } else if (pagePath) {
        if (ad.target_page === "home" && pagePath !== "/") return false;
        if (ad.target_page === "tn_today" && !pagePath.includes("/tn-today")) return false;
        if (ad.target_page === "explore" && !pagePath.includes("/explore")) return false;
      }
    }

    return true;
  };

  const filteredLocal = localAds.filter(isMatching);
  return filteredLocal;
}

export async function recordCustomAdImpression(adId) {
  if (!adId) return;
  const localAds = getLocalCustomAds();
  const idx = localAds.findIndex((a) => a.id === adId);
  if (idx !== -1) {
    localAds[idx].impressions = (localAds[idx].impressions || 0) + 1;
    saveLocalCustomAds(localAds, true); // true skips dispatching vizhitn_ads_updated event!
  }
}

export async function recordCustomAdClick(adId) {
  if (!adId) return;
  const localAds = getLocalCustomAds();
  const idx = localAds.findIndex((a) => a.id === adId);
  if (idx !== -1) {
    localAds[idx].clicks = (localAds[idx].clicks || 0) + 1;
    saveLocalCustomAds(localAds, true); // true skips dispatching vizhitn_ads_updated event!
  }
}
