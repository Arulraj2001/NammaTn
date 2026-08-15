"use client";
import React from "react";
import { BadgeCheck, MapPin, Phone, Mail, Share2, Flag, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";

export default function ListingDetail({ initialListing }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const listing = initialListing;

  if (!listing) return <div className="min-h-screen flex items-center justify-center"><p>{T("Listing not found", "பட்டியல் கண்டறியப்படவில்லை")}</p></div>;

  const averageRating = listing.rating_count > 0 ? (listing.rating_sum / listing.rating_count).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Photos */}
        {listing.photo_urls && listing.photo_urls.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-96 bg-slate-200 dark:bg-slate-800">
            <img src={listing.photo_urls[0]} alt={listing.business_name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{listing.business_name}</h1>
                {listing.is_verified && (
                  <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                    ✓ {T("Verified", "சரிபார்க்கப்பட்ட")}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 capitalize">{listing.category?.replace(/_/g, " ")}</p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {listing.description && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("About", "பற்றி")}</h2>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{listing.description}</p>
              </section>
            )}

            {/* Service Areas */}
            {listing.service_areas && listing.service_areas.length > 0 && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("Service Areas", "சேவை பகுதிகள்")}</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.service_areas.map((area, i) => (
                    <span key={i} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm">{area}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews/Ratings */}
            {averageRating && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("Ratings", "மதிப்பீடுகள்")}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-yellow-500">{averageRating}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium">{listing.rating_count} {T("reviews", "மதிப்பாய்வுகள்")}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar - Contact Info */}
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{T("Contact", "தொடர்பு")}</h3>
              <div className="space-y-3">
                {listing.contact_phone && (
                  <a href={`tel:${listing.contact_phone}`} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-mono text-blue-700 dark:text-blue-300">{listing.contact_phone}</span>
                  </a>
                )}
                {listing.contact_whatsapp && (
                  <a href={`https://wa.me/${listing.contact_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
                    <span className="text-sm font-bold text-green-700 dark:text-green-300">WhatsApp</span>
                  </a>
                )}
                {listing.contact_email && (
                  <a href={`mailto:${listing.contact_email}`} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-purple-700 dark:text-purple-300 truncate">{listing.contact_email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Badges */}
            {(listing.is_featured || listing.is_community_recommended) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{T("Badges", "பின்னணி")}</h3>
                <div className="space-y-2">
                  {listing.is_featured && (
                    <span className="block bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-lg text-xs font-bold">⭐ {T("Featured", "சிறப்பு")}</span>
                  )}
                  {listing.is_community_recommended && (
                    <span className="block bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-3 py-2 rounded-lg text-xs font-bold">👍 {T("Community Recommended", "சமுदாய பரிந்துரை")}</span>
                  )}
                </div>
              </div>
            )}

            {/* Right Sidebar Related Links */}
            <SidebarRelatedLinks type="listing" />
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
