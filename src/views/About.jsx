'use client';
import React from 'react';
import { Link } from "@/lib/router-compat";
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { MapPin, Users, Megaphone, ShieldCheck, Trophy, Building2, ArrowRight, FileText, CheckCircle, ShieldAlert, BookOpen, Compass, Eye, ShieldCheck as VerifiedIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSettingsMap } from '@/services/admin/settings';

const FEATURES = [
  {
    icon: FileText,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    en: 'Civic Receipts',
    ta: 'குடிமை ரசீதுகள்',
    desc_en: 'Generate persistent, shareable digital records of reported neighborhood issues with photo evidence and progress logs.',
    desc_ta: 'புகைப்பட ஆதாரம் மற்றும் முன்னேற்றப் பதிவுகளுடன் புகாரளிக்கப்பட்ட உள்ளூர் சிக்கல்களுக்கு பகிரக்கூடிய டிஜிட்டல் ஆவணங்களை உருவாக்குங்கள்.'
  },
  {
    icon: Megaphone,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    en: 'Community Reporting',
    ta: 'சமூகப் புகாரளிப்பு',
    desc_en: 'Report local infrastructure issues, upvote neighbors reports, and collaborate to mark issues as resolved.',
    desc_ta: 'உள்ளூர் உள்கட்டமைப்பு சிக்கல்களைப் புகாரளிக்கவும், அண்டை வீட்டாரின் புகார்களை உறுதிப்படுத்தவும், சிக்கல் தீர்க்கப்பட்டதாகக் குறிக்கவும்.'
  },
  {
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    en: 'Awareness Resources',
    ta: 'விழிப்புணர்வு ஆதாரங்கள்',
    desc_en: 'Access simplified guides to state welfare schemes, citizen rights like RTI, and links to official departments.',
    desc_ta: 'அரசு நலத்திட்டங்கள், தகவல் அறியும் உரிமை (RTI) போன்ற குடிமக்கள் உரிமைகள் மற்றும் அதிகாரப்பூர்வ இணைப்புகளின் எளிய வழிகாட்டிகள்.'
  },
  {
    icon: ShieldAlert,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    en: 'Scam Alerts',
    ta: 'மோசடி எச்சரிக்கைகள்',
    desc_en: 'Community-submitted alerts to protect residents from local financial cheats, fake agents, and online fraud.',
    desc_ta: 'உள்ளூர் நிதி மோசடிகள், போலி ஏஜென்டுகள் மற்றும் இணைய மோசடிகளில் இருந்து குடிமக்களைப் பாதுகாக்கும் சமூக எச்சரிக்கைகள்.'
  },
  {
    icon: Compass,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    en: 'Local Life Directory',
    ta: 'உள்ளூர் வாழ்க்கை வழிகாட்டி',
    desc_en: 'Find local jobs, verified PG/room listings, government offices, and local services across all 38 districts of Tamil Nadu.',
    desc_ta: 'தமிழ்நாட்டின் 38 மாவட்டங்களிலும் உள்ளூர் வேலைகள், சரிபார்க்கப்பட்ட தங்குமிடங்கள், அரசு அலுவலகங்கள் மற்றும் சேவைகளைக் கண்டறியவும்.'
  },
  {
    icon: Trophy,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    en: 'Leaderboard & Wins',
    ta: 'தகுதிப் பட்டி & சமூக வெற்றிகள்',
    desc_en: 'Recognize top active citizens, transparent RWAs, and celebrate verified resolutions achieved by community action.',
    desc_ta: 'சிறந்த குடிமக்கள், வெளிப்படையான RWA-களை அங்கீகரித்து சமூக முயற்சியால் தீர்க்கப்பட்ட வெற்றிகளைக் கொண்டாடுங்கள்.'
  }
];

const GUIDING_PRINCIPLES = [
  {
    title_en: 'Factual Accuracy & Moderation',
    title_ta: 'உண்மைத்தன்மை & தணிக்கை',
    desc_en: 'Every public post is held to objective standards. Unsubstantiated claims, personal attacks, and political hate speech are strictly prohibited.',
    desc_ta: 'அனைத்துப் பொதுப் பதிவுகளும் உண்மைத்தன்மை அடிப்படையில் நிர்வகிக்கப்படுகின்றன. தனிநபர் தாக்குதல் மற்றும் வெறுப்புப் பேச்சுகள் தடை செய்யப்பட்டுள்ளன.'
  },
  {
    title_en: 'No Government Impersonation',
    title_ta: 'அரசு ஆள்மாறாட்டம் இல்லை',
    desc_en: 'VizhiTN is an independent platform created by citizens for citizens. We clearly disclose that we are not an official government entity.',
    desc_ta: 'VizhiTN என்பது குடிமக்களால் உருவாக்கப்பட்ட சுதந்திரமான தளம். நாங்கள் அரசு தளம் அல்ல என்பதைத் தெளிவாகக் குறிப்பிடுகிறோம்.'
  },
  {
    title_en: 'Data Privacy & Safety',
    title_ta: 'தரவு தனியுரிமை & பாதுகாப்பு',
    desc_en: 'We protect user identity. Personal data is never sold, and public reports focus strictly on public infrastructure issues, not personal disputes.',
    desc_ta: 'பயனர் அடையாளம் பாதுகாக்கப்படுகிறது. தனிநபர் விவரங்கள் விற்பனை செய்யப்படுவதில்லை.'
  }
];

export default function About() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const contactEmail = settings.contact_email || settings.support_email || "support@vizhitn.in";

  usePageMeta({
    title: 'About VizhiTN - Tamil Nadu Civic Proof & Public Intelligence Platform',
    description: 'Learn about VizhiTN, our mission to build persistent civic proof records, empower citizens across Tamil Nadu, and promote transparent public accountability.'
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            {T('About VizhiTN', 'VizhiTN பற்றி')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {T(
              'Public Civic Proof & Community Intelligence for Tamil Nadu',
              'தமிழ்நாட்டிற்கான பொது குடிமை ஆதாரம் மற்றும் சமூகத் தகவல் தளம்'
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {T(
              'VizhiTN is an independent, community-driven platform empowering citizens across Tamil Nadu to document neighborhood infrastructure issues, track public accountability, and access essential community resources.',
              'VizhiTN என்பது தமிழ்நாட்டின் 38 மாவட்ட குடிமக்களும் தங்களின் உள்ளூர் உள்கட்டமைப்பு பிரச்சினைகளைப் பதிவு செய்யவும், வெளிப்படைத்தன்மையை உருவாக்கவும் உதவும் ஒரு சுயேச்சை சமூகத் தளமாகும்.'
            )}
          </p>
        </div>

        {/* ── Mission Card ─────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <VerifiedIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {T('Our Core Mission', 'எங்கள் முக்கிய நோக்கம்')}
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {T(
              'Every civic issue reported on VizhiTN generates a unique, persistent Civic Receipt. By recording photo evidence, location coordinates, and community verifications, VizhiTN ensures that neighborhood concerns are documented objectively and remain visible until resolved.',
              'VizhiTN இல் புகாரளிக்கப்படும் ஒவ்வொரு குடிமைப் பிரச்சினையும் ஒரு தனித்துவமான குடிமை ரசீதை உருவாக்குகிறது. புகைப்பட ஆதாரம், இருப்பிட விவரங்கள் மற்றும் சமூகச் சரிபார்ப்புகளைப் பதிவு செய்வதன் மூலம், பிரச்சினைகள் தீர்க்கப்படும் வரை அவை வெளிப்படையாக இருப்பதை VizhiTN உறுதி செய்கிறது.'
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">38</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{T('Districts Covered', 'மாவட்டங்கள் சேர்ப்பு')}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{T('Community Verified', 'சமூகத்தால் சரிபார்க்கப்பட்டது')}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Public</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{T('Transparent Archive', 'வெளிப்படையான ஆவணம்')}</p>
            </div>
          </div>
        </section>

        {/* ── Key Platform Features ───────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {T('What You Can Do on VizhiTN', 'VizhiTN இல் நீங்கள் என்ன செய்யலாம்')}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              {T('Comprehensive tools for civic proof and local intelligence', 'குடிமை ஆதாரம் மற்றும் உள்ளூர் தகவல்களுக்கான முழுமையான கருவிகள்')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-5 hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {T(f.en, f.ta)}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed pl-12">
                    {T(f.desc_en, f.desc_ta)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Guiding Principles ──────────────────────────────────────────── */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">
              {T('Guiding Principles & Trust Standards', 'எங்கள் கொள்கைகள் & நம்பிக்கை தரநிலைகள்')}
            </h2>
            <p className="text-slate-400 text-xs">
              {T('Built for constructive, evidence-based public dialogue', 'ஆக்கபூர்வமான, ஆதாரங்களை அடிப்படையாகக் கொண்ட பொது உரையாடலுக்கு உருவாக்கப்பட்டது')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GUIDING_PRINCIPLES.map((p, i) => (
              <div key={i} className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-bold text-indigo-300">0{i + 1}. {T(p.title_en, p.title_ta)}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{T(p.desc_en, p.desc_ta)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Advertisers Section ──────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            📢 {T('For Advertisers & Public Welfare Promoters', 'விளம்பரதாரர்கள் மற்றும் பொதுநல விளம்பரங்களுக்கு')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            {T(
              'VizhiTN helps you reach an engaged, local audience of Tamil Nadu residents who care deeply about their neighborhoods. We support advertisements from ethical local businesses, utility services, and public welfare campaigns. To support our operational costs and keep the platform free, we serve clean, non-intrusive advertisements.',
              'தங்கள் சுற்றுப்புறங்களில் அக்கறை கொண்ட தமிழ்நாட்டு குடியிருப்பாளர்களை எட்ட VizhiTN உதவுகிறது. உள்ளூர் வணிகங்கள், பொதுச் சேவைகள் மற்றும் விழிப்புணர்வு பிரச்சாரங்களின் விளம்பரங்களை வரவேற்கிறோம். எங்கள் செயல்பாட்டுச் செலவுகளை ஈடுகட்ட, தூய்மையான விளம்பரங்களை வழங்குகிறோம்.'
            )}
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {T('Advertise with us', 'எங்களுடன் விளம்பரப்படுத்துங்கள்')}
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">
            {T('Join the VizhiTN Community Today', 'இன்றே VizhiTN சமூகத்தில் இணையுங்கள்')}
          </h2>
          <p className="text-blue-100 text-sm max-w-lg mx-auto mb-6">
            {T(
              "Be part of Tamil Nadu's citizen-driven civic movement. Access resources, report neighborhood issues, and connect with your local district.",
              'தமிழ்நாட்டின் குடிமக்கள் குடிமை இயக்கத்தின் ஒரு பகுதியாகுங்கள். ஆதாரங்களைப் பெறவும், உள்ளூர் பிரச்சினைகளைப் புகாரளிக்கவும் மற்றும் உங்கள் மாவட்டத்துடன் இணையவும்.'
            )}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/create"
              className="bg-white text-indigo-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
            >
              {T('Create Civic Receipt', 'குடிமை ரசீது உருவாக்கு')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/community"
              className="border-2 border-white/70 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              {T('Join Discussions', 'விவாதங்களில் இணை')}
            </Link>
          </div>
        </section>

        {/* ── Footer Link ─────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {T('Have questions about the platform?', 'தளம் பற்றிய கேள்விகள் உள்ளதா?')}{' '}
          <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            {T('Contact us', 'எங்களைத் தொடர்பு கொள்ளவும்')}
          </Link>{' '}
          {T('or email', 'அல்லது மின்னஞ்சல் செய்க')}{' '}
          <a href={`mailto:${contactEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            {contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
