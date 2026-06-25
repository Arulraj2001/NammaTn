'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { MapPin, Users, Megaphone, ShieldCheck, Trophy, Building2, ArrowRight, FileText, CheckCircle, ShieldAlert, BookOpen, Compass, Eye, ShieldCheck as VerifiedIcon } from 'lucide-react';

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
    desc_en: 'Document active localized scams, frauds, and deceitful commercial practices to keep your neighborhood safe.',
    desc_ta: 'உங்கள் சுற்றுப்புறத்தைப் பாதுகாப்பாக வைத்திருக்க உள்ளூர் பகுதியின் மோசடிகள் மற்றும் ஏமாற்று வேலைகளை ஆவணப்படுத்தி எச்சரியுங்கள்.'
  },
  {
    icon: Compass,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    en: 'Local Discovery',
    ta: 'உள்ளூர் கண்டறிதல்',
    desc_en: 'Explore listings of government offices, emergency numbers, and utility services organized by your district.',
    desc_ta: 'உங்கள் மாவட்டத்தின் அடிப்படையில் ஒழுங்கமைக்கப்பட்ட அரசு அலுவலகங்கள், அவசர எண்கள் மற்றும் பொதுச் சேவைகளைக் கண்டறியுங்கள்.'
  },
  {
    icon: Users,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    en: 'District Discussions',
    ta: 'மாவட்ட விவாதங்கள்',
    desc_en: 'Engage in real-time, topic-based chat rooms for Chennai, Coimbatore, Madurai, and every other district of TN.',
    desc_ta: 'சென்னை, கோவை, மதுரை மற்றும் தமிழ்நாட்டின் அனைத்து மாவட்டங்களுக்குமான நேரடி அரட்டை அறைகளில் விவாதியுங்கள்.'
  }
];

export default function About() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === 'ta' ? ta : en;

  usePageMeta({
    title: T("About VizhiTN | Tamil Nadu's Civic Community Platform", 'VizhiTN பற்றி | தமிழ்நாடு குடிமை சமுதாய தளம்'),
    description: T(
      "Learn about VizhiTN — our mission, why we were created, our Civic Receipts system, transparency goals, and how we support civic awareness in Tamil Nadu.",
      'VizhiTN பற்றி அறிந்துகொள்ளுங்கள் — எங்கள் நோக்கம், ஏன் உருவாக்கப்பட்டோம், குடிமை ரசீதுகள் முறை மற்றும் தமிழ்நாட்டில் குடிமை விழிப்புணர்வை எவ்வாறு ஆதரிக்கிறோம்.'
    ),
    canonical: 'https://vizhitn.in/about',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-blue-700 to-purple-700 py-20 px-4 text-white overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide">
            <MapPin className="w-3.5 h-3.5" /> Tamil Nadu, India
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            {T('About VizhiTN', 'VizhiTN பற்றி')}
          </h1>
          <p className="text-xl font-semibold text-blue-100 mb-6">
            {T('Tamil Nadu’s Independent Civic Information & Community Platform', 'தமிழ்நாட்டின் சுதந்திரமான குடிமைத் தகவல் மற்றும் சமூக தளம்')}
          </p>
          <p className="text-blue-200 text-base max-w-3xl mx-auto leading-relaxed">
            {T(
              "VizhiTN is a public-interest digital platform built to help the citizens of Tamil Nadu discover local information, document civic challenges, verify neighborhood updates, and share verified civic resources. We are fully independent, citizen-first, and non-governmental.",
              'VizhiTN என்பது தமிழ்நாட்டு குடிமக்களுக்கு உள்ளூர் தகவல்களைக் கண்டறியவும், குடிமைச் சவால்களை ஆவணப்படுத்தவும், சுற்றுப்புறப் புதுப்பிப்புகளைச் சரிபார்க்கவும் மற்றும் விழிப்புணர்வு ஆதாரங்களைப் பகிரவும் உருவாக்கப்பட்ட ஒரு பொதுநலத் தளமாகும். நாங்கள் முற்றிலும் சுதந்திரமான, குடிமக்களுக்கான அரசு சாரா அமைப்பாவோம்.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ── Non-Government Disclaimer ────────────────────────────────────── */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">
              {T('Important Notice: Non-Government Platform', 'முக்கிய அறிவிப்பு: அரசு சாரா தளம்')}
            </h4>
            <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
              {T(
                "VizhiTN is a private public-interest platform. We do NOT represent, operate on behalf of, or claim affiliation with the Government of Tamil Nadu, the Government of India, or any municipal corporation. Filing a report on VizhiTN does NOT constitute filing an official complaint with government authorities. For formal grievances, we guide and link users directly to official channels (such as e-Sevai, TNEB, and CM Grievance portals).",
                "VizhiTN என்பது ஒரு தனிப்பட்ட பொது நலத் தளமாகும். நாங்கள் தமிழ்நாடு அரசு, இந்திய அரசு அல்லது எந்தவொரு மாநகராட்சியுடனும் தொடர்புடையவர்கள் அல்ல. VizhiTN-ல் ஒரு சிக்கலைப் பதிவிடுவது அதிகாரப்பூர்வ அரசுப் புகாராகாது. முறையான புகார்களுக்கு, பயனர்களை அதிகாரப்பூர்வ அரசு இணையதளங்களுக்கு (இ-சேவை, மின்வாரியம் மற்றும் முதலமைச்சரின் உதவி மையம் போன்றவை) நேரடியாக வழிநடத்துகிறோம்."
              )}
            </p>
          </div>
        </div>

        {/* ── Our Story & The Genesis ────────────────────────────────────────── */}
        <section className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {T('Why We Were Created', 'ஏன் உருவாக்கப்பட்டோம்')}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {T(
                "Like many residents of Tamil Nadu, our community members frequently encountered localized civic problems—such as overflowing waste bins, broken streetlights, or sudden water supply cuts. Historically, these problems are discussed in closed messaging groups, where they are easily lost or ignored, leaving no persistent record for neighborhood tracking.",
                "தமிழ்நாட்டின் பல குடியிருப்பாளர்களைப் போலவே, எங்கள் குழு உறுப்பினர்களும் தெருவிளக்கு பழுது, குப்பை மேலாண்மை சிக்கல்கள் அல்லது திடீர் குடிநீர் விநியோகத் தடை போன்ற உள்ளூர் குடிமைப் பிரச்சினைகளை எதிர்கொண்டனர். பொதுவாக, இத்தகைய பிரச்சினைகள் மூடிய அரட்டை குழுக்களில் விவாதிக்கப்பட்டு, பின்னர் எளிதில் மறக்கப்பட்டு விடுகின்றன."
              )}
            </p>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {T(
                "On the other hand, finding reliable emergency helplines, understanding the document checklist for a state welfare scheme, or finding the coordinates of a local municipal office often required browsing multiple complex websites. VizhiTN was built to solve this. We wanted a transparent, searchable, and localized database where public issues can be publicly documented, and citizen awareness is simplified.",
                "அதே சமயம், நம்பகமான அவசர உதவி எண்களைக் கண்டறிவது, அரசு நலத்திட்டங்களுக்கான தகுதிகளைப் புரிந்துகொள்வது அல்லது உள்ளூர் நகராட்சி அலுவலகத்தைக் கண்டறிவது போன்றவற்றுக்கு பல சிக்கலான இணையதளங்களை ஆராய வேண்டியிருந்தது. இதைத் தீர்க்கவே VizhiTN உருவாக்கப்பட்டது. குடிமை சிக்கல்களை பொதுவில் ஆவணப்படுத்தவும், விழிப்புணர்வை எளிதாக்கவும் ஒரு தளம் தேவைப்பட்டது."
              )}
            </p>
          </div>
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {T('Community Driven', 'சமூகத்தால் இயக்கப்படுகிறது')}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {T(
                "We believe that civic participation is not just about complaining; it is about building shared community knowledge. By bringing localized issues, emergency updates, and awareness guides onto a single public board, we enable neighborhoods to collaborate, verify issues, and document community wins together.",
                "குடிமைப் பங்கேற்பு என்பது வெறும் புகார் கூறுவது மட்டுமல்ல, மாறாக பகிரப்பட்ட சமூக அறிவை உருவாக்குவதாகும் என நம்புகிறோம். உள்ளூர் சிக்கல்கள், அவசர கால செய்திகள் மற்றும் விழிப்புணர்வு வழிகாட்டிகளை ஒரே பொதுப் பலகையில் கொண்டு வருவதன் மூலம், அண்டை வீட்டார் ஒன்றிணைந்து செயல்பட உதவுகிறோம்."
              )}
            </p>
          </div>
        </section>

        {/* ── Our Mission & Vision ───────────────────────────────────────────── */}
        <section>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6">
              <h3 className="font-extrabold text-indigo-900 dark:text-indigo-400 text-lg mb-3">
                🎯 {T('Our Mission', 'எங்கள் பணி')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {T(
                  "To democratize local civic information and supply the residents of Tamil Nadu with open-access tools to document public infrastructure challenges, share localized updates, and participate meaningfully in neighborhood development.",
                  "உள்ளூர் குடிமைத் தகவல்களை எளிமைப்படுத்தி, பொது உள்கட்டமைப்பு சவால்களை ஆவணப்படுத்தவும், உள்ளூர் புதுப்பிப்புகளைப் பகிரவும் மற்றும் சுற்றுப்புற வளர்ச்சிக்கு பங்களிக்கவும் தமிழ்நாட்டு குடியிருப்பாளர்களுக்கு திறந்த கருவிகளை வழங்குதல்."
                )}
              </p>
            </div>
            <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl p-6">
              <h3 className="font-extrabold text-purple-900 dark:text-purple-400 text-lg mb-3">
                👁️ {T('Our Vision', 'எங்கள் பார்வை')}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {T(
                  "A highly informed, safe, and collaborative Tamil Nadu, where civic challenges are recorded with integrity, citizen awareness is widespread, and local communities have the clarity to address daily neighborhood matters together.",
                  "மிகவும் விழிப்புணர்வுள்ள, பாதுகாப்பான மற்றும் கூட்டுறவுமிக்க தமிழ்நாடு; இங்கு குடிமைச் சவால்கள் நேர்மையுடன் ஆவணப்படுத்தப்பட்டு, குடியிருப்பாளர்கள் தங்களின் தினசரி உள்ளூர் பிரச்சினைகளை ஒன்றிணைந்து தீர்க்க வழிகாட்டப்படுகிறார்கள்."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ── What Users Can Do ──────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {T('Features of the Platform', 'தளத்தின் முக்கிய அம்சங்கள்')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {T(
                "VizhiTN provides community-focused modules to simplify civic awareness, local networking, and transparency.",
                "குடிமை விழிப்புணர்வு, உள்ளூர் தொடர்பு மற்றும் வெளிப்படைத்தன்மையை எளிமைப்படுத்த VizhiTN பல்வேறு அம்சங்களை வழங்குகிறது."
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, en, ta, desc_en, desc_ta }) => (
              <div key={en} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{T(en, ta)}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{T(desc_en, desc_ta)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Transparency, Verification & Responsibility ───────────────────── */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <VerifiedIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {T('Responsible Information Sharing & Verification', 'பொறுப்பான தகவல் பகிர்வு மற்றும் சரிபார்ப்பு')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-950 dark:text-white">
                {T('1. Evidence-Based Reporting', '1. ஆதார அடிப்படையிலான புகாரளிப்பு')}
              </h4>
              <p>
                {T(
                  "To ensure credibility, we request users who report civic issues or scams to provide clear descriptions, specific locations, and photo evidence. By creating a 'Civic Receipt' with a timestamp, we establish a clean, traceable log of the neighborhood's status.",
                  "நம்பகத்தன்மையை உறுதி செய்ய, குடிமைப் பிரச்சினைகள் அல்லது மோசடிகளைப் புகாரளிக்கும் பயனர்கள் தெளிவான விளக்கம், குறிப்பிட்ட பகுதி மற்றும் புகைப்பட ஆதாரங்களை வழங்குமாறு கேட்டுக்கொள்கிறோம்."
                )}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-950 dark:text-white">
                {T('2. Active Moderation', '2. செயலில் உள்ள மதிப்பீட்டு முறை')}
              </h4>
              <p>
                {T(
                  "We have zero tolerance for political campaigning, commercial spam, personal attacks, or misinformation. Our platform uses community-based flag reports and moderation guidelines to review content and ensure the discussions remain focused on constructive civic matters.",
                  "அரசியல் பிரச்சாரம், வணிக விளம்பரங்கள், தனிநபர் தாக்குதல் அல்லது தவறான தகவல்களுக்கு இங்கு இடமில்லை. எங்கள் தளம் சமூக அடிப்படையிலான கொடி அறிக்கைகள் மற்றும் வழிகாட்டுதல்களைப் பயன்படுத்தி விவாதங்களை நெறிப்படுத்துகிறது."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ── Future Direction ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {T('Future Direction', 'எதிர்கால திசை')}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {T(
              "VizhiTN is in active development. We are expanding our features to offer dedicated dashboards for Resident Welfare Associations (RWAs) and apartment committees to track their local issues systematically. Furthermore, we are designing a voluntary matchmaking portal connecting local welfare organizations with CSR funding to support community-led cleanup and repair drives. Our ultimate goal is to foster a proactive civic culture across Tamil Nadu through structured information and community collaboration.",
              "VizhiTN தீவிர தயாரிப்பில் உள்ளது. குடியிருப்பு நலச் சங்கங்கள் (RWAs) தங்கள் உள்ளூர் பிரச்சினைகளை முறையாகக் கண்காணிக்க பிரத்யேக கட்டுப்பாட்டு பலகைகளை வழங்க விரிவுபடுத்தி வருகிறோம். மேலும், சமூகத் தூய்மை மற்றும் பழுதுபார்ப்புப் பணிகளை ஆதரிப்பதற்காக உள்ளூர் அமைப்புகளை நிறுவனங்களின் சமூகப் பொறுப்பு (CSR) நிதியுடன் இணைக்கும் தானியங்கித் திட்டங்களையும் வடிவமைக்கிறோம்."
            )}
          </p>
        </section>

        {/* ── Advertisers ──────────────────────────────────────────────────── */}
        <section className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
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
            href="mailto:advertise@vizhitn.in"
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
          <a href="mailto:support@vizhitn.in" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            support@vizhitn.in
          </a>
        </p>
      </div>
    </div>
  );
}
