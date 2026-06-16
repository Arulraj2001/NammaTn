import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Radio, Plus, MessageSquare, MapPin, Lock, Archive, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import LiveRoomThread from "./LiveRoomThread";
import CreateLiveRoomForm from "./CreateLiveRoomForm";

function RoomCard({ room, onClick }) {
  const isActive = room.status === "active";
  const isEmergency = room.is_emergency;

  return (
    <div
      onClick={() => isActive && onClick(room)}
      className={`rounded-2xl border-2 p-4 transition-all ${
        isActive ? "cursor-pointer hover:shadow-md" : "opacity-60 cursor-not-allowed"
      } ${
        isEmergency
          ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
          : room.status === "archived"
          ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          : "border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isActive && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> LIVE
            </span>
          )}
          {room.status === "archived" && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Archive className="w-3 h-3" /> Archived
            </span>
          )}
          {room.status === "locked" && (
            <span className="flex items-center gap-1 text-xs text-orange-600">
              <Lock className="w-3 h-3" /> Locked
            </span>
          )}
          {isEmergency && <span className="text-xs font-bold text-red-700 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">🚨 Emergency</span>}
          {room.district_name && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{room.district_name}
            </span>
          )}
        </div>
        {isActive && <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </div>

      <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{room.title}</p>
      {room.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{room.description}</p>
      )}

      {room.pinned_notice && (
        <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-1.5 text-xs text-yellow-800 dark:text-yellow-300">
          📌 {room.pinned_notice}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{room.message_count || 0}</span>
        <span>{room.created_date ? formatDistanceToNow(new Date(room.created_date), { addSuffix: true }) : ""}</span>
      </div>
    </div>
  );
}

export default function LiveDiscussionsTab() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("active"); // active | archived
  const qc = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["live-rooms", filter],
    queryFn: () =>
      filter === "archived"
        ? base44.entities.LiveRoom.filter({ status: "archived" }, "-created_date", 20)
        : base44.entities.LiveRoom.filter({ status: "active" }, "-created_date", 20),
    refetchInterval: 15000,
    staleTime: 0,
  });

  if (activeRoom) {
    return <LiveRoomThread room={activeRoom} onBack={() => { setActiveRoom(null); qc.invalidateQueries({ queryKey: ["live-rooms"] }); }} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{T("Live Discussion Rooms", "நேரடி விவாத அறைகள்")}</span>
          </div>
          {rooms.filter(r => r.status === "active").length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
              {rooms.filter(r => r.status === "active").length} {T("live", "நேரடி")}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-3.5 h-3.5 mr-1" />
          {T("Start Room", "அறை தொடங்கு")}
        </Button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
        <strong>{T("What are Live Discussion Rooms?", "நேரடி விவாத அறைகள் என்ன?")}</strong>{" "}
        {T("Temporary public rooms for active local events — floods, power cuts, emergencies. They auto-archive when inactive.", "வெள்ளம், மின்சார தடை போன்ற நிகழ்வுகளுக்கான தற்காலிக பொது அறைகள்.")}
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateLiveRoomForm onClose={() => { setShowCreate(false); qc.invalidateQueries({ queryKey: ["live-rooms"] }); }} />
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[["active", T("Active", "செயல்பாட்டில்")], ["archived", T("Archived", "காப்பகப்படுத்தப்பட்டது")]].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === v ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Rooms list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
        {!isLoading && rooms.length === 0 && (
          <div className="text-center py-14">
            <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{T("No live rooms right now", "இப்போது நேரடி அறைகள் இல்லை")}</p>
            <p className="text-xs text-slate-400 mt-1">{T("Start one when something is happening in your area.", "உங்கள் பகுதியில் ஏதாவது நடக்கும்போது ஒன்றை தொடங்குங்கள்.")}</p>
          </div>
        )}
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={setActiveRoom} />
        ))}
      </div>
    </div>
  );
}