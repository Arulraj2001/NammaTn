import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { DISTRICTS } from "@/lib/districts";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const districtList = DISTRICTS.map((d) => ({ slug: d.slug, name: d.name_en || d.name }));

export default function CreateLiveRoomForm({ onClose }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [form, setForm] = useState({
    title: "",
    description: "",
    district_slug: "",
    district_name: "",
    is_emergency: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const d = districtList.find((d) => d.slug === form.district_slug);
    await base44.entities.LiveRoom.create({
      title: form.title.trim(),
      description: form.description.trim(),
      district_slug: form.district_slug,
      district_name: d?.name || "",
      is_emergency: form.is_emergency,
      room_type: form.is_emergency ? "emergency" : "community",
      status: "active",
      message_count: 0,
      participant_count: 0,
    });
    setSaving(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{T("Start a Live Discussion Room", "நேரடி விவாத அறை தொடங்கு")}</h3>

      <input
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder={T("Room title (e.g. Chennai Flood Update)", "அறை தலைப்பு (எ.கா. சென்னை வெள்ள புதுப்பிப்பு)")}
        maxLength={100}
        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder={T("Brief description of the situation (optional)", "சூழ்நிலையின் சுருக்கமான விளக்கம் (விருப்பமானது)")}
        rows={2}
        maxLength={300}
        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
      />

      <select
        value={form.district_slug}
        onChange={(e) => setForm({ ...form, district_slug: e.target.value })}
        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">{T("Select district (optional)", "மாவட்டம் தேர்வு செய்யுங்கள் (விருப்பமானது)")}</option>
        {districtList.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
      </select>

      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={form.is_emergency}
          onChange={(e) => setForm({ ...form, is_emergency: e.target.checked })}
          className="accent-red-600"
        />
        🚨 {T("Mark as emergency room", "அவசர அறையாக குறிக்கவும்")}
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white flex-1">
          {saving ? T("Creating...", "உருவாக்குகிறது...") : T("Start Room", "அறை தொடங்கு")}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          {T("Cancel", "ரத்துசெய்")}
        </Button>
      </div>
    </form>
  );
}