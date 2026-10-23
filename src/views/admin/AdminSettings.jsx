import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettingsMap, saveSettingsGroup } from "@/services/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Save, Zap, Mail, ExternalLink, Upload, Trash2, Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { base44 } from "@/api/base44Client";

const SECTIONS = [
  {
    title: "🌐 General",
    category: "general",
    fields: [
      { key: "site_title", label: "Site Title", placeholder: "VizhiTN" },
      { key: "site_description", label: "Site Description", placeholder: "Tamil Nadu civic platform" },
      { key: "contact_email", label: "Admin Contact Email", placeholder: "admin@vizhitn.in" },
      { key: "support_email", label: "Support Email (for replies)", placeholder: "support@vizhitn.in" },
      { key: "site_logo_url", label: "Site Logo URL", placeholder: "https://... or click Upload", type: "image_upload" },
    ],
  },
  {
    title: "🔍 SEO Defaults",
    category: "seo",
    fields: [
      { key: "meta_title", label: "Default Meta Title", placeholder: "VizhiTN - Tamil Nadu Platform" },
      { key: "meta_description", label: "Default Meta Description", placeholder: "Community-driven civic platform for Tamil Nadu" },
      { key: "og_image", label: "Default OG Image URL", placeholder: "https://... or click Upload", type: "image_upload" },
      { key: "canonical_url", label: "Canonical Base URL", placeholder: "https://vizhitn.in" },
    ],
  },
  {
    title: "📣 Social Links",
    category: "social",
    fields: [
      { key: "social_twitter", label: "Twitter / X", placeholder: "https://twitter.com/vizhitn" },
      { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/vizhitn" },
      { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/vizhitn" },
      { key: "social_whatsapp", label: "WhatsApp Group Link", placeholder: "https://chat.whatsapp.com/..." },
      { key: "social_telegram", label: "Telegram Channel", placeholder: "https://t.me/vizhitn" },
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
      { key: "scam_alerts_enabled", label: "Scam Alerts Enabled (true/false)", placeholder: "true" },
      { key: "emergency_enabled", label: "Emergency Help Enabled (true/false)", placeholder: "true" },
    ],
  },
  {
    title: "💳 Support & Donations (UPI / QR)",
    category: "donations",
    fields: [
      { key: "upi_id", label: "UPI ID / VPA (e.g. vizhitn@okaxis)", placeholder: "vizhitn@upi" },
      { key: "upi_name", label: "Payee Name (displayed on support page)", placeholder: "VizhiTN" },
      { key: "qr_image_url", label: "UPI QR Code Image (Upload or paste URL)", placeholder: "https://... or click Upload", type: "image_upload" },
      { key: "min_donation_amount", label: "Minimum Contribution Amount (₹)", placeholder: "10", type: "number" },
      { key: "donation_message", label: "Supporter Note / Banner Message", placeholder: "Your support keeps VizhiTN free, fast, and community-driven. Every contribution matters — thank you!" },
      { key: "buymecoffee_link", label: "BuyMeACoffee Link (optional)", placeholder: "https://buymeacoffee.com/..." },
      { key: "buymecoffee_enabled", label: "Enable BuyMeACoffee Button (true/false)", placeholder: "false" },
    ],
  },
  {
    title: "📢 Announcements",
    category: "general",
    fields: [
      { key: "site_announcement", label: "Site-wide Announcement (leave blank to hide)", placeholder: "⚡ Platform maintenance on Sunday 2AM–4AM" },
      {
        key: "announcement_type",
        label: "Announcement Theme",
        type: "select",
        options: [
          { value: "info", label: "Blue Theme (Info)" },
          { value: "warning", label: "Amber Theme (Warning)" },
          { value: "error", label: "Crimson Theme (Error/Downtime)" },
          { value: "success", label: "Emerald Theme (Success/Celebration)" },
          { value: "royal", label: "Purple Theme (Feature/Royal Update)" },
        ],
      },
    ],
  },
];

const DEFAULT_SETTINGS = {};

export default function AdminSettings() {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
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

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (file_url) {
        setValues((v) => ({ ...v, [key]: file_url }));
        toast({ description: "Image uploaded successfully. Click Save to apply." });
      }
    } catch (err) {
      toast({ variant: "destructive", description: "Image upload failed: " + (err.message || "Unknown error") });
    } finally {
      setUploadingKey(null);
    }
  };

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
          <div key={section.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      value={values[field.key] || ""}
                      onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-slate-100"
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "image_upload" ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={values[field.key] || ""}
                          onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="flex-1"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-600 transition-colors whitespace-nowrap">
                          {uploadingKey === field.key ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Image</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingKey === field.key}
                            onChange={(e) => handleImageUpload(field.key, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                      {values[field.key] && (
                        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                          <img
                            src={values[field.key]}
                            alt="Preview"
                            className="w-14 h-14 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                          />
                          <div className="pr-2">
                            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Preview</p>
                            <button
                              type="button"
                              onClick={() => setValues(v => ({ ...v, [field.key]: "" }))}
                              className="text-[11px] text-red-500 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      type={field.type || "text"}
                      value={values[field.key] || ""}
                      onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  )}
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