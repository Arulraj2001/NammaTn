'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Shield, Mail, ExternalLink, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'introduction',
    en: 'Introduction',
    ta: 'அறிமுகம்',
    content_en: 'NammaTN ("we", "us", or "our") is a free civic community platform for Tamil Nadu citizens. This Privacy Policy explains how we collect, use, and protect your information when you use NammaTN at nammatn.in. By using our platform, you agree to the practices described here. Contact us: support@nammatn.in',
    content_ta: 'NammaTN ("நாங்கள்") தமிழ்நாடு குடிமக்களுக்கான இலவச குடிமை சமுதாய தளம். இந்த கொள்கை உங்கள் தகவல்களை நாங்கள் எவ்வாறு சேகரிக்கிறோம், பயன்படுத்துகிறோம், பாதுகாக்கிறோம் என்பதை விளக்குகிறது. தொடர்பு: support@nammatn.in',
  },
  {
    id: 'data-collection',
    en: 'Information We Collect',
    ta: 'நாங்கள் சேகரிக்கும் தகவல்கள்',
    items_en: [
      'Account information: name and email when you register via Google Sign-in',
      'Usage data: pages visited, posts created, reactions, and interactions',
      'Location data: the district and area you select (not your GPS location)',
      'Device information: browser type and operating system',
      'Cookies and tracking: session tokens, preference cookies, analytics identifiers',
    ],
    items_ta: [
      'கணக்கு தகவல்: Google மூலம் பதிவு செய்யும்போது பெயர் மற்றும் மின்னஞ்சல்',
      'பயன்பாட்டு தரவு: பார்வையிட்ட பக்கங்கள், இடுகைகள், எதிர்வினைகள்',
      'இட தகவல்: நீங்கள் தேர்ந்தெடுக்கும் மாவட்டம் மற்றும் பகுதி (GPS இல்லை)',
      'சாதன தகவல்: உலாவி வகை மற்றும் இயக்க முறைமை',
      'குக்கீகள்: அமர்வு டோக்கன்கள், விருப்ப குக்கீகள், பகுப்பாய்வு அடையாளங்காட்டிகள்',
    ],
  },
  {
    id: 'how-we-use',
    en: 'How We Use Your Information',
    ta: 'உங்கள் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்',
    items_en: [
      'Provide and improve our civic platform services',
      'Personalise content based on your location and interests',
      'Show relevant advertisements via Google AdSense',
      'Send notifications about civic updates (with your consent)',
      'Detect and prevent spam, abuse, and misinformation',
      'Generate anonymised analytics to understand platform usage',
    ],
    items_ta: [
      'எங்கள் குடிமை தள சேவைகளை வழங்கவும் மேம்படுத்தவும்',
      'உங்கள் இடம் மற்றும் ஆர்வங்களின் அடிப்படையில் உள்ளடக்கத்தை தனிப்பயனாக்கவும்',
      'Google AdSense மூலம் தொடர்புடைய விளம்பரங்களை காண்பிக்கவும்',
      'குடிமை புதுப்பிப்புகள் பற்றி அறிவிப்புகள் அனுப்பவும்',
      'ஸ்பேம், துர்பயன்பாடு மற்றும் தவறான தகவல்களை கண்டறியவும்',
      'தளப் பயன்பாட்டை புரிந்துகொள்ள அநாமதேய பகுப்பாய்வு',
    ],
  },
  {
    id: 'adsense',
    en: 'Google AdSense & Advertising',
    ta: 'Google AdSense மற்றும் விளம்பரம்',
    content_en: 'We use Google AdSense to display advertisements on NammaTN. Google AdSense uses cookies to serve ads based on your prior visits to our website and other websites on the internet. The use of advertising cookies enables Google and its partners to serve ads based on your visit to our site and/or other sites on the Internet.',
    content_ta: 'NammaTN-ல் விளம்பரங்களை காண்பிக்க Google AdSense பயன்படுத்துகிறோம். Google AdSense உங்கள் முந்தைய வலைத்தள வருகைகளின் அடிப்படையில் விளம்பரங்களை வழங்க குக்கீகளை பயன்படுத்துகிறது.',
    link: { url: 'https://adssettings.google.com', text_en: 'Opt out of personalised advertising →', text_ta: 'தனிப்பயனாக்கப்பட்ட விளம்பரங்களிலிருந்து வெளியேறு →' },
  },
  {
    id: 'analytics',
    en: 'Google Analytics',
    ta: 'Google Analytics',
    content_en: 'We use Google Analytics to understand how visitors use NammaTN. Google Analytics collects data about your visits anonymously. Your IP address is anonymised before it is sent to Google. You can opt out by installing the Google Analytics Opt-out Browser Add-on.',
    content_ta: 'NammaTN-ஐ பார்வையாளர்கள் எவ்வாறு பயன்படுத்துகிறார்கள் என்பதை புரிந்துகொள்ள Google Analytics பயன்படுத்துகிறோம். தரவு அநாமதேயமாக சேகரிக்கப்படுகிறது.',
  },
  {
    id: 'cookies',
    en: 'Cookies',
    ta: 'குக்கீகள்',
    items_en: [
      'Essential cookies: keep you logged in and remember your language preference',
      'Analytics cookies: Google Analytics (anonymised usage data)',
      'Advertising cookies: Google AdSense (shown only with your consent)',
      'You can disable cookies in your browser settings at any time',
    ],
    items_ta: [
      'அத்தியாவசிய குக்கீகள்: உள்நுழைவை பராமரிக்கின்றன, மொழி விருப்பத்தை நினைவில் கொள்கின்றன',
      'பகுப்பாய்வு குக்கீகள்: Google Analytics (அநாமதேய தரவு)',
      'விளம்பர குக்கீகள்: Google AdSense (உங்கள் ஒப்புதலுடன் மட்டும்)',
      'உலாவி அமைப்புகளில் எந்த நேரத்திலும் குக்கீகளை முடக்கலாம்',
    ],
  },
  {
    id: 'data-sharing',
    en: 'Data Sharing',
    ta: 'தரவு பகிர்வு',
    content_en: 'We do NOT sell your personal data to any third party. We share data only with: Google (for Analytics and AdSense services), Supabase (our secure database provider). We may disclose information if required by law.',
    content_ta: 'நாங்கள் உங்கள் தனிப்பட்ட தரவை எந்த மூன்றாம் தரப்பினருக்கும் விற்கவில்லை. Google (Analytics மற்றும் AdSense), Supabase (தரவுத்தள வழங்குநர்) ஆகியோருடன் மட்டுமே பகிர்கிறோம்.',
  },
  {
    id: 'your-rights',
    en: 'Your Rights',
    ta: 'உங்கள் உரிமைகள்',
    items_en: [
      'Access: request a copy of the data we hold about you',
      'Correction: ask us to correct inaccurate personal information',
      'Deletion: request deletion of your account and associated data',
      'To exercise any right, email us at support@nammatn.in',
    ],
    items_ta: [
      'அணுகல்: உங்களைப் பற்றி வைத்திருக்கும் தரவின் நகலை கோருங்கள்',
      'திருத்தம்: தவறான தகவல்களை சரிசெய்யுமாறு கோருங்கள்',
      'நீக்கம்: உங்கள் கணக்கு மற்றும் தரவை நீக்குமாறு கோருங்கள்',
      'support@nammatn.in-க்கு மின்னஞ்சல் அனுப்புங்கள்',
    ],
  },
  {
    id: 'children',
    en: "Children's Privacy",
    ta: 'குழந்தைகளின் தனியுரிமை',
    content_en: 'NammaTN is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us data, please contact us immediately at support@nammatn.in.',
    content_ta: 'NammaTN 13 வயதிற்குட்பட்ட குழந்தைகளுக்காக வடிவமைக்கப்படவில்லை. 13 வயதிற்குட்பட்ட குழந்தைகளிடமிருந்து நாங்கள் தெரிந்தே தகவல் சேகரிப்பதில்லை.',
  },
  {
    id: 'changes',
    en: 'Changes to This Policy',
    ta: 'இந்த கொள்கையில் மாற்றங்கள்',
    content_en: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by displaying a prominent notice on our website. The date at the top of this policy indicates when it was last revised.',
    content_ta: 'இந்த தனியுரிமைக் கொள்கையை அவ்வப்போது புதுப்பிக்கலாம். குறிப்பிடத்தக்க மாற்றங்களை வலைத்தளத்தில் தெளிவான அறிவிப்பு மூலம் தெரிவிப்போம்.',
  },
];

export default function PrivacyPolicy() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === 'ta' ? ta : en;

  usePageMeta({
    title: T('Privacy Policy | NammaTN', 'தனியுரிமைக் கொள்கை | NammaTN'),
    description: T(
      'NammaTN Privacy Policy — how we collect, use, and protect your data. Includes Google AdSense and Analytics disclosure.',
      'NammaTN தனியுரிமைக் கொள்கை — Google AdSense மற்றும் Analytics உட்பட தரவு கொள்கை.'
    ),
    canonical: 'https://nammatn.in/privacy-policy',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-14 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            {T('Privacy Policy', 'தனியுரிமைக் கொள்கை')}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            {T(
              'We take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.',
              'உங்கள் தனியுரிமை எங்களுக்கு முக்கியம். இந்த கொள்கை நாங்கள் சேகரிக்கும் தரவையும் உங்கள் உரிமைகளையும் விளக்குகிறது.'
            )}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            📅 {T('Last updated: June 2025', 'கடைசியாக புதுப்பிக்கப்பட்டது: ஜூன் 2025')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Quick nav */}
        <nav className="mb-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3">
            {T('Table of Contents', 'உள்ளடக்க அட்டவணை')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ChevronRight className="w-3 h-3" />
                {i + 1}. {T(s.en, s.ta)}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, idx) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                {T(section.en, section.ta)}
              </h2>

              {section.content_en && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  {T(section.content_en, section.content_ta)}
                </p>
              )}

              {section.items_en && (
                <ul className="space-y-2 mt-2">
                  {(T(section.items_en, section.items_ta)).map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.link && (
                <a
                  href={section.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {T(section.link.text_en, section.link.text_ta)}
                </a>
              )}
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-indigo-600 rounded-2xl p-6 text-white text-center">
          <Mail className="w-8 h-8 mx-auto mb-3 opacity-80" />
          <h3 className="font-bold text-lg mb-2">
            {T('Questions about your privacy?', 'தனியுரிமை பற்றிய கேள்விகள்?')}
          </h3>
          <p className="text-indigo-100 text-sm mb-4">
            {T("We're happy to help.", 'நாங்கள் உதவ தயாராக உள்ளோம்.')}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="mailto:support@nammatn.in"
              className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors"
            >
              support@nammatn.in
            </a>
            <Link
              to="/contact"
              className="border border-white/50 text-white px-5 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              {T('Contact Page', 'தொடர்பு பக்கம்')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
