"use client";

import React from "react";
import Link from "next/link";
import {
  Users, Shield, Award, Mail, ExternalLink,
  CheckCircle2, Compass, FileText, Phone, Building2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

export default function EditorialTeam() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: "Editorial Board & Newsroom Leadership | VizhiTN",
    description: "Meet the editorial board, civic researchers, and correspondents responsible for verifying public data, municipal alerts, and government welfare reporting across Tamil Nadu.",
  });

  const TEAM_MEMBERS = [
    {
      name_en: "Arulraj",
      name_ta: "அருள்ராஜ்",
      role_en: "Founder & Editor-in-Chief",
      role_ta: "நிறுவனர் & தலைமை ஆசிரியர்",
      expertise_en: "Civic Technology, Open Data & Editorial Standards",
      expertise_ta: "குடிமைத் தொழில்நுட்பம் & தகவல் சரிபார்ப்பு",
      bio_en: "Technology researcher and open-data specialist based in Tamil Nadu. Founded VizhiTN to bring radical transparency to district civic grievances, municipal shutdown alerts, and public welfare scheme access.",
      bio_ta: "தமிழ்நாட்டைச் சேர்ந்த தகவல் தொழில்நுட்ப ஆய்வாளர். அனைத்து 38 மாவட்டங்களிலும் அரசு திட்டங்கள், மின்/குடிநீர் எச்சரிக்கைகள் மற்றும் மக்கள் குறைதீர்க்கும் வெளிப்படைத்தன்மையை உருவாக்க VizhiTN தளத்தை வழிநடத்துகிறார்.",
      email: "arulraj@vizhitn.in",
      location: "Chennai Bureau"
    },
    {
      name_en: "S. Soundarapandian",
      name_ta: "எஸ். சௌந்தரபாண்டியன்",
      role_en: "Senior Municipal & Infrastructure Desk Lead",
      role_ta: "நகராட்சி & கட்டமைப்பு தலைமைச் செய்தியாளர்",
      expertise_en: "TANGEDCO Power Grid, Metrowater & Metro Rail",
      expertise_ta: "மின்வாரியம், குடிநீர் வாரியம் & மெட்ரோ போக்குவரத்து",
      bio_en: "Over a decade of field reporting on Tamil Nadu state infrastructure. Specializes in verifying TANGEDCO substation schedules, CMWSSB pipeline maintenance, and Southern Railway suburban corridor updates.",
      bio_ta: "தமிழகத்தின் பெருநகர கட்டமைப்பு பணிகளை களத்தில் ஆய்வு செய்து வரும் மூத்த செய்தியாளர். மின்வாரிய பராமரிப்பு, மெட்ரோ ரயில் விரிவாக்கம் மற்றும் ரயில்வே வழித்தட மாற்றங்களை ஆவணப்படுத்துகிறார்.",
      email: "infrastructure@vizhitn.in",
      location: "Chennai & Chengalpattu"
    },
    {
      name_en: "K. Meenakshi Sundaram",
      name_ta: "கே. மீனாட்சி சுந்தரம்",
      role_en: "District Grievances & Rural Governance Lead",
      role_ta: "மாவட்ட குறைதீர்ப்பு & ஊரக வளர்ச்சி பிரிவு",
      expertise_en: "PDS / Ration Cards, Patta Chitta & Welfare Schemes",
      expertise_ta: "ரேஷன் அட்டை, பட்டா சிட்டா & அரசு நலத்திட்டங்கள்",
      bio_en: "Covers Taluk office citizen grievance days, e-Sevai portal services, Patta transfers, and agricultural procurement centers (DPCs) across the Kongu belt, Cauvery Delta, and Southern districts.",
      bio_ta: "வட்டார அலுவலக மக்கள் குறைதீர்ப்பு முகாம்கள், இ-சேவை மைய சேவைகள், இணையவழி பட்டா மாறுதல் மற்றும் டெல்டா நேரடி நெல் கொள்முதல் நிலைய நிலவரங்களை தொடர்ந்து கண்காணித்து வருகிறார்.",
      email: "governance@vizhitn.in",
      location: "Madurai & Delta Bureau"
    },
    {
      name_en: "Dr. M. Sangeetha",
      name_ta: "டாக்டர் எம். சங்கீதா",
      role_en: "Public Health & Safety Editorial Advisor",
      role_ta: "பொது சுகாதாரம் & மக்கள் பாதுகாப்பு ஆலோசகர்",
      expertise_en: "Community Health, Monsoon Alerts & Cyber Fraud Redressal",
      expertise_ta: "சுகாதார வழிகாட்டுதல், மழை எச்சரிக்கை & சைபர் பாதுகாப்பு",
      bio_en: "Advises on public health bulletins, monsoon epidemiology preparedness, and citizen cyber fraud advisories linked to official helplines (1930, 1070, 1077).",
      bio_ta: "மழைக்கால முன்னெச்சரிக்கைகள், முதலமைச்சரின் விரிவான மருத்துவக் காப்பீடு திட்டம் மற்றும் சைபர் குற்ற புகார்கள் (1930) குறித்த விழிப்புணர்வு உள்ளடக்கத்தை வழிநடத்துகிறார்.",
      email: "publichealth@vizhitn.in",
      location: "Coimbatore Bureau"
    }
  ];

  const STANDARDS = [
    {
      title_en: "100% Primary Source Verification",
      title_ta: "100% அரசு அதிகாரப்பூர்வ ஆதாரங்கள்",
      desc_en: "Every civic alert and scheme breakdown is cross-checked against official Tamil Nadu government gazettes, DIPR releases, or departmental hotlines.",
      desc_ta: "அனைத்து அறிவிப்புகளும் அரசு செய்திக் குறிப்புகள் மற்றும் துறை சார்ந்த அதிகாரப்பூர்வ சுற்றறிக்கைகள் மூலமாகவே சரிபார்க்கப்படுகின்றன."
    },
    {
      title_en: "Strict Non-Partisan Integrity",
      title_ta: "சுயேச்சையான, நடுநிலையான தலையங்கம்",
      desc_en: "VizhiTN is entirely non-partisan. We strictly do not publish political speculation, party propaganda, or election rumors.",
      desc_ta: "அரசியல் சார்பற்ற, மக்கள் நலன் மற்றும் பொது சேவை சார்ந்த தகவல்களை மட்டுமே மக்களுக்கு வழங்குவதில் உறுதியாக உள்ளோம்."
    },
    {
      title_en: "Guaranteed 24-Hour Corrections",
      title_ta: "24 மணி நேர திருத்த உத்தரவாதம்",
      desc_en: "Any factual discrepancy reported by citizens or officials is investigated and updated on the public record within 24 hours.",
      desc_ta: "பொதுமக்கள் அல்லது அதிகாரிகளால் சுட்டிக்காட்டப்படும் எந்தவொரு தகவற் பிழையும் 24 மணி நேரத்திற்குள் திருத்தப்படும்."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-800/40">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-blue-300" />
            {T("VizhiTN Newsroom Masthead", "VizhiTN ஆசிரியர் குழு")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {T("Meet the Editorial Board", "எங்கள் ஆசிரியர் மற்றும் ஆய்வுக் குழு")}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-blue-100/90 leading-relaxed">
            {T(
              "Independent journalists, public data researchers, and civic analysts dedicated to radical transparency across all 38 districts of Tamil Nadu.",
              "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் துல்லியமான, சரிபார்க்கப்பட்ட குடிமைத் தகவல்கள் மற்றும் அரசு திட்டங்களை மக்களுக்கு கொண்டு சேர்க்கும் ஆசிரியர் குழு."
            )}
          </p>
        </div>
      </section>

      {/* Core Masthead Profiles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {T("Editorial Leadership & Beat Leads", "தலைமை ஆசிரியர்கள் & துறை செய்தியாளர்கள்")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {T("Each article on VizhiTN is authored and verified under the direct supervision of our beat leads.", "VizhiTN தளத்தின் ஒவ்வொரு செய்தியும் உரிய துறை செய்தியாளர்களின் நேரடி மேற்பார்வையில் சரிபார்க்கப்படுகிறது.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {T(member.name_en, member.name_ta)}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">
                      {T(member.role_en, member.role_ta)}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {member.location}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="inline-block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {T("Focus Beat:", "முக்கியப் பிரிவு:")}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    {T(member.expertise_en, member.expertise_ta)}
                  </p>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {T(member.bio_en, member.bio_ta)}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  {member.email}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {T("Verified Byline", "சரிபார்க்கப்பட்ட ஆசிரியர்")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Standards Summary */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {T("Our Public Commitments", "எங்கள் தலையங்க உறுதிமொழிகள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {T("Strict principles governing our newsroom across all 38 districts.", "38 மாவட்டங்களிலும் எமது செய்தி அறையை வழிநடத்தும் கொள்கைகள்.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STANDARDS.map((s, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  {T(s.title_en, s.title_ta)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {T(s.desc_en, s.desc_ta)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/editorial-policy" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold underline underline-offset-4">
              <FileText className="w-3.5 h-3.5" />
              {T("Read Complete Editorial Policy →", "முழு தலையங்கக் கொள்கையை வாசிக்க →")}
            </Link>
            <Link href="/fact-check-policy" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold underline underline-offset-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {T("Read Fact-Checking & Corrections Standards →", "உண்மை சரிபார்ப்பு & திருத்தக் கொள்கை →")}
            </Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold underline underline-offset-4">
              <Mail className="w-3.5 h-3.5" />
              {T("Contact the Newsroom Desk →", "செய்தி அறையைத் தொடர்பு கொள்ள →")}
            </Link>
          </div>
        </div>
      </section>

      {/* Cross Links */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <UniversalCrossLinks />
      </div>
    </div>
  );
}

