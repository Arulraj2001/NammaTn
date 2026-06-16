import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettingsMap, saveSettingsGroup } from "@/services/admin/settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Shield, Info, Save, ToggleLeft } from "lucide-react";

const AI_SETTINGS = [
  {
    key: "spam_sensitivity",
    label: "Spam Detection Sensitivity",
    description: "Higher = more aggressive spam filtering. Risk of false positives above 0.7.",
    min: 0, max: 1, step: 0.05, default: 0.4,
  },
  {
    key: "toxicity_threshold",
    label: "Toxicity Flag Threshold",
    description: "Content scoring above this threshold gets flagged for review.",
    min: 0, max: 1, step: 0.05, default: 0.45,
  },
  {
    key: "auto_flag_report_count",
    label: "Auto-flag After N Reports",
    description: "Posts receiving this many reports are automatically queued for priority review.",
    min: 1, max: 20, step: 1, default: 3,
  },
  {
    key: "ai_classification_confidence",
    label: "AI Classification Confidence Threshold",
    description: "Minimum AI confidence required to suggest a content type classification.",
    min: 0.3, max: 1, step: 0.05, default: 0.65,
  },
];

const TOGGLE_SETTINGS = [
  { key: "ai_moderation_enabled", label: "Enable AI Moderation Assistant", description: "Show AI analysis in post review dialogs", default: "true" },
  { key: "sensitive_data_detection", label: "Sensitive Data Detection", description: "Warn when phone numbers, Aadhaar, PAN patterns are detected", default: "true" },
  { key: "spam_auto_queue", label: "Auto-queue High Spam Posts", description: "Automatically route high-spam-score posts to the moderation queue", default: "true" },
  { key: "show_trust_scores", label: "Show Trust Scores in Queue", description: "Display content trust scores in the moderation queue", default: "true" },
];

const DEFAULT_SETTINGS = {};

export default function AdminModerationSettings() {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settingsMap = DEFAULT_SETTINGS } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettingsMap,
  });

  useEffect(() => {
    if (settingsMap && settingsMap !== DEFAULT_SETTINGS) {
      const defaults = {};
      AI_SETTINGS.forEach((s) => { defaults[s.key] = s.default.toString(); });
      TOGGLE_SETTINGS.forEach((s) => { defaults[s.key] = s.default; });
      setValues({ ...defaults, ...settingsMap });
    }
  }, [settingsMap]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {};
    [...AI_SETTINGS, ...TOGGLE_SETTINGS].forEach((s) => {
      if (values[s.key] !== undefined) payload[s.key] = values[s.key];
    });
    await saveSettingsGroup(payload, "moderation");
    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    toast({ description: "AI moderation settings saved." });
    setSaving(false);
  };

  const toggle = (key) => {
    setValues((v) => ({ ...v, [key]: v[key] === "true" ? "false" : "true" }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">AI Moderation Settings</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">Configure thresholds, sensitivity, and automation rules</p>
      </div>

      {/* Ethics reminder */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          These settings control how aggressively the AI flags content for human review.
          No setting causes automatic removal — all flagged content awaits human decision.
        </p>
      </div>

      {/* Toggle switches */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <ToggleLeft className="w-4 h-4 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Feature Toggles</h2>
        </div>
        <div className="space-y-4">
          {TOGGLE_SETTINGS.map((s) => (
            <div key={s.key} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
              </div>
              <button
                onClick={() => toggle(s.key)}
                className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                  values[s.key] === "true" ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  values[s.key] === "true" ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Threshold sliders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Detection Thresholds</h2>
        </div>
        <div className="space-y-6">
          {AI_SETTINGS.map((s) => {
            const val = parseFloat(values[s.key] || s.default);
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-800">{s.label}</label>
                  <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                    {val}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{s.description}</p>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={val}
                  onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>{s.min}</span>
                  <span>{s.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save AI Settings"}
        </Button>
      </div>
    </div>
  );
}