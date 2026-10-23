"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert, FileText, Users, Camera, AlertTriangle,
  CheckCircle2, Scale, Mail, ExternalLink, Info
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const DISCLAIMER_SECTIONS = [
  {
    id: "ugc-disclaimer",
    icon: Users,
    en: "1. Citizen-Submitted Content (UGC) Disclaimer",
    ta: "1. குடிமக்கள் சமர்ப்பிக்கும் உள்ளடக்கம் (UGC) — அறிவிப்பு",
    content_en: "Civic reports, photos, GPS pins, and community discussions on VizhiTN are submitted by registered citizen users across Tamil Nadu. While our editorial and moderation team reviews content for spam, abuse, and community guideline violations, we cannot independently verify the accuracy of every individual civic claim before it is published. The presence of a civic report on VizhiTN does not constitute editorial endorsement of the claim by VizhiTN or its operators.",
    content_ta: "VizhiTN-ல் வெளியிடப்படும் குடிமைப் புகார்கள், புகைப்படங்கள், ஜிபிஎஸ் குறிப்புகள் மற்றும் சமுதாய விவாதங்கள் தமிழ்நாடு முழுவதும் உள்ள பதிவுசெய்த குடிமக்களால் சமர்ப்பிக்கப்படுகின்றன. எங்கள் தணிக்கைக் குழு ஸ்பேம் மற்றும் தவறான உள்ளடக்கத்தை அகற்றினாலும், ஒவ்வொரு புகாரையும் வெளியிடுவதற்கு முன் சுயாதீனமாக சரிபார்க்க முடியாது."
  },
  {
    id: "no-govt-affiliation",
    icon: ShieldAlert,
    en: "2. Not an Official Government Portal",
    ta: "2. அரசு அதிகாரப்பூர்வ தளம் அல்ல",
    content_en: "VizhiTN (vizhitn.in) is an independent, non-governmental civic technology initiative. We are NOT affiliated with, operated by, or authorized representatives of the Government of Tamil Nadu, Government of India, or any local body including the Greater Chennai Corporation (GCC), TANGEDCO, Metrowater, CMRL, or any district Collectorate. Any content referencing departmental actions or helpline numbers is sourced from official public announcements and is provided for informational purposes only.",
    content_ta: "VizhiTN (vizhitn.in) ஒரு சுதந்திரமான, அரசு சாரா குடிமைத் தொழில்நுட்பத் தளமாகும். இது தமிழ்நாடு அரசு, இந்திய அரசு, சென்னை மாநகராட்சி, மின்வாரியம் (TANGEDCO), மெட்ரோ ரயில், நீர்வழங்கல் வாரியம் அல்லது மாவட்ட ஆட்சியர் அலுவலகம் ஆகியவற்றுடன் எந்தவகையிலும் தொடர்புடையது அல்ல."
  },
  {
    id: "photo-evidence",
    icon: Camera,
    en: "3. Photo Evidence & Intellectual Property",
    ta: "3. புகைப்பட ஆதாரங்கள் & அறிவுசார் சொத்துரிமை",
    content_en: "Citizens who upload photos retain original ownership of their images. By uploading content to VizhiTN, you grant us a royalty-free license to display and archive it for public civic purposes (see Terms of Service §5). Photos must depict real, current public infrastructure defects in Tamil Nadu. Recycled, AI-generated, or manipulated images are strictly prohibited and may result in immediate account termination and legal action under the IT Act 2000.",
    content_ta: "புகைப்படங்களை பதிவேற்றும் குடிமக்கள் அவற்றின் பதிப்புரிமையை தக்கவைத்துக்கொள்கிறார்கள். VizhiTN-ல் பதிவேற்றுவதன் மூலம் பொது நல ஆவணப்படுத்தலுக்காக அவற்றை காட்ட அனுமதி வழங்குகிறீர்கள். AI மூலம் உருவாக்கப்பட்ட அல்லது திருத்தப்பட்ட படங்கள் தடைசெய்யப்பட்டுள்ளன."
  },
  {
    id: "accuracy-disclaimer",
    icon: AlertTriangle,
    en: "4. Accuracy & Timeliness Disclaimer",
    ta: "4. துல்லியம் & நேரோடிய விவரங்கள் — மறுப்பு",
    content_en: "Utility information such as TANGEDCO power cut timings, school holiday declarations, and traffic diversions are sourced from official departmental communications. However, departments may amend, extend, or cancel these notices without prior notice to VizhiTN. We strongly recommend confirming time-critical information directly with the concerned department or official helpline before making decisions. VizhiTN shall not be liable for loss or inconvenience arising from reliance on platform content.",
    content_ta: "TANGEDCO மின்தடை நேரங்கள், பள்ளி விடுமுறைகள் மற்றும் போக்குவரத்து மாற்றங்கள் குறித்த தகவல்கள் அரசு அறிவிப்புகளின் அடிப்படையில் வழங்கப்படுகின்றன. இருப்பினும் துறைகள் முன்னறிவிப்பின்றி மாற்றங்களை மேற்கொள்ளலாம். நேரம்-முக்கியமான தீர்மானங்களை எடுப்பதற்கு முன் அதிகாரப்பூர்வ ஆதாரத்தை சரிபார்க்கவும்."
  },
  {
    id: "moderation-policy",
    icon: Scale,
    en: "5. Content Moderation & Takedown Policy",
    ta: "5. தணிக்கை நடவடிக்கை & உள்ளடக்க நீக்கக் கொள்கை",
    items_en: [
      "False or defamatory content: Removed within 6 hours of verified complaint",
      "Recycled / AI-generated photos: Immediate removal + account suspension",
      "Private personal data (phone, address, face): Removed within 6 hours",
      "Commercial spam or promotional posts: Immediate removal",
      "Grievance escalation email: vizhitnin@gmail.com (responded within 24 hours)"
    ],
    items_ta: [
      "தவறான அல்லது அவதூறான உள்ளடக்கம்: சரிபார்க்கப்பட்ட புகாரிலிருந்து 6 மணி நேரத்திற்குள் நீக்கம்",
      "மறுசுழற்சி / AI உருவாக்கப்பட்ட படங்கள்: உடனடி நீக்கம் + கணக்கு முடக்கம்",
      "தனிநபர் தொடர்பு தகவல்கள்: 6 மணி நேரத்திற்குள் நீக்கம்",
      "வணிக விளம்பர அல்லது ஸ்பேம் பதிவுகள்: உடனடி நீக்கம்",
      "புகார் மின்னஞ்சல்: vizhitnin@gmail.com (24 மணி நேரத்திற்குள் பதில்)"
    ]
  },
  {
    id: "external-links",
    icon: ExternalLink,
    en: "6. External Links & Third-Party Websites",
    ta: "6. வெளி இணைப்புகள் & மூன்றாம் தரப்பு தளங்கள்",
    content_en: "VizhiTN may contain hyperlinks to official government portals (tangedco.org, chennaicorporation.gov.in, tnebnet.org), emergency service websites, and other trusted civic sources. We do not control and are not responsible for the content, privacy practices, or availability of external websites. Clicking external links is at your own risk and subject to those sites' terms and privacy policies.",
    content_ta: "VizhiTN அரசு இணையதளங்கள் மற்றும் நம்பகமான குடிமை ஆதாரங்களுக்கான வெளி இணைப்புகளைக் கொண்டிருக்கலாம். வெளி தளங்களின் உள்ளடக்கம் அல்லது கொள்கைகளுக்கு VizhiTN பொறுப்பேற்காது."
  }
];

export default function Disclaimer() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: "Disclaimer | VizhiTN — UGC & Editorial Independence Notice",
    description: "VizhiTN is an independent civic platform hosting citizen-submitted reports. Read our UGC disclaimer, content moderation policy, and accuracy notices for Tamil Nadu civic content.",
    canonical: "https://www.vizhitn.in/disclaimer",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── HERO ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              {T("EDITORIAL INDEPENDENCE NOTICE • UGC PLATFORM", "தணிக்கை சுதந்திரம் • குடிமக்கள் உள்ளடக்க தளம்")}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3 text-white">
              {T("VizhiTN Disclaimer", "VizhiTN மறுப்பு அறிவிப்பு")}
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-5">
              {T(
                "VizhiTN hosts citizen-submitted civic reports and editorial dispatches for Tamil Nadu. Please read this disclaimer to understand the nature, limitations, and responsibilities of user-generated content on this platform.",
                "VizhiTN தமிழ்நாட்டிற்கான குடிமக்கள் சமர்ப்பித்த புகார்கள் மற்றும் ஆசிரியரின் செய்திகளை வழங்குகிறது. இந்த தளத்தில் பயனர் உருவாக்கிய உள்ளடக்கத்தின் தன்மை மற்றும் வரம்புகளை புரிந்துகொள்ள இந்த மறுப்பு அறிவிப்பைப் படிக்கவும்."
              )}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-white/10 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                {T("IT Rules 2021 Compliant", "IT விதிகள் 2021")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-blue-300">
                <Info className="w-4 h-4" />
                {T("Independent Civic Platform", "சுதந்திர குடிமை தளம்")}
              </span>
              <span>•</span>
              <span>📅 {T("Effective: October 2026", "நடைமுறை: அக்டோபர் 2026")}</span>
            </div>
          </div>
        </div>

        {/* ── DISCLAIMER SECTIONS ── */}
        <div className="space-y-5">
          {DISCLAIMER_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    {T(section.en, section.ta)}
                  </h2>
                </div>

                {section.content_en && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {T(section.content_en, section.content_ta)}
                  </p>
                )}

                {section.items_en && (
                  <ul className="space-y-2.5 pt-1">
                    {(lang === "ta" ? section.items_ta : section.items_en).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* ── CONTACT FOR DISPUTES ── */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
              CONTENT DISPUTE & TAKEDOWN DESK
            </span>
            <h3 className="text-lg sm:text-xl font-bold mb-1">
              {T("Report Inaccurate or Harmful Content", "தவறான அல்லது தீங்கு விளைவிக்கும் உள்ளடக்கத்தை புகார் செய்யுங்கள்")}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {T(
                "If you find content on VizhiTN that is factually incorrect, defamatory, or violates someone's privacy, contact our Resident Grievance Officer. We resolve disputes within 6–24 hours.",
                "VizhiTN-ல் தவறான, அவதூறான அல்லது தனியுரிமையை மீறும் உள்ளடக்கத்தை கண்டால், எங்கள் குறைதீர்ப்பு அதிகாரியை தொடர்பு கொள்ளுங்கள். 6–24 மணி நேரத்திற்குள் தீர்வு காண்போம்."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href="mailto:vizhitnin@gmail.com"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              vizhitnin@gmail.com
            </a>
            <Link
              href="/contact"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              {T("Contact Desk →", "தொடர்பு மையம் →")}
            </Link>
          </div>
        </div>

        {/* ── LEGAL CROSS-LINKS ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {T("Related Legal Documents:", "தொடர்புடைய ஆவணங்கள்:")}
          </span>
          {[
            { href: "/privacy-policy", en: "Privacy Policy", ta: "தனியுரிமைக் கொள்கை" },
            { href: "/terms", en: "Terms of Service", ta: "சேவை விதிமுறைகள்" },
            { href: "/cookie-policy", en: "Cookie Policy", ta: "குக்கீ கொள்கை" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              {T(link.en, link.ta)}
            </Link>
          ))}
        </div>

        <UniversalCrossLinks pageType="support" />
      </div>
    </div>
  );
}
