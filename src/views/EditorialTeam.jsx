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
    title: "Team & Community Contributors | VizhiTN",
    description: "Meet the independent citizen developers, community researchers, and volunteers maintaining VizhiTN - a personal non-governmental civic proof initiative across Tamil Nadu.",
  });

  const TEAM_MEMBERS = [
    {
      name_en: "Arulraj",
      name_ta: "அருள்ராஜ்",
      role_en: "Founder & Independent Developer",
      role_ta: "நிறுவனர் & மென்பொருள் வடிவமைப்பாளர்",
      expertise_en: "Civic Open Data & Platform Development",
      expertise_ta: "குடிமைத் தரவு & தள கட்டமைப்பு",
      bio_en: "Independent developer and technology enthusiast from Tamil Nadu. Built VizhiTN out of personal civic interest to provide a clean, open, non-governmental platform for tracking power shutdown schedules, holiday advisories, and public welfare information.",
      bio_ta: "தமிழ்நாட்டைச் சேர்ந்த சுயேச்சை மென்பொருள் உருவாக்குநர். மக்கள் பயன்பாட்டிற்காக தனிப்பட்ட ஆர்வத்தில், மின்வெட்டு அறிவிப்புகள், விடுமுறை எச்சரிக்கைகள் மற்றும் அரசு நலத்திட்ட வழிகாட்டிகளை எளிதாக அறிய VizhiTN தளத்தை உருவாக்கினார்.",
      email: "vizhitnin@gmail.com",
      location: "Chennai"
    },
    {
      name_en: "Sivakumar",
      name_ta: "சிவகுமார்",
      role_en: "Community Contributor & Ground Verification",
      role_ta: "சமூக பங்களிப்பாளர் & கள சரிபார்ப்பு",
      expertise_en: "Municipal Services, TANGEDCO Alerts & Local Infrastructure",
      expertise_ta: "நகராட்சி பணிகள் & மின்வாரிய அறிவிப்புகள்",
      bio_en: "Citizen volunteer and community researcher assisting with cross-verifying local municipal circulars, TANGEDCO power cut schedules, and public transit updates against primary departmental releases.",
      bio_ta: "நகராட்சி அறிவிப்புகள், மின்வாரிய பராமரிப்பு கால அட்டவணைகள் மற்றும் உள்ளூர் மக்கள் குறைதீர்ப்பு தகவல்களை அதிகாரப்பூர்வ சுற்றறிக்கைகளுடன் சரிபார்க்க உதவும் குடிமை ஆர்வலர்.",
      email: "vizhitnin@gmail.com",
      location: "Tamil Nadu"
    },
    {
      name_en: "Arulmozhli",
      name_ta: "அருள்மொழி",
      role_en: "Community Contributor & Public Data Research",
      role_ta: "சமூக பங்களிப்பாளர் & பொதுத் தரவு ஆய்வு",
      expertise_en: "e-Sevai Portals, Citizen Rights & Welfare Schemes",
      expertise_ta: "இ-சேவை வழிகாட்டிகள் & மக்கள் நலத்திட்டங்கள்",
      bio_en: "Citizen researcher tracking government welfare gazettes, e-Sevai online procedures, Smart Ration Card services, and grievance day mechanisms to produce practical bilingual awareness guides.",
      bio_ta: "அரசு நலத்திட்டங்கள், இ-சேவை இணையதள நடைமுறைகள், ரேஷன் அட்டை சேவைகள் மற்றும் பொதுமக்கள் உரிமைகள் குறித்த எளிய வழிகாட்டல்களை ஆவணப்படுத்தும் சமூக ஆய்வாளர்.",
      email: "vizhitnin@gmail.com",
      location: "Tamil Nadu"
    },
    {
      name_en: "Vigneshwaran",
      name_ta: "விக்னேஸ்வரன்",
      role_en: "Community Contributor & Platform Support",
      role_ta: "சமூக பங்களிப்பாளர் & பயனர் உதவி",
      expertise_en: "Citizen Helpdesk, Cyber Safety & Fact Redressal",
      expertise_ta: "உதவி மையம், சைபர் விழிப்புணர்வு & பிழை திருத்தம்",
      bio_en: "Citizen volunteer helping review user feedback, maintain verified emergency helpline records (1930, 1912, 1070), and ensure all user-submitted corrections are reviewed promptly.",
      bio_ta: "பொதுமக்கள் அனுப்பும் கருத்துக்கள் மற்றும் பிழை திருத்தங்களை ஆய்வு செய்வதோடு, அவசர உதவி எண்களின் உண்மைத்தன்மையை உறுதி செய்ய உதவும் தன்னார்வ பங்களிப்பாளர்.",
      email: "vizhitnin@gmail.com",
      location: "Tamil Nadu"
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
            {T("VizhiTN Citizen Team", "VizhiTN குடிமை தன்னார்வக் குழு")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {T("Our Team & Community Contributors", "எங்கள் குழு & தன்னார்வ பங்களிப்பாளர்கள்")}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-blue-100/90 leading-relaxed">
            {T(
              "VizhiTN is an independent, non-governmental civic information initiative created by citizen volunteers out of personal interest to help Tamil Nadu residents track public services, utility alerts, and welfare schemes.",
              "VizhiTN என்பது தமிழ்நாடு மக்களின் பயன்பாட்டிற்காக தனிப்பட்ட ஆர்வத்தில் உருவாக்கப்பட்ட ஒரு சுயேச்சையான, அரசு சாரா குடிமைத் தகவல் தளமாகும்."
            )}
          </p>
        </div>
      </section>

      {/* Non-Governmental Disclaimer Notice */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed shadow-xs">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-100 mb-1">
                {T("Independent Citizen Initiative — Not an Official Government Portal", "சுயேச்சையான பொதுமக்கள் தளம் — அரசு அதிகாரப்பூர்வ தளம் அல்ல")}
              </p>
              <p>
                {T(
                  "VizhiTN is built and maintained by independent citizen volunteers out of personal civic passion. It is NOT affiliated with, sponsored by, or endorsed by the Government of Tamil Nadu, the Government of India, or any municipal body. All utility schedules, helpline numbers, and public announcements are cross-referenced from publicly accessible departmental circulars for community awareness.",
                  "VizhiTN தளம் எவ்வித அரசு சார்பும் அற்ற, தனிப்பட்ட ஆர்வத்தில் இயங்கும் குடிமக்கள் தகவல் தளமாகும். இத்தளம் தமிழ்நாடு அரசு அல்லது எந்தவொரு அரசு துறையுடனும் நேரடியாக தொடர்புடையது அல்ல. இதில் உள்ள தகவல்கள் அனைத்தும் பொதுமக்கள் வசதிக்காக அரசு செய்திக்குறிப்புகளிலிருந்து தொகுத்து வழங்கப்படுகின்றன."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Masthead Profiles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {T("Founding Team & Contributors", "தள வடிவமைப்பாளர் & பங்களிப்பாளர்கள்")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {T("Dedicated volunteers curating open civic records across all 38 districts of Tamil Nadu.", "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் பொதுத் தகவல்களை ஒருங்கிணைத்து மக்களுக்கு வழங்கும் தன்னார்வலர்கள்.")}
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

