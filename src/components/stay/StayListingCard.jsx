import React, { useState } from "react";
import { MapPin, IndianRupee, Phone, Eye, Flag, CheckCircle, Shield, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getSession } from "@/lib/spamGuard";
import { checkRateLimit } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";

const TYPE_LABELS = {
  pg_available: { label: "PG Available", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  shared_room: { label: "Shared Room", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  roommate_needed: { label: "Roommate Needed", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  temporary_stay: { label: "Temporary Stay", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  hostel: { label: "Hostel", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
};

const GENDER_ICONS = { boys: "👦", girls: "👧", co_living: "👥", any: "🏠" };
const AMENITY_ICONS = {
  wifi: "📶", ac: "❄️", food: "🍽️", parking: "🅿️",
  laundry: "🧺", gym: "💪", water: "💧", security: "🔒", power_backup: "🔋",
};

export default function StayListingCard({ listing, onReport }) {
  // Query creator's trust score
  const { data: creatorProfile = null } = useQuery({
    queryKey: ["creator-profile", listing.created_by_id],
    queryFn: async () => {
      if (!listing.created_by_id) return null;
      const { data, error } = await supabase
        .from("profile")
        .select("trust_score")
        .eq("id", listing.created_by_id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!listing.created_by_id,
    staleTime: 60_000,
  });

  const [contactRevealed, setContactRevealed] = useState(false);
  const [revealBlocked, setRevealBlocked] = useState(false);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const handleRevealContact = () => {
    if (!isAuthenticated) {
      requireAuth(() => {}, "Sign in to view contact details");
      return;
    }
    const session = getSession();
    const allowed = checkRateLimit(`reveal_contact_${session}`, 5, 5 * 60 * 1000);
    if (!allowed) { setRevealBlocked(true); return; }
    setContactRevealed(true);
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      requireAuth(() => onReport && onReport(listing), "Sign in to report a listing");
      return;
    }
    onReport && onReport(listing);
  };

  const typeInfo = TYPE_LABELS[listing.listing_type] || TYPE_LABELS.pg_available;
  const age = listing.created_date ? formatDistanceToNow(new Date(listing.created_date), { addSuffix: true }) : "";
  const maskedPhone = listing.phone ? listing.phone.slice(0, 4) + "XXXXXX" : null;
  const maskedWA = listing.whatsapp ? listing.whatsapp.slice(0, 4) + "XXXXXX" : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
      {/* Images */}
      {listing.image_urls?.length > 0 && (
        <div className="relative h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <img
            src={listing.image_urls[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {listing.image_urls.length > 1 && (
            <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
              +{listing.image_urls.length - 1} more
            </span>
          )}
          {listing.is_trusted && (
            <span className="absolute top-2 left-2 flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              <Shield className="w-3 h-3" /> Trusted
            </span>
          )}
          {listing.is_verified && !listing.is_trusted && (
            <span className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Type + Gender */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <span className="text-xs text-slate-500">{GENDER_ICONS[listing.gender_preference]} {listing.gender_preference?.replace("_", " ")}</span>
          {listing.is_verified && !listing.image_urls?.length && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2">
          {listing.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {listing.area_name && `${listing.area_name}, `}{listing.district_name}
          {listing.landmark && <span className="text-slate-400"> · near {listing.landmark}</span>}
        </p>

        {/* Rent */}
        {listing.rent_amount > 0 && (
          <p className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white mb-2">
            <IndianRupee className="w-3.5 h-3.5" />
            {listing.rent_amount.toLocaleString()}
            <span className="text-xs font-normal text-slate-400">/{listing.rent_period || "month"}</span>
          </p>
        )}

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {listing.amenities.slice(0, 5).map(a => (
              <span key={a} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                {AMENITY_ICONS[a] || "•"} {a.replace("_", " ")}
              </span>
            ))}
          </div>
        )}

        {/* Nearby tags */}
        {(listing.nearby_college || listing.nearby_metro || listing.nearby_railway) && (
          <div className="flex gap-1 flex-wrap mb-3">
            {listing.nearby_college && <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">🎓 {listing.nearby_college}</span>}
            {listing.nearby_metro && <span className="text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded">🚇 {listing.nearby_metro}</span>}
            {listing.nearby_railway && <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">🚂 {listing.nearby_railway}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col gap-1 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.view_count || 0}</span>
              <span>{age}</span>
            </div>
            {!listing.is_anonymous && listing.created_by && (
              <span className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded text-[9px] font-bold self-start mt-0.5">
                👤 {listing.created_by} (★ {creatorProfile?.trust_score || 10})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onReport && (
              <button onClick={handleReport} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Report listing">
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Contact */}
            {listing.contact_preference !== "message_only" && (
              <>
                {!contactRevealed ? (
                  <button
                    onClick={handleRevealContact}
                    disabled={revealBlocked}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {!isAuthenticated ? <LogIn className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                    {revealBlocked ? "Limit reached" : !isAuthenticated ? "Sign in to Contact" : "Show Contact"}
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    {maskedPhone && <a href={`tel:${listing.phone}`} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">📞 {listing.phone}</a>}
                    {maskedWA && <a href={`https://wa.me/91${listing.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">💬 WhatsApp</a>}
                    {listing.telegram && <a href={`https://t.me/${listing.telegram}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">✈️ Telegram</a>}
                  </div>
                )}
              </>
            )}
            {listing.contact_preference === "message_only" && (
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Message Only</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}