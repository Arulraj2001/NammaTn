"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { 
  Map, FileText, AlertTriangle, Users, CheckCircle, 
  Clock, ShieldAlert, Volume2, Building2, Sparkles, HelpCircle 
} from "lucide-react";

export default function HowToUse() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: T("How to Use VizhiTN | Feature Guides", "VizhiTN பயன்படுத்துவது எப்படி | வழிகாட்டிகள்"),
    description: T(
      "Learn how to navigate the interactive map, create civic receipts, log bribe statistics, and join community drives.",
      "ஊடாடும் வரைபடத்தைப் பயன்படுத்துதல், குடிமைப் புகார்களைப் பதிவிடுதல் மற்றும் லஞ்சக் கண்காணிப்பைப் பயன்படுத்துவது எப்படி என்பதை அறிக."
    ),
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const containerVariants = {
    visible: { transition: { staggerChildren: 0.08 } },
    hidden: {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {T("How to Use VizhiTN", "VizhiTN பயன்படுத்துவது எப்படி")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          {T(
            "Get to know our core features. Follow these step-by-step guides to report issues, track statistics, and build a better Tamil Nadu.",
            "எங்கள் முக்கிய அம்சங்களைப் பற்றி தெரிந்து கொள்ளுங்கள். தமிழ்நாட்டை மேம்படுத்த புகாரளிப்பது, புள்ளிவிவரங்களைக் கண்காணிப்பது போன்றவற்றின் எளிய வழிகாட்டி."
          )}
        </p>
      </motion.div>

      {/* Feature Sections */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants} 
        className="space-y-8"
      >
        {/* 1. Interactive Map */}
        <motion.div variants={fadeUp} className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Map className="w-5. h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {T("1. Interactive Map & Live Feed", "1. ஊடாடும் வரைபடம் & நேரடி ஊட்டம்")}
              </h2>
              <p className="text-xs text-slate-400">{T("Explore and track local developments", "உள்ளூர் நிகழ்வுகளை ஆராய்ந்து கண்காணிக்கவும்")}</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
            <p>
              <strong>English:</strong> The Home page contains an interactive map showcasing recently reported issues across Tamil Nadu. You can zoom in to your specific district, click on issue pins to view summary cards, and filter posts by categories (potholes, garbage, lighting, etc.). Use the <strong>Live Feed</strong> to read community updates chronologically.
            </p>
            <p>
              <strong>தமிழ்:</strong> முகப்புப் பக்கத்தில் உள்ள ஊடாடும் வரைபடம் தமிழ்நாட்டில் அண்மையில் பதிவான சிக்கல்களைக் காட்டுகிறது. உங்கள் குறிப்பிட்ட மாவட்டத்தை பெரிதாக்கி, விவரங்களைக் காண குறியீடுகளை அழுத்தலாம். <strong>Live Feed</strong> மூலம் அனைத்துப் புகார்களையும் காலவரிசைப்படி படிக்கலாம்.
            </p>
          </div>
        </motion.div>

        {/* 2. Civic Receipts */}
        <motion.div variants={fadeUp} className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {T("2. Creating Civic Receipts", "2. குடிமை ரசீதுகள் உருவாக்குதல்")}
              </h2>
              <p className="text-xs text-slate-400">{T("File public complaints with proof", "ஆதாரத்துடன் பொதுப் புகார்களைப் பதிவிடவும்")}</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
            <div className="space-y-1">
              <p className="font-semibold text-slate-950 dark:text-white">{T("How to log a complaint:", "புகார் பதிவிடும் முறை:")}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{T("Click the 'Log Issue' button in the header navbar or bottom mobile bar.", "தலைப்பில் உள்ள 'Log Issue' பட்டனையோ அல்லது மொபைல் கீழ் பட்டனையோ அழுத்தவும்.")}</li>
                <li>{T("Select 'Complaint' as the post type, then enter the title, description, and exact location.", "பதிவு வகையாக 'Complaint'-ஐத் தேர்ந்தெடுத்து, தலைப்பு, விளக்கம் மற்றும் இருப்பிடத்தை உள்ளிடவும்.")}</li>
                <li>{T("Upload image or video evidence (Max 2MB for images, 10MB for videos).", "புகைப்படம் அல்லது வீடியோ ஆதாரத்தைப் பதிவேற்றவும் (படங்கள் அதிகபட்சம் 2MB, வீடியோக்கள் 10MB).")}</li>
                <li>{T("Click 'Submit'. The community can now verify your report or mark it fixed.", "சமர்ப்பிக்கவும். பிற மக்கள் உங்கள் பதிவை சரிபார்க்கலாம் அல்லது சரிசெய்யப்பட்டதாக அறிவிக்கலாம்.")}</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 3. Bribe Tracker */}
        <motion.div variants={fadeUp} className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {T("3. Bribe Tracker (Anonymous)", "3. லஞ்சக் கண்காணிப்பு (அநாமதேயம்)")}
              </h2>
              <p className="text-xs text-slate-400">{T("Log bribe requests for statistical audit", "புள்ளிவிவரக் கணக்காய்விற்காக லஞ்சப் பதிவுகளைப் பதிவிடவும்")}</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
            <p>
              <strong>English:</strong> Built to establish regional transparency indices. You can log bribe requests anonymously: select the department, location, bribe amount, and toggle whether it was <strong>Paid</strong> or <strong>Refused</strong>. You can optionally attach voice records or document receipts (restricted strictly to 2MB).
            </p>
            <p>
              <strong>தமிழ்:</strong> துறைகளில் லஞ்சக் கோரிக்கைகளை அநாமதேயமாகப் பதிவிடலாம். துறை, இருப்பிடம், லஞ்சத் தொகை மற்றும் அது <strong>கொடுக்கப்பட்டதா</strong> அல்லது <strong>மறுக்கப்பட்டதா</strong> என்பதைத் தேர்வு செய்ய வேண்டும். குரல் பதிவுகள் அல்லது ஆவணங்களை (அதிகபட்சம் 2MB) இணைக்கலாம்.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 flex gap-2.5 mt-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {T(
                  "Note: The Bribe Tracker is strictly for regional statistical transparency and awareness. It is not designed to blame, harass, or defame individual officers.",
                  "குறிப்பு: லஞ்சக் கண்காணிப்பு என்பது பிராந்திய புள்ளிவிவர விழிப்புணர்விற்காக மட்டுமே. தனிநபர் அதிகாரிகளை அவதூறு பரப்புவதற்கோ, பழிவாங்குவதற்கோ அல்ல."
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 4. Community Drives & Dashboards */}
        <motion.div variants={fadeUp} className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {T("4. Community & Resident Dashboards", "4. சமுதாய & குடியிருப்புப் பலகைகள்")}
              </h2>
              <p className="text-xs text-slate-400">{T("Organize collective regional fixes", "கூட்டுப் பகுதி தீர்வுகளை ஒழுங்கமைக்க")}</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
            <p>
              <strong>English:</strong> Access Resident Welfare Association (<strong>RWA</strong>) dashboards to track local area developments collaboratively, or use the <strong>CSR</strong> hub to link corporate sponsorships to verified public issues. Track top performers and regional contributors via the <strong>Leaderboard</strong>.
            </p>
            <p>
              <strong>தமிழ்:</strong> குடியிருப்பு நலச் சங்கங்களின் (<strong>RWA</strong>) பலகை மூலம் உள்ளூர் மேம்பாடுகளைக் கூட்டாகக் கண்காணிக்கலாம். நிறுவனங்கள் தங்களது சமூகப் பொறுப்பு (<strong>CSR</strong>) பங்களிப்புகளைப் புகார்களுடன் இணைக்கலாம். செயலில் உள்ளவர்களைத் தகுதிப் பட்டியல் (<strong>Leaderboard</strong>) மூலம் காணலாம்.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
