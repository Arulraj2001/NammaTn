"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, FileText, Building, CheckCircle2, ExternalLink, ArrowLeft, MessageCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import FormattedArticleContent from "@/components/awareness/FormattedArticleContent";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import RtiDraftGenerator from "@/components/tools/RtiDraftGenerator";

export default function AwarenessRightDetail({ right }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  if (!right) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {T("Right detail not found", "விவரங்கள் கிடைக்கவில்லை")}
        </h2>
        <Link href="/awareness/rights" className="mt-4 inline-block text-sm text-blue-600 font-semibold">
          ← {T("Back to Citizen Rights", "குடிமக்கள் உரிமைகளுக்குத் திரும்பவும்")}
        </Link>
      </div>
    );
  }

  const handleWhatsAppShare = () => {
    const title = lang === "ta" ? right.name_ta : right.name_en;
    const desc = lang === "ta" ? right.desc_ta : right.desc_en;
    const url = typeof window !== "undefined" ? window.location.href : "https://www.vizhitn.in/awareness/rights";
    const msg = `⚖️ *${title}*\n\n🛡️ *${T("Your Legal Rights in Tamil Nadu:", "தமிழ்நாட்டில் உங்கள் சட்டப்பூர்வ உரிமைகள்:")}*\n${desc}\n\n📄 *${T("Read Full Statutory Rules & Penalty Guide:", "முழு சட்ட விதிகள் மற்றும் வழிகாட்டி:")}*\n${url}\n\n_Via VizhiTN Civic Transparency Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-24 sm:pb-16">
      <AwarenessSubNav activePath="/awareness/rights" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Breadcrumb back & WhatsApp Action */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/awareness/rights"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{T("Back to Citizen Rights", "குடிமக்கள் உரிமைகள் பக்கத்திற்கு")}</span>
          </Link>
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}</span>
          </button>
        </div>

        {/* 2-Column Grid: Content on Left (col-8), Right Sidebar Links on Right (col-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8 space-y-6">
            {right.image_url && (
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-900">
                <Image
                  src={right.image_url}
                  alt={lang === "ta" ? right.name_ta : right.name_en}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
            )}
            
            {/* Primary Legal Information Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">
                    {T("Statutory Right & Legal Protection", "சட்டப்பூர்வ குடிமக்கள் உரிமை")}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 leading-tight">
                    {T(right.name_en, right.name_ta)}
                  </h1>
                </div>
              </div>

              <p className="mt-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {T(right.desc_en, right.desc_ta)}
              </p>

              {/* Statutory Overview */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {T("Detailed Statutory Overview", "சட்டப்பூர்வ விரிவான விளக்கம்")}
                  </h3>
                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <FormattedArticleContent content={T(right.content_en, right.content_ta)} />
                  </div>
                </div>

                {/* Key Legal Provisions Grid */}
                {right.key_points_en && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      {T("Key Statutory Rules & Provisions", "முக்கிய சட்ட விதிகள் & பாதுகாப்பு")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(lang === "ta" ? right.key_points_ta : right.key_points_en).map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsible Department & Portal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    {T("Responsible Department", "பொறுப்பான துறை")}: <strong className="text-slate-800 dark:text-slate-200">{T(right.department_en, right.department_ta)}</strong>
                  </span>
                  {right.portal_url && (
                    <a
                      href={right.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm self-start sm:self-auto"
                    >
                      <span>{T("Open Government Portal", "அரசு தளம் திற")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Defense Shield Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-3xl p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300">
                    {T("Rights Denied or Official Extortion?", "உரிமை மறுக்கப்பட்டதா அல்லது லஞ்சம் கேட்கப்பட்டதா?")}
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                    {T(
                      "In Tamil Nadu, no public officer can withhold statutory services or demand unauthorized speed money. If your application is rejected without written reasons or an officer demands a bribe, file an anonymous complaint on DVAC Helpline (1064) or document proof on VizhiTN.",
                      "தமிழ்நாட்டில் எந்தவொரு அரசு அதிகாரியும் காரணமின்றி சேவையை மறுக்கவோ லஞ்சம் கோரவோ முடியாது. லஞ்சம் கேட்கப்பட்டால் DVAC உதவி எண் 1064 ஐ அழைக்கலாம் அல்லது VizhiTN தளத்தில் ஆதாரத்துடன் புகாரளிக்கலாம்."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* If RTI: Draft Generator */}
            {right.slug === "right-to-information-act-2005" && (
              <div className="mt-8">
                <RtiDraftGenerator />
              </div>
            )}
          </main>

          {/* Right-Side Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 space-y-6">
            <SidebarRelatedLinks
              type="right"
              currentSlug={right.slug}
            />
          </aside>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="right-detail" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-lg flex items-center gap-2">
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}</span>
        </button>
        {right.portal_url && (
          <a
            href={right.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm"
          >
            <span>{T("Official Portal", "அரசு தளம்")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
