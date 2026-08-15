"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield, BookOpen, Gift, FileText, AlertTriangle, Building2,
  Zap, MessageCircle, HelpCircle, Map, ArrowRight, ExternalLink,
  Briefcase, Home, Trophy, Users, Leaf, Heart, LayoutDashboard
} from "lucide-react";

export default function UniversalCrossLinks({ pageType }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Define cross-link presets based on pageType
  const getLinks = () => {
    switch (pageType) {
      case "bribes":
        return {
          title_en: "Related Transparency & Rights Tools",
          title_ta: "தொடர்புடைய வெளிப்படைத்தன்மை & சட்ட உரிமைகள்",
          items: [
            { title_en: "How to File RTI Application in TN", title_ta: "தமிழ்நாட்டில் RTI மனு தாக்கல் செய்யும் முறை", href: "/awareness/article/how-to-file-rti-application-tamil-nadu-guide", icon: FileText, desc_en: "Demand answers & government files legally.", desc_ta: "சட்டப்பூர்வமாக பதில் மற்றும் ஆவணம் பெறவும்." },
            { title_en: "Right to Information Act 2005", title_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005", href: "/awareness/right/right-to-information-act-2005", icon: Shield, desc_en: "30-day mandatory window for government replies.", desc_ta: "30 நாளில் பதில் பெற சட்டப்பூர்வ உரிமை." },
            { title_en: "Local Scam & Fraud Alerts", title_ta: "உள்ளூர் மோசடி எச்சரிக்கைகள்", href: "/scams", icon: AlertTriangle, desc_en: "Protect yourself against job & financial scams.", desc_ta: "வேலை மற்றும் நிதி மோசடிகளில் இருந்து பாதுகாப்போம்." },
            { title_en: "Government Offices Directory", title_ta: "அரசு அலுவலகங்கள் முகவரி", href: "/offices", icon: Building2, desc_en: "Find local VAO, EB, and Tahsildar offices.", desc_ta: "உள்ளூர் VAO, EB, தாசில்தார் அலுவலகங்கள்." },
            { title_en: "Verified Community Wins", title_ta: "சரிபார்க்கப்பட்ட சமூக வெற்றிகள்", href: "/community/wins", icon: Trophy, desc_en: "See resolved civic issues across TN.", desc_ta: "தீர்க்கப்பட்ட குடிமைப் பிரச்சனைகள்." },
          ]
        };

      case "scams":
        return {
          title_en: "Related Protection & Consumer Guides",
          title_ta: "தொடர்புடைய பாதுகாப்பு & நுகர்வோர் வழிகாட்டிகள்",
          items: [
            { title_en: "Consumer Protection Rights Act 2019", title_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள்", href: "/awareness/right/consumer-protection-rights-2019", icon: Shield, desc_en: "File consumer court cases online without a lawyer.", desc_ta: "வழக்கறிஞர் இன்றி ஆன்லைனில் வழக்கு பதிவிடல்." },
            { title_en: "Traffic Check Driver Rights", title_ta: "வாகன சோதனையின் போது ஓட்டுநர் உரிமைகள்", href: "/awareness/article/traffic-police-vehicle-check-citizen-rights-guide", icon: FileText, desc_en: "DigiLocker validity & key seizure rules.", desc_ta: "டிஜிலாக்கர் செல்லுபடி & சாவி பிடுங்கத் தடை." },
            { title_en: "Report Corruption on Bribe Tracker", title_ta: "லஞ்சப் புகார்களைப் பதிவு செய்க", href: "/bribes", icon: AlertTriangle, desc_en: "Anonymous corruption reporting in TN.", desc_ta: "பெயர் வெளிப்படுத்தாமல் லஞ்சப் புகார் அளித்தல்." },
            { title_en: "Ask Local Community", title_ta: "உள்ளூரினரிடம் கேளுங்கள்", href: "/ask", icon: MessageCircle, desc_en: "Verify suspicious deals with area locals.", desc_ta: "சந்தேகமான ஒப்பந்தங்களை சரிபார்க்கவும்." },
          ]
        };

      case "jobs":
        return {
          title_en: "Related Services & Career Resources",
          title_ta: "தொடர்புடைய சேவைகள் & வேலைவாய்ப்பு ஆதாரங்கள்",
          items: [
            { title_en: "e-Sevai Online Certificates Guide", title_ta: "இ-சேவை சான்றிதழ்கள் முழு வழிகாட்டி", href: "/awareness/article/tamil-nadu-esevai-online-services-guide", icon: FileText, desc_en: "Apply for Income, Community & Native certificates.", desc_ta: "வருமானம், சாதி, இருப்பிட சான்றிதழ்கள் பெற." },
            { title_en: "Find PG & Hostel Accommodation", title_ta: "தங்குமிடம் & PG விடுதிகள்", href: "/stay", icon: Home, desc_en: "Verified rooms and PG listings in TN.", desc_ta: "சரிபார்க்கப்பட்ட PG மற்றும் விடுதிகள்." },
            { title_en: "Naan Mudhalvan Skill Scheme", title_ta: "நான் முதல்வன் திறன் திட்டம்", href: "/awareness/schemes", icon: Gift, desc_en: "Government skill development & career guidance.", desc_ta: "அரசு திறன் மேம்பாடு மற்றும் வழிகாட்டல்." },
            { title_en: "Verified Local Businesses", title_ta: "சரிபார்க்கப்பட்ட வணிகங்கள்", href: "/listings", icon: Building2, desc_en: "Local services and shops near you.", desc_ta: "உள்ளூர் வணிகங்கள் மற்றும் சேவைகள்." },
          ]
        };

      case "stay":
        return {
          title_en: "Related Local Living Services",
          title_ta: "தொடர்புடைய உள்ளூர் வாழ்வியல் சேவைகள்",
          items: [
            { title_en: "Browse Local Job Alerts", title_ta: "உள்ளூர் வேலை வாய்ப்புகள்", href: "/jobs", icon: Briefcase, desc_en: "Full-time, part-time & local job listings.", desc_ta: "முழு நேர மற்றும் பகுதி நேர வேலைகள்." },
            { title_en: "Local Verified Businesses", title_ta: "உள்ளூர் சேவைப் பட்டியல்", href: "/listings", icon: Building2, desc_en: "Plumbers, electricians, laundries near you.", desc_ta: "பிளம்பர், எலக்ட்ரீஷியன் மற்றும் சேவைகள்." },
            { title_en: "Public Offices Directory", title_ta: "அரசு அலுவலகங்கள்", href: "/offices", icon: Map, desc_en: "Find municipal and EB offices.", desc_ta: "நகராட்சி மற்றும் EB அலுவலகங்கள்." },
            { title_en: "Ask Local Questions", title_ta: "உள்ளூரினரிடம் வினாக்கள்", href: "/ask", icon: MessageCircle, desc_en: "Ask locals about food, safety & transport.", desc_ta: "உணவு, பாதுகாப்பு பற்றி கேளுங்கள்." },
          ]
        };

      case "offices":
        return {
          title_en: "Related Citizen Services & Property Guides",
          title_ta: "தொடர்புடைய அரசு சேவைகள் & நில வழிகாட்டிகள்",
          items: [
            { title_en: "Patta, Chitta & EC Verification Guide", title_ta: "பட்டா, சிட்டா & வில்லங்கச் சான்றிதழ் வழிகாட்டி", href: "/awareness/article/patta-chitta-fmb-ec-land-records-guide-tamil-nadu", icon: FileText, desc_en: "Online land ownership records check.", desc_ta: "ஆன்லைனில் நில உரிமை ஆவணங்கள் சரிபார்த்தல்." },
            { title_en: "e-Sevai Online Certificates", title_ta: "இ-சேவை ஆன்லைன் சான்றிதழ்கள்", href: "/awareness/article/tamil-nadu-esevai-online-services-guide", icon: BookOpen, desc_en: "Step-by-step certificate application.", desc_ta: "சான்றிதழ்கள் விண்ணப்பிக்கும் படிநிலைகள்." },
            { title_en: "RTI Application Guide", title_ta: "RTI விண்ணப்பிக்கும் முறை", href: "/awareness/article/how-to-file-rti-application-tamil-nadu-guide", icon: Shield, desc_en: "Request government files legally.", desc_ta: "அரசு ஆவணங்களைப் பெற வழிகாட்டி." },
            { title_en: "Bribe Tracker Log", title_ta: "லஞ்சக் கண்காணிப்பு", href: "/bribes", icon: AlertTriangle, desc_en: "Track local corruption reports.", desc_ta: "லஞ்சப் புகார்களைக் கண்காணிக்கவும்." },
          ]
        };

      case "districts":
        return {
          title_en: "Explore District Services & Alerts",
          title_ta: "மாவட்ட சேவைகள் & எச்சரிக்கைகளை ஆராய்க",
          items: [
            { title_en: "Public Offices Directory", title_ta: "மாவட்ட அரசு அலுவலகங்கள்", href: "/offices", icon: Building2, desc_en: "Find VAO, EB, and Tahsildar offices.", desc_ta: "உள்ளூர் அரசு அலுவலகங்கள்." },
            { title_en: "Live Emergency Situations", title_ta: "நேரடி நிலைமைகள் & எச்சரிக்கைகள்", href: "/situations", icon: Zap, desc_en: "Real-time weather, power & road updates.", desc_ta: "நேரடி வானிலை மற்றும் சாலைத் தகவல்கள்." },
            { title_en: "Community Discussions", title_ta: "சமூக விவாதங்கள்", href: "/community", icon: Users, desc_en: "Discuss civic issues in your district.", desc_ta: "மாவட்ட குடிமைப் பிரச்சனைகள் விவாதிக்க." },
            { title_en: "Bribe Tracker Reports", title_ta: "லஞ்சக் கண்காணிப்புப் பதிவு", href: "/bribes", icon: AlertTriangle, desc_en: "View corruption reports by district.", desc_ta: "மாவட்ட லஞ்சப் புகார்களைக் காண." },
          ]
        };

      default:
        return {
          title_en: "Explore VizhiTN Citizen Services",
          title_ta: "VizhiTN குடிமைச் சேவைகளை ஆராய்க",
          items: [
            { title_en: "Citizen Statutory Rights", title_ta: "குடிமக்கள் சட்ட உரிமைகள்", href: "/awareness/rights", icon: Shield, desc_en: "RTI Act 2005 & Consumer Protection.", desc_ta: "தகவல் உரிமை & நுகர்வோர் பாதுகாப்பு." },
            { title_en: "Government Welfare Schemes", title_ta: "அரசு நலத்திட்டங்கள்", href: "/awareness/schemes", icon: Gift, desc_en: "Magalir Urimai, Pudhumai Penn & CMCHIS.", desc_ta: "மகளிர் உரிமை & புதுமைப் பெண்." },
            { title_en: "Bribe Tracker Log", title_ta: "லஞ்சக் கண்காணிப்பு", href: "/bribes", icon: AlertTriangle, desc_en: "Anonymous corruption reporting.", desc_ta: "லஞ்சப் புகார்களைக் கண்காணிக்க." },
            { title_en: "Community Wins", title_ta: "சமூக வெற்றிகள்", href: "/community/wins", icon: Trophy, desc_en: "Verified resolved civic issues.", desc_ta: "தீர்க்கப்பட்ட குடிமைப் பிரச்சனைகள்." },
          ]
        };
    }
  };

  const data = getLinks();

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          {data.title_ta && lang === "ta" ? data.title_ta : data.title_en}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {T(item.title_en, item.title_ta)}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {T(item.desc_en, item.desc_ta)}
                </p>
              </div>

              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{T("Open Section", "பார்")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
