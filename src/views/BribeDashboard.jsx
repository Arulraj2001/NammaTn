"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, ShieldCheck, MapPin, Building, Briefcase, Calendar, 
  Volume2, Play, Pause, Loader2, FileText, CheckCircle, Flame, ArrowRight 
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/api/supabaseClient";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { DISTRICTS } from "@/lib/districts";

const DEPT_MAP = {
  "Revenue Department": { en: "Revenue Department", ta: "வருவாய்த்துறை" },
  "Police Department": { en: "Police Department", ta: "காவல்துறை" },
  "RTO / Transport": { en: "RTO / Transport", ta: "வட்டாரப் போக்குவரத்து (RTO)" },
  "Sub-Registrar Office": { en: "Sub-Registrar Office", ta: "சார்பதிவாளர் அலுவலகம்" },
  "Electricity (TNEB)": { en: "Electricity (TNEB)", ta: "மின்சார வாரியம் (TNEB)" },
  "Municipal Corporation": { en: "Municipal Corporation", ta: "மாநகராட்சி / நகராட்சி" },
  "Other": { en: "Other", ta: "இதர" }
};

// Helper components
function StatCard({ icon: Icon, label, value, color, loading }) {
  const colorMap = {
    pink: "border-pink-200 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 dark:border-pink-800/30",
    red: "border-red-200 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 dark:border-red-800/30",
    green: "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 dark:border-emerald-800/30",
  };

  return (
    <div className={`p-5 rounded-2xl border bg-white dark:bg-slate-800/50 backdrop-blur-md flex items-center gap-4 ${colorMap[color] || ""}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse mt-1 rounded" />
        ) : (
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
}

// Audio Player Component
function AudioPlayer({ src }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const toggle = (e) => {
    e.preventDefault();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 w-fit border border-slate-200 dark:border-slate-700">
      <audio 
        ref={audioRef} 
        src={src} 
        onPlay={() => setPlaying(true)} 
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button 
        type="button" 
        onClick={toggle}
        className="w-7 h-7 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-colors"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-pink-500 animate-pulse" />
          {T("Voice Proof", "குரல் ஆதாரம்")}
        </span>
      </div>
    </div>
  );
}

export default function BribeDashboard({ initialBribePosts }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "Bribe Tracker & Transparency Dashboard | VizhiTN",
    description: "Citizen logged statistics on bribe requests, payments, refusal rates, and departmental transparency across Tamil Nadu.",
  });

  const { data: bribePosts = [], isLoading } = useQuery({
    queryKey: ["bribe-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post")
        .select("*")
        .eq("post_type", "bribe")
        .eq("status", "active")
        .order("created_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    initialData: initialBribePosts,
    staleTime: 60_000,
  });

  // Calculate metrics
  const totalReports = bribePosts.length;
  const totalPaid = bribePosts
    .filter(p => p.bribe_status === "paid")
    .reduce((sum, p) => sum + (Number(p.bribe_amount) || 0), 0);
  const refusedCount = bribePosts.filter(p => p.bribe_status === "refused").length;
  const refusalRate = totalReports > 0 ? Math.round((refusedCount / totalReports) * 100) : 0;

  // Department breakdown
  const deptCounts = {};
  bribePosts.forEach(p => {
    const d = p.bribe_department || "Unspecified";
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });
  const deptData = Object.entries(deptCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // District breakdown
  const distCounts = {};
  bribePosts.forEach(p => {
    const d = p.district_name || "Unspecified";
    distCounts[d] = (distCounts[d] || 0) + 1;
  });
  const distData = Object.entries(distCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const getDeptName = (val) => {
    if (!val || val === "Unspecified") return T("Unspecified", "குறிப்பிடப்படாதது");
    const match = DEPT_MAP[val];
    if (match) return T(match.en, match.ta);
    return val;
  };

  const getDistrictName = (nameEn) => {
    if (!nameEn || nameEn === "Unspecified") return T("Unspecified", "குறிப்பிடப்படாதது");
    const d = DISTRICTS.find(item => item.name_en === nameEn);
    return d ? T(d.name_en, d.name_ta) : nameEn;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {T("Bribe Tracker & Transparency Dashboard", "லஞ்சக் கண்காணிப்பு & வெளிப்படைத்தன்மை பலகை")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T("Citizen statistics and metrics monitoring transparency in public services", "அரசு சேவைகளில் வெளிப்படைத்தன்மையைக் கண்காணிக்கும் குடிமக்கள் புள்ளிவிவரங்கள்")}
            </p>
          </div>
        </div>
        <Link to="/create?type=bribe">
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-2xl shadow-lg shadow-pink-500/25 transition-all text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {T("Log Bribe Incident", "லஞ்ச சம்பவத்தை பதிவிடு")}
          </button>
        </Link>
      </motion.div>

      {/* Policy Disclaimer Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {T("VizhiTN System Transparency Policy", "VizhiTN வெளிப்படைத்தன்மை கொள்கை")}
            </h4>
            <p className="text-xs text-amber-700 dark:text-slate-300 mt-1 leading-relaxed">
              {T(
                "This dashboard displays anonymized citizen-reported statistics regarding requests for bribes in various regions and departments. The purpose is to build regional statistical transparency to help raise citizen awareness. This system is not designed to blame, harass, or defame individual officers.",
                "இந்தத் தகவல் பலகை பல்வேறு பகுதிகள் மற்றும் துறைகளில் லஞ்சம் கேட்கப்பட்டது குறித்த குடிமக்கள் அளித்த அநாமதேயப் புள்ளிவிவரங்களை வெளிப்படுத்துகிறது. இதன் நோக்கம் குடிமக்களிடையே விழிப்புணர்வை ஏற்படுத்த பிராந்திய ரீதியான புள்ளிவிவர வெளிப்படைத்தன்மையை உருவாக்குவதாகும். இந்த அமைப்பு தனிப்பட்ட அதிகாரிகளை பழிவாங்குவதற்கோ, துன்புறுத்துவதற்கோ அல்லது அவதூறு பரப்புவதற்கோ அல்ல."
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <StatCard 
          icon={AlertTriangle} 
          label={T("Total Bribes Reported", "லஞ்சப் பதிவுகள்")} 
          value={totalReports} 
          color="pink" 
          loading={isLoading} 
        />
        <StatCard 
          icon={CheckCircle} 
          label={T("Total Money Paid", "கொடுக்கப்பட்ட லஞ்சத் தொகை")} 
          value={formatCurrency(totalPaid)} 
          color="red" 
          loading={isLoading} 
        />
        <StatCard 
          icon={ShieldCheck} 
          label={T("Refusal Rate", "லஞ்சத்தை மறுத்தவர்களின் விகிதம்")} 
          value={`${refusalRate}%`} 
          color="green" 
          loading={isLoading} 
        />
      </motion.div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bribe count by Department */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Building className="w-5 h-5 text-pink-500" />
            {T("Bribes reported by Department", "துறை ரீதியாக லஞ்சப் புகார்கள்")}
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : deptData.length > 0 ? (
            <div className="space-y-4">
              {deptData.map(({ name, count }) => {
                const max = deptData[0]?.count || 1;
                const percentage = Math.max(5, (count / max) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      <span>{getDeptName(name)}</span>
                      <span className="text-pink-600 dark:text-pink-400 font-bold">{count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-pink-500 transition-all duration-700" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              {T("No department statistics available yet.", "துறை சார்ந்த புள்ளிவிவரங்கள் இன்னும் கிடைக்கவில்லை.")}
            </div>
          )}
        </motion.div>

        {/* Bribe count by District */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-500" />
            {T("Bribes reported by District", "மாவட்ட ரீதியாக லஞ்சப் புகார்கள்")}
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : distData.length > 0 ? (
            <div className="space-y-4">
              {distData.map(({ name, count }) => {
                const max = distData[0]?.count || 1;
                const percentage = Math.max(5, (count / max) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      <span>{getDistrictName(name)}</span>
                      <span className="text-pink-600 dark:text-pink-400 font-bold">{count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-pink-500 transition-all duration-700" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              {T("No district statistics available yet.", "மாவட்ட சார்ந்த புள்ளிவிவரங்கள் இன்னும் கிடைக்கவில்லை.")}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Anonymous Bribe Log Feed */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-500" />
          {T("Recent Transparency Logs (Anonymous)", "அண்மைப் லஞ்சப் பதிவுகள் (அநாமதேயம்)")}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : bribePosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bribePosts.map((post) => {
              const dateStr = new Date(post.created_date).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
                day: "numeric", month: "short", year: "numeric"
              });
              const isPaid = post.bribe_status === "paid";

              return (
                <div key={post.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Status Badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isPaid 
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/20"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20"
                      }`}>
                        {isPaid 
                          ? T(`Paid Bribe: ${formatCurrency(post.bribe_amount)}`, `லஞ்சம் கொடுக்கப்பட்டது: ${formatCurrency(post.bribe_amount)}`) 
                          : T("Refused Bribe", "மறுக்கப்பட்டது")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-base mb-2">
                      {post.title_en}
                    </h3>
                    
                    {/* Details Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{getDeptName(post.bribe_department)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{getDistrictName(post.district_name)}</span>
                      </div>
                      {post.bribe_officer_designation && (
                        <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{post.bribe_officer_designation}</span>
                        </div>
                      )}
                      {post.bribe_specific_location && (
                        <div className="flex items-center gap-1.5 min-w-0 col-span-2 text-[11px] text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{post.bribe_specific_location}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {post.content_en}
                    </p>
                  </div>

                  {/* Audio Player if there is audio URL */}
                  {post.bribe_audio_url && (
                    <AudioPlayer src={post.bribe_audio_url} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-400">
            {T("No recent transparency reports logged yet.", "லஞ்சப் பதிவுகள் எதுவும் இதுவரை இல்லை.")}
          </div>
        )}
      </motion.div>
    </div>
  );
}
