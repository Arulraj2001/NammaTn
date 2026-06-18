'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { MapPin, Users, Megaphone, ShieldCheck, Trophy, Building2, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: Megaphone, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', en: 'Report Civic Issues', ta: 'குடிமை சிக்கல்களை புகாரளி', desc_en: 'Document potholes, water failures, power cuts, and more with photo evidence.', desc_ta: 'குழிகள், தண்ணீர் தொடர்பான சிக்கல்கள், மின் தடை மற்றும் பலவற்றை புகார் செய்யுங்கள்.' },
  { icon: Users, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', en: 'Community Discussions', ta: 'சமுதாய விவாதங்கள்', desc_en: 'Live chat rooms and discussion boards for every district in Tamil Nadu.', desc_ta: 'தமிழ்நாட்டின் ஒவ்வொரு மாவட்டத்திற்கும் நேரடி அரட்டை அறைகள் மற்றும் விவாத பலகைகள்.' },
  { icon: ShieldCheck, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', en: 'Scam Alerts', ta: 'மோசடி எச்சரிக்கைகள்', desc_en: 'Report and stay protected from local scams and frauds.', desc_ta: 'உள்ளூர் மோசடிகளிலிருந்து பாதுகாக்க புகாரளியுங்கள்.' },
  { icon: Building2, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', en: 'Scheme Awareness', ta: 'திட்ட விழிப்புணர்வு', desc_en: 'Discover and apply for government welfare schemes in Tamil Nadu.', desc_ta: 'தமிழ்நாட்டு அரசு நலத்திட்டங்களை கண்டறிந்து விண்ணப்பியுங்கள்.' },
  { icon: MapPin, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', en: 'Local Directory', ta: 'உள்ளூர் தொகுப்பு', desc_en: 'Browse verified local businesses, offices, and services near you.', desc_ta: 'உங்களுக்கு அருகிலுள்ள சரிபார்க்கப்பட்ட உள்ளூர் வணிகங்கள் மற்றும் சேவைகளை உலாவுங்கள்.' },
  { icon: Trophy, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', en: 'Community Wins', ta: 'சமூக வெற்றிகள்', desc_en: 'Celebrate when issues get resolved. Track real civic victories.', desc_ta: 'சிக்கல்கள் தீர்க்கப்படும்போது கொண்டாடுங்கள். உண்மையான குடிமை வெற்றிகளை கண்காணியுங்கள்.' },
];

export default function About() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === 'ta' ? ta : en;

  usePageMeta({
    title: T("About NammaTN | Tamil Nadu's Civic Community Platform", 'NammaTN பற்றி | தமிழ்நாடு குடிமை சமுதாய தளம்'),
    description: T(
      "Learn about NammaTN — our mission, story, and how we're building a better Tamil Nadu together.",
      'NammaTN பற்றி அறிந்துகொள்ளுங்கள் — எங்கள் பணி, கதை மற்றும் சிறந்த தமிழ்நாட்டை எவ்வாறு உருவாக்குகிறோம்.'
    ),
    canonical: 'https://nammatn.in/about',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-blue-700 to-purple-700 py-20 px-4 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide">
            <MapPin className="w-3.5 h-3.5" /> Tamil Nadu, India
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            {T('About NammaTN', 'NammaTN பற்றி')}
          </h1>
          <p className="text-xl font-semibold text-blue-100 mb-4">
            {T('Built for Tamil Nadu. By Tamil Nadu.', 'தமிழ்நாட்டிற்காக. தமிழ்நாட்டால்.')}
          </p>
          <p className="text-blue-200 text-base max-w-2xl mx-auto leading-relaxed">
            {T(
              "NammaTN is Tamil Nadu's free civic community platform — where every citizen can report issues, discuss local problems, and celebrate community victories.",
              'NammaTN தமிழ்நாட்டின் இலவச குடிமை சமுதாய தளம் — ஒவ்வொரு குடிமகனும் சிக்கல்களை புகாரளிக்க, உள்ளூர் பிரச்சினைகளை விவாதிக்க மற்றும் சமூக வெற்றிகளை கொண்டாட முடியும்.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ── Our Story ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {T('Our Story', 'எங்கள் கதை')}
            </h2>
          </div>
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-900/20 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700">
            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-4">
              {T(
                'NammaTN was born from a simple frustration — a pothole reported, ignored, forgotten. We built this platform so that no civic issue gets forgotten.',
                'NammaTN ஒரு எளிய விரக்தியிலிருந்து பிறந்தது — ஒரு குழி புகாரளிக்கப்பட்டது, புறக்கணிக்கப்பட்டது, மறக்கப்பட்டது. எந்த குடிமை சிக்கலும் மறக்கப்படாதபடி இந்த தளத்தை உருவாக்கினோம்.'
              )}
            </p>
            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
              {T(
                'Today, thousands of Tamil Nadu citizens use NammaTN to report, discuss, and resolve local issues — from water supply failures in Chennai to road conditions in Coimbatore. We believe civic participation is the foundation of a better Tamil Nadu.',
                'இன்று, ஆயிரக்கணக்கான தமிழ்நாட்டு குடிமக்கள் NammaTN-ஐ உள்ளூர் சிக்கல்களை புகாரளிக்க, விவாதிக்க மற்றும் தீர்க்க பயன்படுத்துகின்றனர். குடிமை பங்கேற்பு சிறந்த தமிழ்நாட்டிற்கான அடித்தளம் என்று நாங்கள் நம்புகிறோம்.'
              )}
            </p>
          </div>
        </section>

        {/* ── Our Mission ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            {T('Our Mission', 'எங்கள் நோக்கம்')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🏛️', en: 'Transparent Governance', ta: 'வெளிப்படையான ஆட்சி', desc_en: 'Making civic issues visible so local authorities are held accountable.', desc_ta: 'உள்ளூர் அதிகாரிகள் பொறுப்புடன் செயல்படுவதற்கு குடிமை சிக்கல்களை தெரியப்படுத்துகிறோம்.' },
              { icon: '🤝', en: 'Community Power', ta: 'சமுதாய வலிமை', desc_en: 'Every voice matters. Together we create meaningful change.', desc_ta: 'ஒவ்வொரு குரலும் முக்கியம். ஒன்றாக நாம் அர்த்தமுள்ள மாற்றத்தை உருவாக்குகிறோம்.' },
              { icon: '✅', en: 'Real Solutions', ta: 'உண்மையான தீர்வுகள்', desc_en: 'Tracking every civic complaint from report to resolution.', desc_ta: 'ஒவ்வொரு குடிமை புகாரையும் புகாரிலிருந்து தீர்வு வரை கண்காணிக்கிறோம்.' },
              { icon: '📱', en: 'Digital Tamil Nadu', ta: 'டிஜிட்டல் தமிழ்நாடு', desc_en: 'Bringing civic participation fully online for every Tamil Nadu citizen.', desc_ta: 'தமிழ்நாட்டின் ஒவ்வொரு குடிமகனுக்கும் குடிமை பங்கேற்பை ஆன்லைனில் கொண்டுவருகிறோம்.' },
            ].map(({ icon, en, ta, desc_en, desc_ta }) => (
              <div key={en} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{T(en, ta)}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{T(desc_en, desc_ta)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What We Do ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            {T('What We Do', 'நாங்கள் என்ன செய்கிறோம்')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, en, ta, desc_en, desc_ta }) => (
              <div key={en} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{T(en, ta)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{T(desc_en, desc_ta)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── For Advertisers ───────────────────────────────────────────── */}
        <section className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            📢 {T('For Advertisers', 'விளம்பரதாரர்களுக்கு')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            {T(
              'Reach an engaged audience of Tamil Nadu citizens who are actively involved in their local communities. NammaTN offers advertising opportunities for local businesses, government schemes, and civic organisations.',
              'தங்கள் உள்ளூர் சமுதாயங்களில் சுறுசுறுப்பாக ஈடுபட்டுள்ள தமிழ்நாட்டு குடிமக்களை எட்டுங்கள். உள்ளூர் வணிகங்கள், அரசு திட்டங்கள் மற்றும் குடிமை அமைப்புகளுக்கு விளம்பர வாய்ப்புகளை வழங்குகிறோம்.'
            )}
          </p>
          <a
            href="mailto:advertise@nammatn.in"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {T('Advertise with us', 'எங்களுடன் விளம்பரப்படுத்துங்கள்')}
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ── Join Us CTA ───────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">
            {T('Join NammaTN Today', 'இன்றே NammaTN-ஐ சேருங்கள்')}
          </h2>
          <p className="text-blue-100 text-sm max-w-lg mx-auto mb-6">
            {T(
              "Be part of Tamil Nadu's growing civic movement. Your voice matters. Your report makes a difference.",
              'தமிழ்நாட்டின் வளர்ந்து வரும் குடிமை இயக்கத்தின் ஒரு பகுதியாகுங்கள். உங்கள் குரல் முக்கியம்.'
            )}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/create"
              className="bg-white text-indigo-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
            >
              {T('Post an Issue', 'ஒரு சிக்கலை இடு')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/community"
              className="border-2 border-white/70 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              {T('Join Community', 'சமுதாயத்தை சேர்')}
            </Link>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {T('Have questions?', 'கேள்விகள் உள்ளனவா?')}{' '}
          <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            {T('Contact us', 'தொடர்பு கொள்ளுங்கள்')}
          </Link>{' '}
          {T('or email', 'அல்லது மின்னஞ்சல்')}{' '}
          <a href="mailto:support@nammatn.in" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            support@nammatn.in
          </a>
        </p>
      </div>
    </div>
  );
}
