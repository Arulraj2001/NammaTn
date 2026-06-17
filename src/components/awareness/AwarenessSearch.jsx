import React, { useMemo } from "react";
import { Search, X, Star, Shield, Globe, HelpCircle, Phone, FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";

const getIcon = (name) => LucideIcons[name] || LucideIcons.Info;

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
  const T = (en, ta) => lang === "ta" ? ta : en;

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return null;
    const q = query.trim();

    const filteredSchemes = schemes.filter((s) =>
      matchesQuery(s.name_en, q) || matchesQuery(s.name_ta, q) ||
      matchesQuery(s.category_en, q) || matchesQuery(s.description_en, q)
    );

    const filteredResources = resources.filter((r) =>
      matchesQuery(r.title_en, q) || matchesQuery(r.title_ta, q) ||
      matchesQuery(r.description_en, q)
    );

    const filteredGuides = guides.filter((g) =>
      matchesQuery(g.title_en, q) || matchesQuery(g.title_ta, q)
    );

    const filteredPortals = portals.filter((p) =>
      matchesQuery(p.name_en, q) || matchesQuery(p.name_ta, q) ||
      matchesQuery(p.description_en, q)
    );

    const filteredFaqs = faqs.filter((f) =>
      matchesQuery(f.question_en, q) || matchesQuery(f.question_ta, q) ||
      matchesQuery(f.answer_en, q)
    );

    const filteredEmergency = emergencyContacts.filter((e) =>
      matchesQuery(e.department_en, q) || matchesQuery(e.department_ta, q) ||
      matchesQuery(e.number, q)
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
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <IconComp className="w-4 h-4" />
          {title}
          <span className="text-xs text-slate-400 font-normal">({items.length})</span>
        </h3>
        <div className="space-y-2">
          {items.slice(0, 5).map(renderItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-white">
            {T("Search Results", "தேடல் முடிவுகள்")}
          </span>
          <span className="text-xs text-slate-400">
            ({totalResults} {T("found", "கண்டறியப்பட்டது")})
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {totalResults === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
          {T(
            `No results found for "${query}". Try different keywords.`,
            `"${query}" க்கான முடிவுகள் இல்லை. வேறு சொற்களை முயற்சிக்கவும்.`
          )}
        </p>
      ) : (
        <>
          {renderGroup(
            T("Schemes", "திட்டங்கள்"), Star,
            results.schemes,
            (s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  {(() => { const I = getIcon(s.icon); return <I className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {lang === "ta" ? s.name_ta || s.name_en : s.name_en}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {lang === "ta" ? s.category_ta || s.category_en : s.category_en}
                  </p>
                </div>
              </div>
            )
          )}

          {renderGroup(
            T("Resources", "வளங்கள்"), Shield,
            results.resources,
            (r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  {(() => { const I = getIcon(r.icon); return <I className="w-4 h-4 text-blue-600 dark:text-blue-400" />; })()}
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {lang === "ta" ? r.title_ta || r.title_en : r.title_en}
                </p>
              </div>
            )
          )}

          {renderGroup(
            T("Guides", "வழிகாட்டிகள்"), FileText,
            results.guides,
            (g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  {(() => { const I = getIcon(g.icon); return <I className="w-4 h-4 text-amber-600 dark:text-amber-400" />; })()}
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {lang === "ta" ? g.title_ta || g.title_en : g.title_en}
                </p>
              </div>
            )
          )}

          {renderGroup(
            T("Portals", "இணையதளங்கள்"), Globe,
            results.portals,
            (p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  {(() => { const I = getIcon(p.icon); return <I className="w-4 h-4 text-green-600 dark:text-green-400" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {lang === "ta" ? p.name_ta || p.name_en : p.name_en}
                  </p>
                </div>
              </div>
            )
          )}

          {renderGroup(
            T("FAQs", "கேள்விகள்"), HelpCircle,
            results.faqs,
            (f) => (
              <div key={f.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {lang === "ta" ? f.question_ta || f.question_en : f.question_en}
                </p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {lang === "ta" ? f.answer_ta || f.answer_en : f.answer_en}
                </p>
              </div>
            )
          )}

          {renderGroup(
            T("Emergency Contacts", "அவசர தொடர்புகள்"), Phone,
            results.emergency,
            (e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {lang === "ta" ? e.department_ta || e.department_en : e.department_en}
                  </p>
                  <p className="text-xs text-slate-400">{e.number}</p>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
