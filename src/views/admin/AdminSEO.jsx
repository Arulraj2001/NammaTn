import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettingsMap, saveSettingsGroup } from "@/services/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Save, Search, Globe, ExternalLink, CheckCircle2, Copy,
  AlertTriangle, RefreshCw, FileCode, Link2, Languages, Shield,
  BarChart3, Rss, ChevronDown, ChevronRight, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tab definitions ────────────────────────────────────────────────────────

const TABS = [
  { id: "webmaster", label: "Webmaster Tools", icon: Search },
  { id: "hreflang", label: "Hreflang / i18n", icon: Languages },
  { id: "structured", label: "Structured Data", icon: FileCode },
  { id: "advanced", label: "Advanced SEO", icon: BarChart3 },
  { id: "robots", label: "Robots & Sitemap", icon: Shield },
];

// ─── Webmaster Tools config ─────────────────────────────────────────────────

const WEBMASTER_TOOLS = [
  {
    id: "google",
    name: "Google Search Console",
    color: "from-blue-500 to-green-500",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600",
    logo: "G",
    settingKey: "seo_google_verification",
    verifyUrl: "https://search.google.com/search-console",
    helpText: "Paste the content value from the HTML tag verification method.",
    placeholder: "e.g. abc123xyz...",
    metaName: "google-site-verification",
    docLink: "https://support.google.com/webmasters/answer/9008080",
    badge: "Free",
  },
  {
    id: "bing",
    name: "Bing Webmaster Tools",
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-50 dark:bg-cyan-900/20",
    iconColor: "text-cyan-600",
    logo: "B",
    settingKey: "seo_bing_verification",
    verifyUrl: "https://www.bing.com/webmasters",
    helpText: "Copy the content value from Bing's HTML meta tag verification.",
    placeholder: "e.g. 1234ABCD...",
    metaName: "msvalidate.01",
    docLink: "https://www.bing.com/webmasters/help/how-to-verify-ownership-of-your-site-afcfefc6",
    badge: "Free",
  },
  {
    id: "yandex",
    name: "Yandex Webmaster",
    color: "from-red-500 to-orange-500",
    iconBg: "bg-red-50 dark:bg-red-900/20",
    iconColor: "text-red-600",
    logo: "Y",
    settingKey: "seo_yandex_verification",
    verifyUrl: "https://webmaster.yandex.com",
    helpText: "Use the meta tag verification code from Yandex Webmaster.",
    placeholder: "e.g. abcd1234efgh...",
    metaName: "yandex-verification",
    docLink: "https://yandex.com/support/webmaster/service/rights.html",
    badge: "Free",
  },
  {
    id: "baidu",
    name: "Baidu Webmaster",
    color: "from-blue-600 to-indigo-700",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600",
    logo: "百",
    settingKey: "seo_baidu_verification",
    verifyUrl: "https://ziyuan.baidu.com",
    helpText: "Paste the Baidu meta verification content value.",
    placeholder: "e.g. code-1234...",
    metaName: "baidu-site-verification",
    docLink: "https://ziyuan.baidu.com/site/index",
    badge: "China",
  },
  {
    id: "pinterest",
    name: "Pinterest Site Claim",
    color: "from-red-600 to-pink-600",
    iconBg: "bg-pink-50 dark:bg-pink-900/20",
    iconColor: "text-pink-600",
    logo: "P",
    settingKey: "seo_pinterest_verification",
    verifyUrl: "https://pinterest.com/settings/claim",
    helpText: "Paste the Pinterest meta tag content value.",
    placeholder: "e.g. abc1234...",
    metaName: "p:domain_verify",
    docLink: "https://help.pinterest.com/en/business/article/claim-your-website",
    badge: "Social",
  },
  {
    id: "norton",
    name: "Norton Safe Web",
    color: "from-yellow-500 to-amber-600",
    iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
    iconColor: "text-yellow-600",
    logo: "N",
    settingKey: "seo_norton_verification",
    verifyUrl: "https://safeweb.norton.com",
    helpText: "Paste the Norton Safe Web verification code.",
    placeholder: "e.g. nortoncode...",
    metaName: "norton-safeweb-site-verification",
    docLink: "https://safeweb.norton.com",
    badge: "Trust",
  },
  {
    id: "alexa",
    name: "Alexa / Amazon",
    color: "from-slate-500 to-slate-700",
    iconBg: "bg-slate-50 dark:bg-slate-800",
    iconColor: "text-slate-600",
    logo: "A",
    settingKey: "seo_alexa_verification",
    verifyUrl: "https://www.alexa.com/siteinfo",
    helpText: "Paste the Alexa site verification meta tag content.",
    placeholder: "e.g. alexa-verify...",
    metaName: "alexaVerifyID",
    docLink: "https://www.alexa.com",
    badge: "Analytics",
  },
];

// ─── Hreflang definitions ───────────────────────────────────────────────────

const HREFLANG_LOCALES = [
  { code: "en-IN", label: "English (India)", key: "hreflang_en_in" },
  { code: "ta-IN", label: "Tamil (India)", key: "hreflang_ta_in" },
  { code: "hi-IN", label: "Hindi (India)", key: "hreflang_hi_in" },
  { code: "x-default", label: "Default (x-default)", key: "hreflang_default" },
];

// ─── Advanced SEO fields ────────────────────────────────────────────────────

const ADVANCED_FIELDS = [
  {
    group: "🔍 Core Meta",
    fields: [
      { key: "seo_meta_keywords", label: "Meta Keywords (comma-separated)", placeholder: "Tamil Nadu, civic, community, NammaTN234", type: "text" },
      { key: "seo_author", label: "Site Author / Publisher Name", placeholder: "NammaTN234 Team" },
      { key: "seo_copyright", label: "Copyright Text", placeholder: "© 2025 NammaTN234. All rights reserved." },
      { key: "seo_language", label: "Content Language", placeholder: "en-IN" },
      { key: "seo_geo_region", label: "Geo Region", placeholder: "IN-TN" },
      { key: "seo_geo_placename", label: "Geo Place Name", placeholder: "Tamil Nadu, India" },
      { key: "seo_geo_position", label: "Geo Position (lat;lon)", placeholder: "11.1271;78.6569" },
    ],
  },
  {
    group: "📱 Open Graph / Social",
    fields: [
      { key: "seo_og_type", label: "OG Type", placeholder: "website" },
      { key: "seo_og_site_name", label: "OG Site Name", placeholder: "NammaTN234" },
      { key: "seo_og_locale", label: "OG Locale", placeholder: "en_IN" },
      { key: "seo_og_locale_alt", label: "OG Alternate Locale", placeholder: "ta_IN" },
      { key: "seo_twitter_site", label: "Twitter @Site Handle", placeholder: "@nammatn234official" },
      { key: "seo_twitter_creator", label: "Twitter @Creator Handle", placeholder: "@nammatn234" },
      { key: "seo_twitter_card", label: "Twitter Card Type", placeholder: "summary_large_image" },
      { key: "seo_fb_app_id", label: "Facebook App ID", placeholder: "123456789" },
    ],
  },
  {
    group: "📊 Analytics & Tracking",
    fields: [
      { key: "seo_ga4_id", label: "Google Analytics 4 Measurement ID", placeholder: "G-XXXXXXXXXX" },
      { key: "seo_gtm_id", label: "Google Tag Manager Container ID", placeholder: "GTM-XXXXXXX" },
      { key: "seo_clarity_id", label: "Microsoft Clarity Project ID", placeholder: "abc123xyz" },
      { key: "seo_hotjar_id", label: "Hotjar Site ID", placeholder: "1234567" },
      { key: "seo_fb_pixel_id", label: "Meta Pixel (Facebook) ID", placeholder: "123456789012345" },
    ],
  },
  {
    group: "⚡ Performance & PWA",
    fields: [
      { key: "seo_theme_color", label: "Theme Color (PWA / browser)", placeholder: "#2563eb" },
      { key: "seo_apple_touch_icon", label: "Apple Touch Icon URL", placeholder: "https://nammatn234234.in/apple-touch-icon.png" },
      { key: "seo_manifest_url", label: "Web Manifest URL", placeholder: "/manifest.json" },
    ],
  },
];

// ─── Structured Data settings ───────────────────────────────────────────────

const STRUCTURED_DATA_FIELDS = [
  { key: "sd_org_name", label: "Organization Name", placeholder: "NammaTN234" },
  { key: "sd_org_url", label: "Organization URL", placeholder: "https://nammatn234234.in" },
  { key: "sd_org_logo", label: "Organization Logo URL", placeholder: "https://nammatn234234.in/logo.png" },
  { key: "sd_org_phone", label: "Contact Phone", placeholder: "+91 XXXXX XXXXX" },
  { key: "sd_org_email", label: "Contact Email", placeholder: "hello@nammatn234234.in" },
  { key: "sd_social_profiles", label: "Social Profile URLs (one per line)", placeholder: "https://twitter.com/nammatn234\nhttps://facebook.com/nammatn234", multiline: true },
  { key: "sd_searchbox_enabled", label: "Enable Sitelinks Searchbox (true/false)", placeholder: "true" },
  { key: "sd_breadcrumb_enabled", label: "Enable Breadcrumbs Schema (true/false)", placeholder: "true" },
  { key: "sd_article_publisher", label: "Article Publisher URL", placeholder: "https://nammatn234234.in" },
];

// ─── Helper Components ───────────────────────────────────────────────────────

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={cn("bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5", className)}>
      {title && <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">{title}</h3>}
      {children}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  );
}

function StatusDot({ active }) {
  return (
    <span className={cn("inline-block w-2 h-2 rounded-full", active ? "bg-green-500" : "bg-slate-300")} />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminSEO() {
  const [activeTab, setActiveTab] = useState("webmaster");
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(null);
  const [expandedHelp, setExpandedHelp] = useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: settingsMap = {}, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettingsMap,
  });

  useEffect(() => {
    if (settingsMap && Object.keys(settingsMap).length > 0) setValues(settingsMap);
  }, [settingsMap]);

  const val = (key) => values[key] || "";
  const set = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const save = async (fields, category, label) => {
    setSaving(label);
    const payload = {};
    fields.forEach((k) => { if (values[k] !== undefined) payload[k] = values[k]; });
    await saveSettingsGroup(payload, category);
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    toast({ description: `${label} saved successfully!` });
    setSaving(null);
  };

  const metaSnippet = (tool) => {
    const v = val(tool.settingKey);
    if (!v) return null;
    return `<meta name="${tool.metaName}" content="${v}" />`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SEO Manager</h1>
            <p className="text-sm text-slate-500">Webmaster verifications, hreflang, structured data & analytics</p>
          </div>
        </div>

        {/* SEO Health Bar */}
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">SEO Configuration Score:</span>
          {(() => {
            const allKeys = [
              ...WEBMASTER_TOOLS.map(t => t.settingKey),
              ...ADVANCED_FIELDS.flatMap(g => g.fields.map(f => f.key)),
              ...STRUCTURED_DATA_FIELDS.map(f => f.key),
            ];
            const filled = allKeys.filter(k => val(k)).length;
            const pct = Math.round((filled / allKeys.length) * 100);
            const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
            return (
              <>
                <div className="flex-1 h-2 bg-blue-200 dark:bg-blue-800 rounded-full min-w-[80px]">
                  <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{pct}%</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">({filled}/{allKeys.length} fields)</span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: WEBMASTER TOOLS ── */}
      {activeTab === "webmaster" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Add your site to search engines & webmaster tools. Verification codes are injected as <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">&lt;meta&gt;</code> tags automatically.
          </p>

          {WEBMASTER_TOOLS.map((tool) => {
            const snippet = metaSnippet(tool);
            const isVerified = !!val(tool.settingKey);
            const isExpanded = expandedHelp === tool.id;

            return (
              <SectionCard key={tool.id}>
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg", tool.iconBg, tool.iconColor)}>
                    {tool.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{tool.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{tool.badge}</span>
                      <StatusDot active={isVerified} />
                      {isVerified && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Configured</span>}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Input
                        value={val(tool.settingKey)}
                        onChange={(e) => set(tool.settingKey, e.target.value)}
                        placeholder={tool.placeholder}
                        className="text-sm font-mono flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => save([tool.settingKey], "seo", tool.name)}
                        disabled={saving === tool.name}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving === tool.name ? "Saving..." : "Save"}
                      </Button>
                    </div>

                    {/* Meta tag preview */}
                    {snippet && (
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 mb-2">
                        <code className="text-xs text-green-700 dark:text-green-400 flex-1 truncate">{snippet}</code>
                        <CopyButton text={snippet} />
                      </div>
                    )}

                    {/* Expandable help */}
                    <button
                      onClick={() => setExpandedHelp(isExpanded ? null : tool.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      How to get verification code
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                        <p className="flex items-start gap-1.5"><Info className="w-3 h-3 flex-shrink-0 mt-0.5" />{tool.helpText}</p>
                        <div className="flex gap-2 flex-wrap pt-1">
                          <a href={tool.verifyUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                            <ExternalLink className="w-3 h-3" /> Open {tool.name}
                          </a>
                          <a href={tool.docLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-slate-500 hover:underline">
                            <Link2 className="w-3 h-3" /> Documentation
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* ── TAB: HREFLANG ── */}
      {activeTab === "hreflang" && (
        <div className="space-y-4">
          <SectionCard title="🌐 Hreflang / Alternate Language URLs">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tell search engines which language version of a page to serve to users.
              These generate <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">&lt;link rel="alternate" hreflang="..."&gt;</code> tags automatically.
            </p>
            <div className="space-y-3">
              {HREFLANG_LOCALES.map((locale) => (
                <div key={locale.code}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    {locale.label} <code className="ml-1 bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-500">{locale.code}</code>
                  </label>
                  <Input
                    value={val(locale.key)}
                    onChange={(e) => set(locale.key, e.target.value)}
                    placeholder={`https://nammatn234234.in${locale.code === "ta-IN" ? "/ta" : locale.code === "hi-IN" ? "/hi" : "/"}`}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Live preview */}
            {HREFLANG_LOCALES.some((l) => val(l.key)) && (
              <div className="mt-4 p-3 bg-slate-900 rounded-xl overflow-x-auto">
                <p className="text-xs text-slate-400 mb-2 font-mono">{/* Generated hreflang tags */}</p>
                {HREFLANG_LOCALES.filter((l) => val(l.key)).map((l) => (
                  <div key={l.code} className="flex items-center gap-2">
                    <code className="text-xs text-green-400 whitespace-nowrap">
                      {`<link rel="alternate" hreflang="${l.code}" href="${val(l.key)}" />`}
                    </code>
                    <CopyButton text={`<link rel="alternate" hreflang="${l.code}" href="${val(l.key)}" />`} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={() => save(HREFLANG_LOCALES.map(l => l.key), "seo", "Hreflang settings")}
                disabled={saving === "Hreflang settings"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "Hreflang settings" ? "Saving..." : "Save Hreflang"}
              </Button>
            </div>
          </SectionCard>

          {/* Additional link / canonical rules */}
          <SectionCard title="🔗 Canonical & Language Meta">
            <div className="space-y-3">
              {[
                { key: "seo_canonical_base", label: "Canonical Base URL", placeholder: "https://nammatn234234.in" },
                { key: "seo_content_language", label: "Content-Language Header Value", placeholder: "en-IN, ta-IN" },
                { key: "seo_amp_enabled", label: "AMP Support (true/false)", placeholder: "false" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{f.label}</label>
                  <Input value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm"
                onClick={() => save(["seo_canonical_base","seo_content_language","seo_amp_enabled"], "seo", "Canonical settings")}
                disabled={saving === "Canonical settings"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "Canonical settings" ? "Saving..." : "Save"}
              </Button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── TAB: STRUCTURED DATA ── */}
      {activeTab === "structured" && (
        <div className="space-y-4">
          <SectionCard title="🏢 Organization Schema (JSON-LD)">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This data is injected as <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">application/ld+json</code> on every page, improving rich results in Google.
            </p>
            <div className="space-y-3">
              {STRUCTURED_DATA_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{f.label}</label>
                  {f.multiline ? (
                    <textarea
                      value={val(f.key)}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    />
                  ) : (
                    <Input value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="text-sm" />
                  )}
                </div>
              ))}
            </div>
            {/* Live JSON-LD preview */}
            {val("sd_org_name") && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Live JSON-LD Preview:</p>
                <div className="bg-slate-900 rounded-xl p-3 overflow-x-auto">
                  <pre className="text-xs text-green-400 whitespace-pre-wrap">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: val("sd_org_name") || "NammaTN234",
  url: val("sd_org_url") || "https://nammatn234234.in",
  logo: val("sd_org_logo"),
  contactPoint: val("sd_org_phone") ? { "@type": "ContactPoint", telephone: val("sd_org_phone"), contactType: "customer service" } : undefined,
  email: val("sd_org_email"),
  sameAs: val("sd_social_profiles") ? val("sd_social_profiles").split("\n").filter(Boolean) : [],
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button size="sm"
                onClick={() => save(STRUCTURED_DATA_FIELDS.map(f => f.key), "seo", "Structured data")}
                disabled={saving === "Structured data"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "Structured data" ? "Saving..." : "Save Schema"}
              </Button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── TAB: ADVANCED SEO ── */}
      {activeTab === "advanced" && (
        <div className="space-y-4">
          {ADVANCED_FIELDS.map((group) => {
            const keys = group.fields.map((f) => f.key);
            return (
              <SectionCard key={group.group} title={group.group}>
                <div className="space-y-3">
                  {group.fields.map((f) => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{f.label}</label>
                      <Input
                        type={f.type || "text"}
                        value={val(f.key)}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm"
                    onClick={() => save(keys, "seo", group.group)}
                    disabled={saving === group.group}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving === group.group ? "Saving..." : "Save"}
                  </Button>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* ── TAB: ROBOTS & SITEMAP ── */}
      {activeTab === "robots" && (
        <div className="space-y-4">
          <SectionCard title="🤖 Robots.txt Configuration">
            <div className="space-y-3">
              {[
                { key: "robots_disallow_extra", label: "Additional Disallow Paths (one per line)", placeholder: "/private/\n/temp/", multiline: true },
                { key: "robots_crawl_delay", label: "Crawl Delay (seconds)", placeholder: "2", type: "number" },
                { key: "robots_sitemap_url", label: "Sitemap URL", placeholder: "https://nammatn234234.in/sitemap.xml" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{f.label}</label>
                  {f.multiline ? (
                    <textarea
                      value={val(f.key)}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    />
                  ) : (
                    <Input value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} type={f.type || "text"} className="text-sm" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> View robots.txt
              </a>
              <Button size="sm"
                onClick={() => save(["robots_disallow_extra","robots_crawl_delay","robots_sitemap_url"], "seo", "Robots settings")}
                disabled={saving === "Robots settings"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "Robots settings" ? "Saving..." : "Save"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="🗺️ Sitemap Settings">
            <div className="space-y-3">
              {[
                { key: "sitemap_base_url", label: "Sitemap Base URL", placeholder: "https://nammatn234234.in" },
                { key: "sitemap_change_freq", label: "Default Change Frequency", placeholder: "weekly" },
                { key: "sitemap_priority_home", label: "Homepage Priority (0.0–1.0)", placeholder: "1.0" },
                { key: "sitemap_priority_posts", label: "Posts Priority (0.0–1.0)", placeholder: "0.8" },
                { key: "sitemap_priority_districts", label: "Districts Priority", placeholder: "0.7" },
                { key: "sitemap_image_enabled", label: "Include Image Sitemap (true/false)", placeholder: "true" },
                { key: "sitemap_news_enabled", label: "Include News Sitemap (true/false)", placeholder: "true" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{f.label}</label>
                  <Input value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <Rss className="w-3.5 h-3.5" /> View sitemap.xml
                </a>
              </div>
              <Button size="sm"
                onClick={() => save(["sitemap_base_url","sitemap_change_freq","sitemap_priority_home","sitemap_priority_posts","sitemap_priority_districts","sitemap_image_enabled","sitemap_news_enabled"], "seo", "Sitemap settings")}
                disabled={saving === "Sitemap settings"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "Sitemap settings" ? "Saving..." : "Save"}
              </Button>
            </div>
          </SectionCard>

          {/* Indexing Controls */}
          <SectionCard title="🔒 Indexing Controls">
            <div className="space-y-3">
              {[
                { key: "seo_robots_default", label: "Default robots meta tag", placeholder: "index, follow" },
                { key: "seo_robots_noindex_paths", label: "No-index paths (comma-separated prefixes)", placeholder: "/admin,/dashboard,/me" },
                { key: "seo_noarchive", label: "Prevent caching (noarchive) — true/false", placeholder: "false" },
                { key: "seo_noodp", label: "No ODP description (noodp) — true/false", placeholder: "true" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{f.label}</label>
                  <Input value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm"
                onClick={() => save(["seo_robots_default","seo_robots_noindex_paths","seo_noarchive","seo_noodp"], "seo", "Indexing controls")}
                disabled={saving === "Indexing controls"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "Indexing controls" ? "Saving..." : "Save"}
              </Button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
