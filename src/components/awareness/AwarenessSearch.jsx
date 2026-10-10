"use client";

import React, { useMemo } from "react";
import { Search, X, Star, Shield, Globe, HelpCircle, Phone, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@/lib/router-compat";

function matchesQuery(text, query) {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

export default function AwarenessSearch({
  query = "",
  lang = "en",
  schemes = [],
  resources = [],
  guides = [],
  portals = [],
  faqs = [],
  emergencyContacts = [],
  onClose,
}) {
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return null;
    const q = query.trim();

    const filteredSchemes = schemes.filter((s) =>
      matchesQuery(s.name_en, q) || matchesQuery(s.name_ta, q) ||
      matchesQuery(s.category_en, q) || matchesQuery(s.category_ta, q) ||
      matchesQuery(s.description_en, q) || matchesQuery(s.eligibility_en, q)
    );

    const filteredResources = resources.filter((r) =>
      matchesQuery(r.name_en, q) || matchesQuery(r.name_ta, q) ||
      matchesQuery(r.title_en, q) || matchesQuery(r.title_ta, q) ||
      matchesQuery(r.desc_en, q) || matchesQuery(r.desc_ta, q) ||
      matchesQuery(r.content_en, q)
    );

    const filteredGuides = guides.filter((g) =>
      matchesQuery(g.title_en, q) || matchesQuery(g.title_ta, q) ||
      matchesQuery(g.problem_type_en, q)
    );

    const filteredPortals = portals.filter((p) =>
      matchesQuery(p.name_en, q) || matchesQuery(p.name_ta, q) ||
      matchesQuery(p.description_en, q) || matchesQuery(p.category_en, q)
    );

    const filteredFaqs = faqs.filter((f) =>
      matchesQuery(f.question_en, q) || matchesQuery(f.question_ta, q) ||
      matchesQuery(f.answer_en, q)
    );

    const filteredEmergency = emergencyContacts.filter((e) =>
      matchesQuery(e.name_en, q) || matchesQuery(e.name_ta, q) ||
      matchesQuery(e.department_en, q) || matchesQuery(e.number, q) ||
      matchesQuery(e.desc_en, q)
    );

    return {
      schemes: filteredSchemes,
      resources: filteredResources,
      guides: filteredGuides,
      portals: filteredPortals,
      faqs: filteredFaqs,
      emergency: filteredEmergency,
    };
  }, [query, schemes, resources, guides, portals, faqs, emergencyContacts]);

  if (!results) return null;

  const totalResults =
    results.schemes.length +
    results.resources.length +
    results.guides.length +
    results.portals.length +
    results.faqs.length +
    results.emergency.length;

  const renderGroup = (title, icon, items, renderItem) => {
    if (!items.length) return null;
    const IconComp = icon;
    return (
      <div className="mb-6 last:mb-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
          <IconComp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {title}
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.slice(0, 6).map(renderItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 rounded-3xl p-5 sm:p-7 mb-8 shadow-xl shadow-blue-500/5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {T("Live Directory Search Results", "நேரடி தேடல் முடிவுகள்")}
            </h2>
            <p className="text-xs text-slate-500">
              {totalResults} {T("matches for", "முடிவுகள்:")} <span className="font-semibold text-blue-600 dark:text-blue-400">&ldquo;{query}&rdquo;</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close search"
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-10">
          <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            {T(`No matches found for "${query}"`, `"${query}" க்கான முடிவுகள் கிடைக்கவில்லை`)}
          </p>
          <p className="text-xs text-slate-500">
            {T("Try checking spelling, or try words like: ration, power, rti, police, scholarship.", "எழுத்துப் பிழையை சரிபார்க்கவும், அல்லது: ration, 1912, rti, police முயற்சிக்கவும்.")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Emergency 24x7 Contacts first (top priority hot zone) */}
          {renderGroup(
            T("Emergency Contacts & Helplines", "அவசர உதவி எண்கள்"), Phone,
            results.emergency,
            (e) => (
              <div
                key={e.id || e.number}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:border-red-400 transition"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {lang === "ta" ? e.name_ta || e.name_en : e.name_en}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{e.department_en || e.desc_en}</p>
                </div>
                <a
                  href={`tel:${e.number.replace(/[^0-9]/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs rounded-xl shadow-sm whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {e.number}
                </a>
              </div>
            )
          )}

          {/* Welfare Schemes */}
          {renderGroup(
            T("Government Welfare Schemes", "அரசு நலத்திட்டங்கள்"), Star,
            results.schemes,
            (s) => (
              <Link
                key={s.id || s.slug}
                href={`/awareness/scheme/${s.slug || s.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:shadow-sm transition group"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                    {lang === "ta" ? s.category_ta || s.category_en : s.category_en}
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {lang === "ta" ? s.name_ta || s.name_en : s.name_en}
                  </p>
                  {s.financial_benefit_en && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                      💰 {lang === "ta" ? s.financial_benefit_ta || s.financial_benefit_en : s.financial_benefit_en}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
              </Link>
            )
          )}

          {/* Citizen Rights */}
          {renderGroup(
            T("Citizen Statutory Rights", "குடிமக்கள் சட்ட உரிமைகள்"), Shield,
            results.resources,
            (r) => (
              <Link
                key={r.id || r.slug}
                href={`/awareness/right/${r.slug || r.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:shadow-sm transition group"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                    {r.badge_en || T("Statutory Right", "சட்ட உரிமை")}
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {lang === "ta" ? r.name_ta || r.name_en : r.name_en}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{lang === "ta" ? r.desc_ta : r.desc_en}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
              </Link>
            )
          )}

          {/* Procedural Guides */}
          {renderGroup(
            T("Civic Action Guides", "வழிகாட்டிகள்"), FileText,
            results.guides,
            (g) => (
              <Link
                key={g.id || g.slug}
                href={`/awareness/guide/${g.slug || g.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:shadow-sm transition group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                    {lang === "ta" ? g.title_ta || g.title_en : g.title_en}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{g.department_en}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
              </Link>
            )
          )}

          {/* Official Portals */}
          {renderGroup(
            T("Official Government Portals", "அரசு இணையதளங்கள்"), Globe,
            results.portals,
            (p) => (
              <Link
                key={p.id || p.slug}
                href={`/awareness/portal/${p.slug || p.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:shadow-sm transition group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                    {lang === "ta" ? p.name_ta || p.name_en : p.name_en}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{p.url}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition flex-shrink-0" />
              </Link>
            )
          )}

          {/* Citizen FAQs */}
          {renderGroup(
            T("Citizen FAQs", "அடிக்கடி கேட்கப்படும் கேள்விகள்"), HelpCircle,
            results.faqs,
            (f) => (
              <Link
                key={f.id || f.slug}
                href={`/awareness/faq/${f.slug || f.id}`}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:shadow-sm transition block group"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600">
                  {lang === "ta" ? f.question_ta || f.question_en : f.question_en}
                </p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {lang === "ta" ? f.answer_ta || f.answer_en : f.answer_en}
                </p>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
