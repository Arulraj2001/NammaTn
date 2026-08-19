"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight, BarChart2, Eye,
  MousePointerClick, TrendingUp, Sparkles, Megaphone, CheckCircle,
  Star, FileText, Upload, Calendar, Layers, MapPin, Smartphone
} from "lucide-react";
import { AdminTable, AdminTh, AdminTd, AdminTr } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DISTRICTS } from "@/lib/districts";
import {
  getLocalCustomAds,
  saveLocalCustomAds,
  getAdSenseConfig,
  saveAdSenseConfig,
  checkAdCollision
} from "@/services/adService";

const PLACEMENT_OPTIONS = [
  { value: "all", label: "🌐 All Placement Slots (Anywhere on Site)", icon: "✨" },
  { value: "sidebar", label: "📐 Top Sidebar Banner (Slot #1)", icon: "📐" },
  { value: "sidebar_bottom", label: "📐 Bottom Sidebar Banner (Slot #2)", icon: "📌" },
  { value: "infeed", label: "In-Feed (Leaderboard 4:1 / 1200×300)", icon: "📊" },
  { value: "banner", label: "Top / Footer Billboard (16:9)", icon: "🖥️" },
  { value: "home_hero", label: "🌟 Homepage Top Spotlight", icon: "⭐" },
  { value: "article_inline", label: "📰 Inside Article Content (Mid-Story)", icon: "📖" },
  { value: "sticky_footer", label: "📱 Mobile Bottom Sticky Bar", icon: "📲" },
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  target_url: "",
  image_url: "",
  slot: "sidebar",
  target_page: "all",
  custom_path: "",
  district: "all",
  targeting: "all",
  cta_text: "Learn More",
  status: "active",
  expires_at: "",
};

export default function AdminAds() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("direct_ads");
  const [customAds, setCustomAds] = useState(getLocalCustomAds);
  const [dialog, setDialog] = useState(null); // { mode: 'create'|'edit', data }
  const [uploading, setUploading] = useState(false);

  // AdSense Config State
  const [adsense, setAdsense] = useState({
    pub_id: "",
    slot_banner: "",
    slot_sidebar: "",
    slot_infeed: "",
    enabled: false,
  });
  const [adsenseSaved, setAdsenseSaved] = useState(false);

  useEffect(() => {
    getAdSenseConfig().then((cfg) => {
      if (cfg) setAdsense(cfg);
    });
  }, []);

  const saveAdsense = async () => {
    try {
      await saveAdSenseConfig(adsense);
      setAdsenseSaved(true);
      toast({ description: "✅ Google AdSense settings saved & synchronized!" });
      setTimeout(() => setAdsenseSaved(false), 3000);
    } catch {
      toast({ description: "❌ Failed to save AdSense settings." });
    }
  };

  // Metrics calculation
  const totalAds = customAds.length;
  const activeCount = customAds.filter((a) => a.status === "active").length;
  const totalClicks = customAds.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const totalImpressions = customAds.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  // CRUD Handlers
  const handleSaveAd = () => {
    const d = dialog.data;
    if (!d.title?.trim() || !d.target_url?.trim()) {
      toast({ description: "⚠️ Title and Target URL are required." });
      return;
    }

    if (dialog.mode === "edit") {
      const updated = customAds.map((a) => (a.id === d.id ? { ...a, ...d } : a));
      setCustomAds(updated);
      saveLocalCustomAds(updated);
      toast({ description: "✅ Ad updated successfully!" });
    } else {
      const created = {
        ...d,
        id: "ad_" + Date.now(),
        created_at: new Date().toISOString(),
        clicks: 0,
        impressions: 0,
      };
      const updated = [created, ...customAds];
      setCustomAds(updated);
      saveLocalCustomAds(updated);
      toast({ description: "✅ New Direct Ad published!" });
    }
    setDialog(null);
  };

  const handleToggleStatus = (id) => {
    const updated = customAds.map((a) =>
      a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
    );
    setCustomAds(updated);
    saveLocalCustomAds(updated);
    toast({ description: "Ad status updated." });
  };

  const handleDeleteAd = (id) => {
    const updated = customAds.filter((a) => a.id !== id);
    setCustomAds(updated);
    saveLocalCustomAds(updated);
    toast({ description: "Ad campaign removed." });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const rawUrl = evt.target?.result;
      if (!rawUrl) return setUploading(false);

      // Compress image via Canvas to max 800px width/height to guarantee lightweight storage
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
        setDialog((d) => ({ ...d, data: { ...d.data, image_url: compressedDataUrl } }));
        setUploading(false);
        toast({ description: "📷 Image optimized & loaded into banner preview!" });
      };
      img.onerror = () => {
        setDialog((d) => ({ ...d, data: { ...d.data, image_url: rawUrl } }));
        setUploading(false);
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  const setField = (key, val) =>
    setDialog((d) => ({ ...d, data: { ...d.data, [key]: val } }));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            📢 Ad Management & Monetization Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            One single place to manage direct sponsor banners, target placement slots, device rules, and Google AdSense.
          </p>
        </div>

        {activeTab === "direct_ads" && (
          <Button
            onClick={() => setDialog({ mode: "create", data: { ...DEFAULT_FORM } })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> + Create Direct Banner Ad
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("direct_ads")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "direct_ads"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Megaphone className="w-4 h-4" /> Direct Banner Ads & Campaigns ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("adsense")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "adsense"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Star className="w-4 h-4" /> Google AdSense & Auto-Ads Setup
        </button>
      </div>

      {/* ── TAB 1: DIRECT AD BANNERS & CAMPAIGNS ───────────────────────────── */}
      {activeTab === "direct_ads" && (
        <div className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Total Campaigns", value: totalAds, icon: Layers, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { label: "Active Live", value: activeCount, icon: TrendingUp, color: "text-green-600 bg-green-50 border-green-100" },
              { label: "Est. Impressions", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { label: "Avg CTR %", value: `${avgCtr}%`, icon: BarChart2, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            ].map((s) => (
              <div key={s.label} className={`p-4 rounded-2xl border ${s.color} text-center space-y-1`}>
                <s.icon className="w-5 h-5 mx-auto" />
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Direct Ads Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh>Ad Title & Advertiser</AdminTh>
                  <AdminTh>Placement Slot</AdminTh>
                  <AdminTh>District</AdminTh>
                  <AdminTh>Targeting</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh>Clicks / CTR</AdminTh>
                  <AdminTh>Actions</AdminTh>
                </tr>
              </thead>
              <tbody>
                {customAds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      No direct banner ads created yet. Click <strong>+ Create Direct Banner Ad</strong> to add your first ad.
                    </td>
                  </tr>
                ) : (
                  customAds.map((ad) => {
                    const impressions = ad.impressions || 0;
                    const ctr = impressions > 0 ? (((ad.clicks || 0) / impressions) * 100).toFixed(1) : "0.0";
                    const isColliding = ad.status === "active" && checkAdCollision(ad, customAds, ad.id).length > 0;
                    return (
                      <AdminTr key={ad.id}>
                        <AdminTd>
                          <div className="flex items-center gap-3">
                            {ad.image_url ? (
                              <img src={ad.image_url} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className="w-10 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                                AD
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{ad.title}</p>
                                {isColliding && (
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800" title="Overlaps with another active ad on same slot/district/page (will rotate randomly)">
                                    ⚠️ Collision
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{ad.target_url}</p>
                            </div>
                          </div>
                        </AdminTd>
                        <AdminTd>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ad.slot}
                          </span>
                        </AdminTd>
                        <AdminTd>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {ad.district === "all" ? "All Districts" : ad.district}
                          </span>
                        </AdminTd>
                        <AdminTd>
                          <span className="text-xs text-slate-500 capitalize flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" /> {ad.targeting || "all"}
                          </span>
                        </AdminTd>
                        <AdminTd>
                          <button
                            onClick={() => handleToggleStatus(ad.id)}
                            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                              ad.status === "active"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}
                          >
                            {ad.status === "active" ? (
                              <><ToggleRight className="w-4 h-4 text-green-600" /> Active</>
                            ) : (
                              <><ToggleLeft className="w-4 h-4 text-slate-400" /> Paused</>
                            )}
                          </button>
                        </AdminTd>
                        <AdminTd>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{ad.clicks || 0} Clicks</p>
                            <p className="text-[10px] text-slate-400">{ctr}% CTR</p>
                          </div>
                        </AdminTd>
                        <AdminTd>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDialog({ mode: "edit", data: { ...ad } })}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="Edit Ad"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Delete Ad"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </AdminTd>
                      </AdminTr>
                    );
                  })
                )}
              </tbody>
            </AdminTable>
          </div>
        </div>
      )}

      {/* ── TAB 2: GOOGLE ADSENSE SETUP ─────────────────────────────────────── */}
      {activeTab === "adsense" && (
        <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Google AdSense Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your Google AdSense Publisher ID and Ad Slot IDs to show automatic Google network ads.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
              </label>
              <input
                type="text"
                value={adsense.pub_id}
                onChange={(e) => setAdsense((a) => ({ ...a, pub_id: e.target.value.trim() }))}
                placeholder="ca-pub-1234567890123456"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Banner Slot ID</label>
                <input
                  type="text"
                  value={adsense.slot_banner}
                  onChange={(e) => setAdsense((a) => ({ ...a, slot_banner: e.target.value.trim() }))}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Sidebar Slot ID</label>
                <input
                  type="text"
                  value={adsense.slot_sidebar}
                  onChange={(e) => setAdsense((a) => ({ ...a, slot_sidebar: e.target.value.trim() }))}
                  placeholder="0987654321"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">In-Feed Slot ID</label>
                <input
                  type="text"
                  value={adsense.slot_infeed}
                  onChange={(e) => setAdsense((a) => ({ ...a, slot_infeed: e.target.value.trim() }))}
                  placeholder="5678901234"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="enableAdsense"
                checked={adsense.enabled}
                onChange={(e) => setAdsense((a) => ({ ...a, enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="enableAdsense" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                Enable Google AdSense Fallback on Live Site
              </label>
            </div>

            <button
              onClick={saveAdsense}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                adsenseSaved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {adsenseSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Star className="w-4 h-4" /> Save AdSense Settings</>}
            </button>
          </div>
        </div>
      )}

      {/* ── THE 1 UNIFIED AD CREATION / EDIT DIALOG FORM ──────────────────── */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDialog(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {dialog.mode === "create" ? "📢 Create New Banner Campaign" : "✏️ Edit Direct Banner Campaign"}
              </h3>
              <button onClick={() => setDialog(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {/* Real-time Collision Alert Warning Card */}
            {(() => {
              const collisions = checkAdCollision(dialog.data, customAds, dialog.mode === "edit" ? dialog.data.id : null);
              if (collisions.length === 0) return null;
              return (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/80 rounded-xl text-amber-900 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    ⚠️ Slot Collision Warning ({collisions.length} Overlapping Active Campaign{collisions.length > 1 ? "s" : ""})
                  </div>
                  <p className="leading-relaxed text-amber-800/90 dark:text-amber-300">
                    The following active campaign{collisions.length > 1 ? "s" : ""} already target this exact slot, district, and page:
                  </p>
                  <ul className="list-disc list-inside font-semibold space-y-0.5 pt-1">
                    {collisions.map((c) => (
                      <li key={c.id}>
                        <span className="text-slate-900 dark:text-white font-bold">{c.title}</span> — Slot: {c.slot} • District: {c.district === "all" ? "All TN" : c.district} • Page: {c.target_page || "all"}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 italic pt-1">
                    💡 Note: Both campaigns will share this slot and rotate randomly for visitors.
                  </p>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Advertiser / Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dialog.data.title || ""}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Ostrune — Web Engineering & SEO"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dialog.data.target_url || ""}
                  onChange={(e) => setField("target_url", e.target.value)}
                  placeholder="https://ostrune.netlify.app/ or /sponsors"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Placement Slot</label>
                <select
                  value={dialog.data.slot || "sidebar"}
                  onChange={(e) => setField("slot", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {PLACEMENT_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.icon} {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target District</label>
                <select
                  value={dialog.data.district || "all"}
                  onChange={(e) => setField("district", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">🌐 All TN Districts</option>
                  {DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      📍 {d.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Page</label>
                <select
                  value={dialog.data.target_page || "all"}
                  onChange={(e) => setField("target_page", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">🌐 All Pages (Entire Website)</option>
                  <option value="home">🏠 Homepage Only (/)</option>
                  <option value="tn_today">📰 TN Today News Articles (/tn-today)</option>
                  <option value="listings">🏢 Business Directory (/listings)</option>
                  <option value="stay">🏨 Stay & Rooms (/stay)</option>
                  <option value="jobs">💼 Jobs Portal (/jobs)</option>
                  <option value="community">👥 Community Hub (/community)</option>
                  <option value="custom">🎯 Specific Custom Path (URL)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Device</label>
                <select
                  value={dialog.data.targeting || "all"}
                  onChange={(e) => setField("targeting", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">📱💻 All Devices (Mobile & Desktop)</option>
                  <option value="mobile">📱 Mobile Devices Only</option>
                  <option value="desktop">💻 Desktop / Laptop Only</option>
                </select>
              </div>

              {dialog.data.target_page === "custom" && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Specific Custom Path / URL Substring <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dialog.data.custom_path || ""}
                    onChange={(e) => setField("custom_path", e.target.value)}
                    placeholder="e.g. /about or /awareness/article/..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={dialog.data.cta_text || "Learn More"}
                  onChange={(e) => setField("cta_text", e.target.value)}
                  placeholder="e.g. Get Free Audit, Book Call, Open"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ad Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={dialog.data.expires_at || ""}
                  onChange={(e) => setField("expires_at", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Short Subtitle / Description (For Native Card Display)
              </label>
              <textarea
                value={dialog.data.description || ""}
                onChange={(e) => setField("description", e.target.value)}
                rows={2}
                placeholder="e.g. Sub-second Next.js web applications and Google SEO ranking for Tamil Nadu businesses."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Banner Image URL (Paste URL or Upload Image)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dialog.data.image_url || ""}
                  onChange={(e) => setField("image_url", e.target.value)}
                  placeholder="https://.../ostrune_ad_banner.png"
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                  📷 {uploading ? "Uploading..." : "Choose File"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                </label>
              </div>

              {dialog.data.image_url && (
                <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 mb-1">Live Image Preview:</p>
                  <img src={dialog.data.image_url} alt="Ad Preview" className="max-h-36 rounded-lg object-contain" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDialog(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAd}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
              >
                {dialog.mode === "create" ? "+ Create & Publish Ad" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}