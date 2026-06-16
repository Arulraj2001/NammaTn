import React, { useState } from "react";
import { X, Upload, AlertTriangle } from "lucide-react";
import { DISTRICTS } from "@/lib/districts";
import { getAreasByDistrict } from "@/services/areas";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/spamGuard";

const AMENITY_OPTIONS = [
  { value: "wifi", label: "WiFi" },
  { value: "ac", label: "AC" },
  { value: "food", label: "Food Included" },
  { value: "parking", label: "Parking" },
  { value: "laundry", label: "Laundry" },
  { value: "gym", label: "Gym" },
  { value: "water", label: "Water Supply" },
  { value: "security", label: "Security" },
  { value: "power_backup", label: "Power Backup" },
];

const SPAM_KEYWORDS = ["lottery", "earn from home", "100% guarantee", "government scheme", "free money", "click here to earn"];

function hasSpamContent(text) {
  const lower = text.toLowerCase();
  return SPAM_KEYWORDS.some(k => lower.includes(k));
}

export default function StayPostForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    title: "", description: "", listing_type: "pg_available",
    district_slug: "", area_slug: "", area_name: "", landmark: "",
    rent_amount: "", rent_period: "monthly", gender_preference: "any",
    occupancy_type: "single", available_from: "", amenities: [],
    contact_preference: "message_only", whatsapp: "", phone: "", telegram: "",
    nearby_college: "", nearby_office: "", nearby_metro: "", nearby_railway: "",
    image_urls: [],
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: areas = [] } = useQuery({
    queryKey: ["areas", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleAmenity = (val) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(val) ? f.amenities.filter(a => a !== val) : [...f.amenities, val],
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) { setErrors(er => ({ ...er, image: "Only JPG, PNG, WebP allowed." })); return; }
    if (file.size > 3 * 1024 * 1024) { setErrors(er => ({ ...er, image: "Max 3MB per image." })); return; }
    if (form.image_urls.length >= 4) { setErrors(er => ({ ...er, image: "Max 4 images." })); return; }
    setErrors(er => ({ ...er, image: null }));
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_urls: [...f.image_urls, file_url] }));
    setUploading(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (form.title.length > 120) errs.title = "Title too long (max 120 chars).";
    if (!form.district_slug) errs.district = "Select a district.";
    if (!form.listing_type) errs.type = "Select listing type.";
    if (hasSpamContent(form.title + " " + form.description)) errs.spam = "Content violates our spam policy.";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s+/g, ""))) errs.phone = "Enter valid 10-digit phone.";
    if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp.replace(/\s+/g, ""))) errs.whatsapp = "Enter valid 10-digit number.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const district = DISTRICTS.find(d => d.slug === form.district_slug);
    const area = areas.find(a => a.slug === form.area_slug);
    // Expiry: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    onSubmit({
      ...form,
      district_name: district?.name_en || "",
      area_name: area?.name_en || form.area_name,
      rent_amount: form.rent_amount ? Number(form.rent_amount) : 0,
      author_session: getSession(),
      is_anonymous: true,
      status: "pending",
      expires_at: expiresAt.toISOString().split("T")[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.spam && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errors.spam}
        </div>
      )}

      {/* Basic */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Basic Details</h3>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Listing Type *</label>
          <select value={form.listing_type} onChange={e => set("listing_type", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
            <option value="pg_available">PG Available</option>
            <option value="shared_room">Shared Room Available</option>
            <option value="roommate_needed">Roommate Needed</option>
            <option value="temporary_stay">Temporary Stay</option>
            <option value="hostel">Hostel Availability</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Title * <span className="text-slate-400 font-normal">({form.title.length}/120)</span></label>
          <input value={form.title} onChange={e => set("title", e.target.value)} maxLength={120}
            placeholder="e.g. Spacious PG near Anna Nagar Metro" required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
            placeholder="Describe the place, rules, expectations..." maxLength={800}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none resize-none" />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Location</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">District *</label>
            <select value={form.district_slug} onChange={e => { set("district_slug", e.target.value); set("area_slug", ""); }} required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="">Select District</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Area</label>
            {areas.length > 0 ? (
              <select value={form.area_slug} onChange={e => { const a = areas.find(x => x.slug === e.target.value); set("area_slug", e.target.value); set("area_name", a?.name_en || ""); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.slug} value={a.slug}>{a.name_en}</option>)}
              </select>
            ) : (
              <input value={form.area_name} onChange={e => set("area_name", e.target.value)}
                placeholder="Type area name" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
            )}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Nearby Landmark</label>
          <input value={form.landmark} onChange={e => set("landmark", e.target.value)}
            placeholder="e.g. Near Koyambedu Bus Stand" maxLength={100}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Nearby College</label>
            <input value={form.nearby_college} onChange={e => set("nearby_college", e.target.value)} placeholder="Anna University..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Nearby IT/Office Park</label>
            <input value={form.nearby_office} onChange={e => set("nearby_office", e.target.value)} placeholder="Tidel Park, OMR..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Nearby Metro Station</label>
            <input value={form.nearby_metro} onChange={e => set("nearby_metro", e.target.value)} placeholder="Guindy Metro..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Nearby Railway Station</label>
            <input value={form.nearby_railway} onChange={e => set("nearby_railway", e.target.value)} placeholder="Chennai Central..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Stay Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Stay Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Rent Amount (₹)</label>
            <input type="number" value={form.rent_amount} onChange={e => set("rent_amount", e.target.value)} min={0} max={999999}
              placeholder="5000" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Per</label>
            <select value={form.rent_period} onChange={e => set("rent_period", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="monthly">Month</option>
              <option value="weekly">Week</option>
              <option value="daily">Day</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">For</label>
            <select value={form.gender_preference} onChange={e => set("gender_preference", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="any">Any (Co-living)</option>
              <option value="boys">Boys Only</option>
              <option value="girls">Girls Only</option>
              <option value="co_living">Co-Living</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Occupancy</label>
            <select value={form.occupancy_type} onChange={e => set("occupancy_type", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="single">Single</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
              <option value="dormitory">Dormitory</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Available From</label>
          <input type="date" value={form.available_from} onChange={e => set("available_from", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">Amenities</label>
          <div className="flex gap-2 flex-wrap">
            {AMENITY_OPTIONS.map(a => (
              <button type="button" key={a.value}
                onClick={() => toggleAmenity(a.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${form.amenities.includes(a.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Photos (optional, max 4)</h3>
        <p className="text-xs text-slate-400">JPG/PNG/WebP only · Max 3MB per image · Optimized automatically</p>
        <div className="flex gap-2 flex-wrap">
          {form.image_urls.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, j) => j !== i) }))}
                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {form.image_urls.length < 4 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              {uploading ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-4 h-4 text-slate-400 mb-1" /><span className="text-xs text-slate-400">Add</span></>}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>
        {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Contact Preference</h3>
        <p className="text-xs text-slate-400">Your contact details are protected. Others must click "Show Contact" to reveal them.</p>
        <select value={form.contact_preference} onChange={e => set("contact_preference", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
          <option value="message_only">Message Only (Safest)</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone Call</option>
          <option value="telegram">Telegram</option>
        </select>
        {form.contact_preference === "whatsapp" && (
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">WhatsApp Number (10 digits)</label>
            <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98XXXXXXXX" maxLength={10}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
            {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
          </div>
        )}
        {form.contact_preference === "phone" && (
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Phone Number (10 digits)</label>
            <input value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98XXXXXXXX" maxLength={10}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        )}
        {form.contact_preference === "telegram" && (
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Telegram Username</label>
            <input value={form.telegram} onChange={e => set("telegram", e.target.value.replace("@", ""))} placeholder="username (without @)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
        ⚡ Listing will be reviewed by moderators before going live. Usually within a few hours.
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
          {submitting ? "Submitting..." : "Submit Listing"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
          Cancel
        </button>
      </div>
    </form>
  );
}