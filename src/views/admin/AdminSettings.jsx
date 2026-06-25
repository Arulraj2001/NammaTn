import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettingsMap, saveSettingsGroup } from "@/services/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Save, Zap, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "🌐 General",
    category: "general",
    fields: [
      { key: "site_title", label: "Site Title", placeholder: "VizhiTN" },
      { key: "site_description", label: "Site Description", placeholder: "Tamil Nadu civic platform" },
      { key: "contact_email", label: "Admin Contact Email", placeholder: "admin@vizhitn.in" },
      { key: "support_email", label: "Support Email (for replies)", placeholder: "support@vizhitn.in" },
      { key: "site_logo_url", label: "Site Logo URL", placeholder: "https://..." },
    ],
  },
  {
    title: "🔍 SEO Defaults",
    category: "seo",
    fields: [
      { key: "meta_title", label: "Default Meta Title", placeholder: "VizhiTN - Tamil Nadu Platform" },
      { key: "meta_description", label: "Default Meta Description", placeholder: "Community-driven civic platform for Tamil Nadu" },
      { key: "og_image", label: "Default OG Image URL", placeholder: "https://..." },
      { key: "canonical_url", label: "Canonical Base URL", placeholder: "https://vizhitn.in" },
    ],
  },
  {
    title: "📣 Social Links",
    category: "social",
    fields: [
      { key: "social_twitter", label: "Twitter / X", placeholder: "https://twitter.com/tnvoice" },
      { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/tnvoice" },
      { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/tnvoice" },
      { key: "social_whatsapp", label: "WhatsApp Group Link", placeholder: "https://chat.whatsapp.com/..." },
      { key: "social_telegram", label: "Telegram Channel", placeholder: "https://t.me/tnvoice" },
    ],
  },
  {
    title: "🏠 Homepage Controls",
    category: "homepage",
    fields: [
      { key: "hero_title_en", label: "Hero Title (English)", placeholder: "Your voice for Tamil Nadu" },
      { key: "hero_title_ta", label: "Hero Title (Tamil)", placeholder: "உங்கள் குரல் தமிழகத்திற்கு" },
      { key: "hero_subtitle_en", label: "Hero Subtitle (English)", placeholder: "Community-driven civic platform" },
      { key: "posts_per_page", label: "Posts per page", placeholder: "20", type: "number" },
      { key: "featured_districts", label: "Featured Districts (comma-separated slugs)", placeholder: "chennai,coimbatore,madurai" },
    ],
  },
  {
    title: "🛡️ Moderation",
    category: "moderation",
    fields: [
      { key: "auto_approve_posts", label: "Auto-approve posts (true/false)", placeholder: "true" },
      { key: "require_login_to_post", label: "Require login to post (true/false)", placeholder: "false" },
      { key: "maintenance_mode", label: "Maintenance Mode (true/false)", placeholder: "false" },
      { key: "spam_word_filter", label: "Spam keywords (comma-separated)", placeholder: "spam,abuse,fake" },
      { key: "max_posts_per_session", label: "Max posts per session per hour", placeholder: "5" },
    ],
  },
  {
    title: "💬 Community Features",
    category: "general",
    fields: [
      { key: "live_chat_enabled", label: "Live Chat Enabled (true/false)", placeholder: "true" },
      { key: "live_rooms_enabled", label: "Live Rooms Enabled (true/false)", placeholder: "true" },
      { key: "discussions_enabled", label: "Discussions Enabled (true/false)", placeholder: "true" },
      { key: "chat_cooldown_seconds", label: "Live Chat Cooldown (seconds)", placeholder: "8", type: "number" },
      { key: "chat_flood_limit", label: "Flood Limit (msgs before mute)", placeholder: "5", type: "number" },
    ],
  },
  {
    title: "📋 Content & Features",
    category: "general",
    fields: [
      { key: "jobs_enabled", label: "Jobs Board Enabled (true/false)", placeholder: "true" },
      { key: "scam_alerts_enabled", label: "Scam Alerts Enabled (true/false)", placeholder: "true" },
      { key: "emergency_enabled", label: "Emergency Help Enabled (true/false)", placeholder: "true" },
      { key: "office_reports_enabled", label: "Office Reports Enabled (true/false)", placeholder: "true" },
      { key: "qa_enabled", label: "Q&A (Ask Local) Enabled (true/false)", placeholder: "true" },
      { key: "situations_enabled", label: "Situations Enabled (true/false)", placeholder: "true" },
      { key: "rwa_enabled", label: "RWA Dashboard Enabled (true/false)", placeholder: "true" },
      { key: "csr_enabled", label: "CSR Dashboard Enabled (true/false)", placeholder: "true" },
    ],
  },
  {
    title: "📢 Announcements",
    category: "general",
    fields: [
      { key: "site_announcement", label: "Site-wide Announcement (leave blank to hide)", placeholder: "⚡ Platform maintenance on Sunday 2AM–4AM" },
      { key: "announcement_type", label: "Announcement Type (info/warning/error)", placeholder: "info" },
    ],
  },
  {
    title: "📋 Local Listing Plans (Pricing)",
    category: "monetization",
    fields: [
      { key: "plan_free_price", label: "Free Listing Price (₹) — Set > 0 for minimum cost mode", placeholder: "0", type: "number" },
      { key: "plan_verified_price", label: "Verified Listing Price (₹)", placeholder: "299", type: "number" },
      { key: "plan_featured_price", label: "Featured Listing Price (₹)", placeholder: "799", type: "number" },
      { key: "plan_district_sponsor_price", label: "District Sponsor Listing Price (₹)", placeholder: "2499", type: "number" },
    ],
  },
];

const DEFAULT_SETTINGS = {};

export default function AdminSettings() {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settingsMap = DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettingsMap,
  });

  useEffect(() => {
    if (settingsMap && settingsMap !== DEFAULT_SETTINGS) {
      setValues(settingsMap);
    }
  }, [settingsMap]);

  const handleSaveSection = async (section) => {
    setSaving(section.category + section.title);
    const sectionValues = {};
    section.fields.forEach(f => {
      if (values[f.key] !== undefined) sectionValues[f.key] = values[f.key];
    });
    await saveSettingsGroup(sectionValues, section.category);
    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    toast({ description: `${section.title} settings saved.` });
    setSaving(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/contacts"
            className="flex items-center gap-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 px-3 py-2 rounded-xl transition-colors">
            <Mail className="w-4 h-4" /> Contact Messages
          </Link>
          <Link to="/admin/moderation-settings"
            className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors">
            <Zap className="w-4 h-4" /> AI Settings
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(section => (
          <div key={section.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{field.label}</label>
                  <Input
                    type={field.type || "text"}
                    value={values[field.key] || ""}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => handleSaveSection(section)} disabled={saving === (section.category + section.title)}
                className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />
                {saving === (section.category + section.title) ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}