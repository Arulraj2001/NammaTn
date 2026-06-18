'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

const TERMS = [
  {
    num: '1',
    en: 'Acceptance of Terms',
    ta: 'விதிமுறைகளை ஏற்றுக்கொள்ளல்',
    content_en: 'By accessing or using NammaTN at nammatn.in, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all visitors, users, and others who access or use NammaTN.',
    content_ta: 'nammatn.in-ல் NammaTN-ஐ அணுகுவதன் மூலம் அல்லது பயன்படுத்துவதன் மூலம், இந்த சேவை விதிமுறைகளுக்கு நீங்கள் ஒப்புகிறீர்கள். இந்த விதிமுறைகளுடன் நீங்கள் உடன்படவில்லை என்றால், தயவுசெய்து எங்கள் தளத்தை பயன்படுத்தாதீர்கள்.',
  },
  {
    num: '2',
    en: 'Who Can Use NammaTN',
    ta: 'NammaTN ஐ யார் பயன்படுத்தலாம்',
    content_en: 'NammaTN is intended for users who are at least 13 years of age. You must be a resident of Tamil Nadu or someone with genuine interest in Tamil Nadu civic affairs. By using this platform, you represent that you meet these eligibility requirements.',
    content_ta: 'NammaTN குறைந்தது 13 வயதுடைய பயனர்களுக்காக வடிவமைக்கப்பட்டுள்ளது. நீங்கள் தமிழ்நாட்டு குடிமகன் அல்லது தமிழ்நாட்டு குடிமை விஷயங்களில் உண்மையான ஆர்வமுள்ளவராக இருக்க வேண்டும்.',
  },
  {
    num: '3',
    en: 'User Accounts',
    ta: 'பயனர் கணக்குகள்',
    content_en: 'When you create an account on NammaTN, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You must provide accurate and complete information. You agree to notify us immediately of any unauthorised use of your account at support@nammatn.in.',
    content_ta: 'NammaTN-ல் கணக்கை உருவாக்கும்போது, உங்கள் தகவல்களின் இரகசியத்தன்மையையும் உங்கள் கணக்கில் நடக்கும் அனைத்து செயல்களுக்கும் நீங்கள் பொறுப்பாவீர்கள். துல்லியமான மற்றும் முழுமையான தகவல்களை வழங்க வேண்டும்.',
  },
  {
    num: '4',
    en: 'Prohibited Content',
    ta: 'தடைசெய்யப்பட்ட உள்ளடக்கம்',
    items_en: [
      'Hate speech targeting any religion, caste, gender, or community',
      'Spam, repetitive, or automated content',
      'False, misleading, or fabricated civic reports',
      'Personal attacks, harassment, or threats against any individual',
      'Adult, explicit, or sexually inappropriate content',
      'Content promoting illegal activities or substances',
      'Impersonation of government officials, celebrities, or other users',
      'Commercial spam or unsolicited promotional content',
    ],
    items_ta: [
      'எந்த மதம், சாதி, பாலினம் அல்லது சமுதாயத்தையும் இலக்காக கொண்ட வெறுப்புரை',
      'ஸ்பேம், மீண்டும் மீண்டும் வரும் அல்லது தானியங்கி உள்ளடக்கம்',
      'பொய்யான, தவறான அல்லது கட்டுக்கதையான குடிமை புகார்கள்',
      'தனிப்பட்ட தாக்குதல்கள், துன்புறுத்தல் அல்லது அச்சுறுத்தல்கள்',
      'வயது வந்தோர் அல்லது பாலியல் தகவாத உள்ளடக்கம்',
      'சட்டவிரோத செயல்களை ஊக்குவிக்கும் உள்ளடக்கம்',
      'அரசு அதிகாரிகள் அல்லது பிறரை ஆள்மாறாட்டம்',
      'வணிக ஸ்பேம் அல்லது கோரப்படாத விளம்பர உள்ளடக்கம்',
    ],
  },
  {
    num: '5',
    en: 'Your Content',
    ta: 'உங்கள் உள்ளடக்கம்',
    content_en: 'You retain ownership of content you post on NammaTN. By posting content, you grant NammaTN a non-exclusive, royalty-free licence to display, distribute, and promote that content on our platform. You may delete your posts at any time. You are solely responsible for the accuracy of the content you post.',
    content_ta: 'NammaTN-ல் நீங்கள் இடும் உள்ளடக்கத்தின் உரிமை உங்களுக்கே சேரும். உள்ளடக்கத்தை இடுவதன் மூலம், எங்கள் தளத்தில் அதை காண்பிக்கவும் விநியோகிக்கவும் NammaTN-க்கு உரிமம் வழங்குகிறீர்கள். எந்த நேரத்திலும் உங்கள் இடுகைகளை நீக்கலாம்.',
  },
  {
    num: '6',
    en: 'Civic Accuracy',
    ta: 'குடிமை துல்லியம்',
    content_en: 'You agree to only report genuine civic issues that you have personally observed or verified. Filing false or exaggerated reports undermines community trust and may result in account suspension. NammaTN reserves the right to remove any content that appears to be fabricated.',
    content_ta: 'நீங்கள் நேரில் கண்டறிந்த அல்லது சரிபார்த்த உண்மையான குடிமை சிக்கல்களை மட்டுமே புகாரளிக்க ஒப்புகிறீர்கள். பொய்யான புகார்கள் சமூக நம்பிக்கையை சேதப்படுத்தும்.',
  },
  {
    num: '7',
    en: 'Intellectual Property',
    ta: 'அறிவுசார் சொத்துரிமை',
    content_en: 'The NammaTN name, logo, brand design, and platform interface are the intellectual property of NammaTN. You may not copy, reproduce, or use our brand elements without express written permission. The civic content posted by users remains their own property.',
    content_ta: 'NammaTN பெயர், லோகோ, பிராண்ட் வடிவமைப்பு மற்றும் தளம் NammaTN-ன் அறிவுசார் சொத்து. வெளிப்படையான எழுத்துப்பூர்வ அனுமதியின்றி எங்கள் பிராண்ட் கூறுகளை நகலெடுக்க கூடாது.',
  },
  {
    num: '8',
    en: 'Third-Party Services',
    ta: 'மூன்றாம் தரப்பு சேவைகள்',
    content_en: 'NammaTN uses third-party services including Google (Analytics, AdSense, Authentication), and Supabase (database). Your use of NammaTN is also subject to the terms and privacy policies of these third-party providers. We are not responsible for the actions of third-party services.',
    content_ta: 'NammaTN Google (Analytics, AdSense, Authentication) மற்றும் Supabase (தரவுத்தளம்) உட்பட மூன்றாம் தரப்பு சேவைகளை பயன்படுத்துகிறது. இந்த மூன்றாம் தரப்பு வழங்குநர்களின் விதிமுறைகளும் தனியுரிமைக் கொள்கைகளும் பொருந்தும்.',
  },
  {
    num: '9',
    en: 'Disclaimers',
    ta: 'மறுப்புகள்',
    content_en: 'NammaTN is a community-driven platform, not an official government service. We do not guarantee that civic issues will be resolved. We provide the platform in good faith but cannot be held responsible for the actions of government authorities or community members. Content accuracy depends on user submissions.',
    content_ta: 'NammaTN ஒரு சமூக தளம், அதிகாரபூர்வ அரசு சேவையல்ல. குடிமை சிக்கல்கள் தீர்க்கப்படும் என்று நாங்கள் உத்தரவாதம் அளிக்கவில்லை. அரசு அதிகாரிகளின் செயல்களுக்கு நாங்கள் பொறுப்பேற்க முடியாது.',
  },
  {
    num: '10',
    en: 'Limitation of Liability',
    ta: 'பொறுப்பு வரம்பு',
    content_en: 'To the fullest extent permitted by law, NammaTN shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform, even if we have been advised of the possibility of such damages.',
    content_ta: 'சட்டத்தால் அனுமதிக்கப்பட்ட அளவிற்கு, தளத்தை பயன்படுத்துவதால் அல்லது பயன்படுத்த இயலாமையால் ஏற்படும் எந்த மறைமுக அல்லது விளைவான சேதங்களுக்கும் NammaTN பொறுப்பாகாது.',
  },
  {
    num: '11',
    en: 'Account Suspension',
    ta: 'கணக்கு நிறுத்தம்',
    content_en: 'NammaTN reserves the right to suspend or permanently terminate accounts that violate these Terms of Service, engage in fraudulent activity, or harm the community. We will typically warn users before suspension except in cases of severe violations.',
    content_ta: 'இந்த சேவை விதிமுறைகளை மீறும் கணக்குகளை நிறுத்தவோ அல்லது நிரந்தரமாக நீக்கவோ NammaTN உரிமை வைத்திருக்கிறது. கடுமையான மீறல்களைத் தவிர, நிறுத்துவதற்கு முன்பு பொதுவாக எச்சரிக்கை கொடுப்போம்.',
  },
  {
    num: '12',
    en: 'Changes to Terms',
    ta: 'விதிமுறை மாற்றங்கள்',
    content_en: 'We may update these Terms of Service periodically. We will notify you of significant changes by posting a notice on NammaTN. Your continued use of the platform after changes take effect constitutes your acceptance of the revised terms.',
    content_ta: 'இந்த சேவை விதிமுறைகளை அவ்வப்போது புதுப்பிக்கலாம். குறிப்பிடத்தக்க மாற்றங்களை NammaTN-ல் அறிவிப்பு மூலம் தெரிவிப்போம்.',
  },
  {
    num: '13',
    en: 'Contact',
    ta: 'தொடர்பு',
    content_en: 'For questions about these Terms of Service, contact us at support@nammatn.in or visit our contact page.',
    content_ta: 'இந்த விதிமுறைகள் பற்றிய கேள்விகளுக்கு support@nammatn.in-க்கு மின்னஞ்சல் அனுப்புங்கள் அல்லது எங்கள் தொடர்பு பக்கத்தை பார்வையிடுங்கள்.',
  },
];

function TermSection({ section, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
            {section.num}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
            {T(section.en, section.ta)}
          </span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-1 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700">
          {section.content_en && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {T(section.content_en, section.content_ta)}
              {section.num === '13' && (
                <>
                  {' '}<Link to="/contact" className="text-indigo-600 hover:underline">{T('Contact page', 'தொடர்பு பக்கம்')}</Link>
                </>
              )}
            </p>
          )}
          {section.items_en && (
            <ul className="space-y-2 mt-2">
              {(T(section.items_en, section.items_ta)).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center justify-center text-[10px] font-bold mt-0.5">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function TermsOfService() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === 'ta' ? ta : en;

  usePageMeta({
    title: T('Terms of Service | NammaTN', 'சேவை விதிமுறைகள் | NammaTN'),
    description: T(
      'NammaTN Terms of Service — read our rules for using the civic platform, content policies, and your rights.',
      'NammaTN சேவை விதிமுறைகள் — குடிமை தளத்தை பயன்படுத்துவதற்கான விதிகள்.'
    ),
    canonical: 'https://nammatn.in/terms',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black py-14 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            {T('Terms of Service', 'சேவை விதிமுறைகள்')}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            {T(
              'These terms govern your use of NammaTN. Please read them carefully.',
              'இந்த விதிமுறைகள் NammaTN-ன் பயன்பாட்டை நிர்வகிக்கின்றன. தயவுசெய்து கவனமாக படியுங்கள்.'
            )}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-white/10 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium">
            📅 {T('Last updated: June 2025', 'கடைசியாக புதுப்பிக்கப்பட்டது: ஜூன் 2025')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          ⚠️ {T(
            'NammaTN is a community civic platform, not an official government service. By using this platform, you agree to the following terms.',
            'NammaTN ஒரு சமூக குடிமை தளம், அதிகாரபூர்வ அரசு சேவையல்ல. இந்த விதிமுறைகளுக்கு ஒப்புகிறீர்கள்.'
          )}
        </p>

        <div className="space-y-3">
          {TERMS.map(section => (
            <TermSection key={section.num} section={section} T={T} />
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {T('Questions?', 'கேள்விகளா?')}{' '}
            <a href="mailto:support@nammatn.in" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              support@nammatn.in
            </a>
            {' | '}
            <Link to="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              {T('Privacy Policy', 'தனியுரிமைக் கொள்கை')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
