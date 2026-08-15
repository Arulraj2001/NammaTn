"use client";
import React from "react";
import { Home, MapPin, DollarSign, Users, MapPinIcon, Share2, Flag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";

export default function StayDetail({ initialListing }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const listing = initialListing;

  if (!listing) return <div className="min-h-screen flex items-center justify-center"><p>{T("Listing not found", "பட்டியல் கண்டறியப்படவில்லை")}</p></div>;

  const typeLabel = listing.listing_type === 'pg_available' ? 'PG'
    : listing.listing_type === 'shared_room' ? 'Shared Room'
    : listing.listing_type === 'roommate_needed' ? 'Roommate'
    : listing.listing_type === 'temporary_stay' ? 'Temporary Stay'
    : listing.listing_type === 'hostel' ? 'Hostel'
    : 'Stay';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Images */}
        {listing.image_urls && listing.image_urls.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-96 bg-slate-200 dark:bg-slate-800">
            <img src={listing.image_urls[0]} alt={listing.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{listing.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full font-medium">{typeLabel}</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {listing.district_name} {listing.area_name && `• ${listing.area_name}`}
                </span>
                <span className="text-slate-400">•</span>
                <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rent Info */}
            {listing.rent_amount && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{T("Rent", "வாடக")}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{listing.rent_amount}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{T("per", "ப")}{listing.rent_period || 'month'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("About", "பற்றி")}</h2>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{listing.description}</p>
              </section>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("Amenities", "வசதிகள்")}</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity, i) => (
                    <span key={i} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm">{amenity}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Location Features */}
            {(listing.nearby_college || listing.nearby_office || listing.nearby_metro || listing.nearby_railway) && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("Nearby", "அருகில்")}</h2>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                  {listing.nearby_college && <li>🏫 {T("College:", "கல்லூரி:")} {listing.nearby_college}</li>}
                  {listing.nearby_office && <li>🏢 {T("Office:", "அலுவலகம்:")} {listing.nearby_office}</li>}
                  {listing.nearby_metro && <li>🚇 {T("Metro:", "மெट்ரோ:")} {listing.nearby_metro}</li>}
                  {listing.nearby_railway && <li>🚂 {T("Railway:", "ரயில்வே:")} {listing.nearby_railway}</li>}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar - Contact & Details */}
          <div className="space-y-6">
            {/* Gender Preference */}
            {listing.gender_preference && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{T("Gender Preference", "பாலின விருப்பம்")}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{listing.gender_preference}</p>
              </div>
            )}

            {/* Occupancy */}
            {listing.occupancy_type && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{T("Room Type", "அறை வகை")}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{listing.occupancy_type}</p>
              </div>
            )}

            {/* Available From */}
            {listing.available_from && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{T("Available From", "இதிலிருந்து கிடைக்கும்")}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{new Date(listing.available_from).toLocaleDateString()}</p>
              </div>
            )}

            {/* Verification Badge */}
            {listing.is_verified && (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-green-700 dark:text-green-400">✓ {T("Verified Listing", "சரிபார்க்கப்பட்ட பட்டியல்")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            {T("Share", "பகிர்")}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Flag className="w-4 h-4" />
            {T("Report", "புகாரளி")}
          </button>
        </div>
      </div>
    </div>
  );
}
