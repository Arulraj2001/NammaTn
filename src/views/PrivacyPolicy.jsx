'use client';
import React from 'react';
import { Link } from "@/lib/router-compat";
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Shield, Mail, ExternalLink, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'introduction',
    en: 'Introduction & Scope',
    ta: 'அறிமுகம் மற்றும் நோக்கம்',
    content_en: 'VizhiTN ("we", "us", or "our") is an independent, community-driven civic information and public dialogue platform accessible via vizhitn.in. This Privacy Policy outlines how we collect, process, and protect your information when you register, browse, or contribute to VizhiTN. We are a non-governmental initiative. By using our platform, you acknowledge and agree to the practices described in this policy. For any inquiries regarding your data, contact us at support@vizhitn.in.',
    content_ta: 'VizhiTN என்பது vizhitn.in வழியாக அணுகக்கூடிய ஒரு சுதந்திரமான, சமூகத்தால் இயக்கப்படும் குடிமைத் தகவல் மற்றும் பொது உரையாடல் தளமாகும். நீங்கள் VizhiTN இல் பதிவு செய்யும் போது, உலாவும்போது அல்லது பங்களிக்கும் போது உங்கள் தகவலை நாங்கள் எவ்வாறு சேகரிக்கிறோம், செயலாக்குகிறோம் மற்றும் பாதுகாக்கிறோம் என்பதை இந்த தனியுரிமைக் கொள்கை விளக்குகிறது. நாங்கள் ஒரு அரசு சாரா தளம். எங்கள் தளத்தைப் பயன்படுத்துவதன் மூலம், இந்த தனியுரிமைக் கொள்கையை நீங்கள் ஒப்புக்கொள்கிறீர்கள். உங்கள் தரவு தொடர்பான கேள்விகளுக்கு support@vizhitn.in என்ற மின்னஞ்சலில் எங்களைத் தொடர்பு கொள்ளவும்.'
  },
  {
    id: 'information-collected',
    en: 'Information We Collect',
    ta: 'நாங்கள் சேகரிக்கும் தகவல்கள்',
    items_en: [
      'Account Information: When you register (typically using Google Sign-In), we collect your name, email address, and profile photo. This helps us verify real users, prevent automated spam, and build a trusted community.',
      'Location Choices (Non-GPS): To filter local issues, emergency alerts, and district chats, you select your district and neighborhood. We do NOT track your device\'s precise live GPS location in the background.',
      'User-Generated Content: We store the text, photos, locations, scam alerts, comments, and messages you publish in our reports, directories, and live district chat rooms.',
      'Technical & Log Data: When you browse VizhiTN, our servers automatically log standard information, including your IP address, browser type, operating system, referring URL, pages viewed, and access timestamps.',
      'Cookies & Session Tokens: We use browser cookies and local storage to keep you securely signed in, remember your language setting (English/Tamil), and load your regional configuration.'
    ],
    items_ta: [
      'கணக்குத் தகவல்: நீங்கள் பதிவு செய்யும் போது (பொதுவாக Google Sign-In மூலம்), உங்கள் பெயர், மின்னஞ்சல் மற்றும் சுயவிவரப் புகைப்படத்தை சேகரிக்கிறோம். இது உண்மையான பயனர்களைச் சரிபார்க்கவும், ஸ்பேமைத் தடுக்கவும் உதவுகிறது.',
      'இருப்பிட விருப்பங்கள் (GPS அல்லாதவை): உங்கள் மாவட்டம் மற்றும் பகுதியை நீங்கள் கைமுறையாகத் தேர்வு செய்கிறீர்கள். உங்கள் சாதனத்தின் பின்னணி ஜிபிஎஸ் (GPS) இருப்பிடத்தை நாங்கள் கண்காணிப்பது இல்லை.',
      'பயனரால் உருவாக்கப்படும் உள்ளடக்கம்: நீங்கள் இடும் குடிமைப் புகார்கள், புகைப்படங்கள், மோசடி எச்சரிக்கைகள், கருத்துக்கள் மற்றும் நேரடி மாவட்ட அரட்டை செய்திகளைச் சேகரித்துச் சேமிக்கிறோம்.',
      'தொழில்நுட்ப மற்றும் பதிவுக் தரவு: நீங்கள் உலாவும்போது, உங்கள் ஐபி (IP) முகவரி, உலாவி வகை, இயக்க முறைமை, பார்வையிட்ட பக்கங்கள் மற்றும் நேரப் பதிவுகள் போன்ற நிலையான தகவல்களை எங்கள் சேவையகங்கள் தானாகவே பதிவு செய்கின்றன.',
      'குக்கீகள்: நீங்கள் எளிதாக உள்நுழைந்திருக்கவும், உங்கள் மொழி விருப்பத்தை (ஆங்கிலம்/தமிழ்) நினைவில் கொள்ளவும் குக்கீகள் மற்றும் உள்ளூர் சேமிப்பகங்களைப் பயன்படுத்துகிறோம்.'
    ]
  },
  {
    id: 'how-we-use',
    en: 'How We Use Your Information',
    ta: 'உங்கள் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்',
    items_en: [
      'To provide, maintain, and optimize our localized civic search, directory, and discussion features.',
      'To verify the legitimacy of community-reported civic issues and local scam alerts, helping filter out spam and false reports.',
      'To display relevant regional news and chat boards matching your selected district and area.',
      'To display advertisements served by Google AdSense to cover server hosting, database, and API costs.',
      'To monitor platform activity, resolve technical errors, and secure user databases against malicious hacking.',
      'To compile anonymous, aggregated statistics regarding search queries, portal visits, and scheme guides to improve user experience.'
    ],
    items_ta: [
      'உள்ளூர்மயமாக்கப்பட்ட குடிமைத் தேடல், கோப்புகள் மற்றும் விவாத அம்சங்களை வழங்க மற்றும் மேம்படுத்த.',
      'உள்ளூர் குடிமைப் புகார்கள் மற்றும் மோசடி எச்சரிக்கைகளின் நம்பகத்தன்மையைச் சரிபார்த்து, பொய்யான புகாரளிப்பைத் தடுக்க.',
      'நீங்கள் தேர்ந்தெடுத்த மாவட்டத்திற்குப் பொருந்தும் உள்ளூர்ச் செய்திகள் மற்றும் அரட்டைப் பலகைகளைக் காண்பிக்க.',
      'சேவையக ஹோஸ்டிங் மற்றும் தரவுத்தள செலவுகளை ஈடுகட்ட Google AdSense மூலமாக விளம்பரங்களைக் காண்பிக்க.',
      'தளத்தின் செயல்பாடுகளைக் கண்காணிக்க, தொழில்நுட்பப் பிழைகளைத் தீர்க்க மற்றும் பயனர் தரவுத்தளங்களைப் பாதுகாக்க.',
      'பயனர் அனுபவத்தை மேம்படுத்த தேடல்கள் மற்றும் வழிகாட்டிகளின் வருகைகள் பற்றிய அநாமதேய புள்ளிவிவரங்களைத் தொகுக்க.'
    ]
  },
  {
    id: 'google-adsense',
    en: 'Google AdSense & Advertising',
    ta: 'Google AdSense மற்றும் விளம்பரம்',
    content_en: 'We partner with Google AdSense to display non-intrusive advertisements on VizhiTN. Google, as a third-party vendor, uses cookies to serve ads on our site. Google\'s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to VizhiTN and/or other sites on the Internet. Users may opt out of personalized advertising at any time by visiting Google\'s Ads Settings. We do not control Google\'s ad selection algorithms or third-party cookies.',
    content_ta: 'VizhiTN இல் விளம்பரங்களைக் காண்பிக்க நாங்கள் Google AdSense உடன் இணைந்துள்ளோம். கூகுள் ஒரு மூன்றாம் தரப்பு வழங்குநராக விளம்பரங்களை வழங்க குக்கீகளைப் பயன்படுத்துகிறது. இதன் மூலம் பயனர்கள் இந்த இணையதளத்திற்கு அல்லது பிற இணையதளங்களுக்குச் சென்றதன் அடிப்படையில் தனிப்பயனாக்கப்பட்ட விளம்பரங்களைக் கூகுள் காட்டுகிறது. பயனர்கள் கூகுளின் விளம்பர அமைப்புகள் (Ads Settings) பக்கத்திற்குச் சென்று தனிப்பயனாக்கப்பட்ட விளம்பரங்களில் இருந்து எந்த நேரத்திலும் விலகலாம்.',
    link: { url: 'https://adssettings.google.com', text_en: 'Opt out of personalised advertising via Google Ads Settings →', text_ta: 'கூகுள் விளம்பர அமைப்புகள் மூலம் தனிப்பயனாக்கப்பட்ட விளம்பரங்களை முடக்கவும் →' }
  },
  {
    id: 'google-analytics',
    en: 'Google Analytics & Site Traffic',
    ta: 'Google Analytics மற்றும் தளப் போக்குவரத்து',
    content_en: 'To understand user flows and optimize usability, we use Google Analytics. Google Analytics collects anonymous browser information, screen resolutions, session durations, and pages viewed. IP address anonymization is enabled by default on VizhiTN, meaning your complete IP address is never stored or processed by Google. You can disable this analytics tracking in your browser settings or install the Google Analytics Opt-out browser extension.',
    content_ta: 'பயனர்கள் தளத்தை எவ்வாறு பயன்படுத்துகிறார்கள் என்பதைப் புரிந்துகொள்ள Google Analytics ஐப் பயன்படுத்துகிறோம். இது முற்றிலும் அநாமதேய உலாவித் தகவல்கள், அமர்வு கால அளவுகள் மற்றும் பார்வையிட்ட பக்கங்களை மட்டுமே சேகரிக்கிறது. VizhiTN இல் ஐபி முகவரி அநாமதேயமாக்கல் (IP Anonymization) செயல்படுத்தப்பட்டுள்ளது, எனவே உங்கள் முழுமையான ஐபி முகவரியைக் கூகுள் சேமிக்காது.'
  },
  {
    id: 'supabase-storage',
    en: 'Secure Data Storage (Supabase)',
    ta: 'பாதுகாப்பான தரவுச் சேமிப்பு (Supabase)',
    content_en: 'Our user databases and authentication services are hosted securely using Supabase, an industry-standard open-source backend-as-a-service provider. Supabase employs strong encryption protocols for data in transit (SSL/TLS) and data at rest. By creating an account, you acknowledge that your profile identifiers and submitted civic content are securely written to and maintained on Supabase’s servers.',
    content_ta: 'எங்கள் பயனர் தரவுத்தளம் மற்றும் அங்கீகாரச் சேவைகள் Supabase என்ற பாதுகாப்பான மேகக்கணித் தரவுத்தள வழங்குநரின் சேவையகங்களில் ஹோஸ்ட் செய்யப்படுகின்றன. Supabase தரவுப் பரிமாற்றங்களின் போதும் சேமிப்பில் உள்ள போதும் வலுவான குறியாக்க முறைகளைப் பயன்படுத்துகிறது. கணக்கை உருவாக்குவதன் மூலம், உங்கள் சுயவிவரம் மற்றும் நீங்கள் சமர்ப்பிக்கும் உள்ளடக்கம் Supabase சேவையகங்களில் சேமிக்கப்படுவதை ஒப்புக்கொள்கிறீர்கள்.'
  },
  {
    id: 'data-retention',
    en: 'Data Retention & Account Deletion',
    ta: 'தரவுத் தக்கவைப்பு மற்றும் கணக்கு நீக்கம்',
    content_en: 'We retain your personal data (name, email, profile picture) for as long as your VizhiTN account is active. If you choose to delete your account, your personal identifying records are permanently purged from our databases. To maintain the historical continuity of community boards, any civic reports, photo evidence, and public discussion comments you posted will remain visible but will be permanently anonymized and labeled as "Deleted User" to protect your privacy.',
    content_ta: 'உங்கள் VizhiTN கணக்கு செயலில் இருக்கும் வரை மட்டுமே உங்கள் தனிப்பட்ட தரவை (பெயர், மின்னஞ்சல், சுயவிவரப் படம்) நாங்கள் சேமித்து வைப்போம். உங்கள் கணக்கை நீக்க நீங்கள் தேர்வுசெய்தால், உங்கள் அடையாளத் தரவுகள் எங்கள் தரவுத்தளத்திலிருந்து நிரந்தரமாக அழிக்கப்படும். இருப்பினும், சமூக விவாதங்களின் தொடர்ச்சியைப் பாதுகாக்க, நீங்கள் பதிவிட்ட குடிமைப் புகார்கள் மற்றும் கருத்துகள் பொதுப் பார்வையில் இருக்கும், ஆனால் அவை முற்றிலும் அநாமதேயமாக்கப்பட்டு "Deleted User" எனக் குறிக்கப்படும்.'
  },
  {
    id: 'user-rights',
    en: 'Your Rights & Data Portability',
    ta: 'உங்கள் உரிமைகள் மற்றும் தரவுக் கட்டுப்பாடு',
    items_en: [
      'Right to Access: You can request a digital file of all personal data we hold about you.',
      'Right to Correction: You can request that we update or rectify any inaccurate personal details.',
      'Right to Deletion: You can request the permanent deletion of your account and personal identifiers by emailing us.',
      'To exercise any of these rights, please email us directly at support@vizhitn.in, specifying your registered email address.'
    ],
    items_ta: [
      'அணுகும் உரிமை: உங்களுடைய சேமிக்கப்பட்ட தனிப்பட்ட தரவுகளின் நகலைக் கோர உங்களுக்கு உரிமை உண்டு.',
      'திருத்தும் உரிமை: தவறான தனிப்பட்ட விவரங்களைத் திருத்துமாறு நீங்கள் எங்களைக் கோரலாம்.',
      'நீக்கும் உரிமை: எங்களுக்கு மின்னஞ்சல் அனுப்புவதன் மூலம் உங்கள் கணக்கு மற்றும் தனிப்பட்ட தரவை நிரந்தரமாக நீக்குமாறு கோரலாம்.',
      'இந்த உரிமைகளைப் பயன்படுத்த, உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரியைக் குறிப்பிட்டு support@vizhitn.in என்ற மின்னஞ்சலில் எங்களைத் தொடர்பு கொள்ளவும்.'
    ]
  },
  {
    id: 'children-privacy',
    en: 'Children\'s Privacy',
    ta: 'குழந்தைகளின் தனியுரிமை',
    content_en: 'VizhiTN does not target or knowingly collect personal information from children under 13 years of age. If you are a parent or guardian and believe that your child under 13 has registered an account or provided personal details without consent, please notify us immediately at support@vizhitn.in so we can verify and delete the information.',
    content_ta: 'VizhiTN 13 வயதிற்குட்பட்ட குழந்தைகளிடமிருந்து தெரிந்தே எந்தவொரு தனிப்பட்ட தகவலையும் சேகரிப்பது இல்லை. 13 வயதிற்குட்பட்ட ஒரு குழந்தை அனுமதி இல்லாமல் பதிவு செய்துள்ளார் என நீங்கள் கருதினால், உடனடியாக support@vizhitn.in என்ற மின்னஞ்சலில் எங்களை அணுகவும்; நாங்கள் அதை நீக்க நடவடிக்கை எடுப்போம்.'
  },
  {
    id: 'policy-changes',
    en: 'Changes to This Privacy Policy',
    ta: 'இந்த தனியுரிமைக் கொள்கையில் மாற்றங்கள்',
    content_en: 'We may revise this Privacy Policy periodically to adapt to changing legal requirements or platform updates. The "Last Updated" date at the top of this page will reflect the latest revision. We encourage you to review this policy periodically to stay informed about how we safeguard citizen data.',
    content_ta: 'சட்டத் தேவைகள் அல்லது மாற்றங்களின் அடிப்படையில் இந்த கொள்கையை நாங்கள் அவ்வப்போது புதுப்பிக்கலாம். புதுப்பிக்கப்பட்ட தேதி பக்கத்தின் மேலே குறிக்கப்படும். நாங்கள் எவ்வாறு உங்கள் தரவைப் பாதுகாக்கிறோம் என்பதை அறிய இந்த தனியுரிமைக் கொள்கையை அவ்வப்போது பார்க்குமாறு பரிந்துரைக்கிறோம்.'
  }
];

export default function PrivacyPolicy() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === 'ta' ? ta : en;

  usePageMeta({
    title: T('Privacy Policy | VizhiTN', 'தனியுரிமைக் கொள்கை | VizhiTN'),
    description: T(
      'VizhiTN Privacy Policy — details on data collection, selective location usage, cookies, Google AdSense & Analytics disclosures, and account deletion rights.',
      'VizhiTN தனியுரிமைக் கொள்கை — தரவு சேகரிப்பு, குக்கீகள், Google AdSense & Analytics அறிவிப்புகள் மற்றும் தரவு நீக்க உரிமைகள்.'
    ),
    canonical: 'https://www.vizhitn.in/privacy-policy',
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
              'We respect your privacy and are committed to clear, honest data practices. Find detailed disclosures about cookies, ads, and your data rights below.',
              'நாங்கள் உங்கள் தனியுரிமையை மதிக்கிறோம். குக்கீகள், விளம்பரங்கள் மற்றும் தரவு உரிமைகள் பற்றிய விரிவான விவரங்களை கீழே கண்டறியவும்.'
            )}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            📅 {T('Last updated: June 18, 2026', 'கடைசியாக புதுப்பிக்கப்பட்டது: ஜூன் 18, 2026')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Quick nav */}
        <nav className="mb-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-850">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3">
            {T('Table of Contents', 'உள்ளடக்க அட்டவணை')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                {i + 1}. {T(s.en, s.ta)}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section, idx) => (
            <section key={section.id} id={section.id} className="scroll-mt-20 border-b border-slate-100 dark:border-slate-800 pb-8 last:border-0 last:pb-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                {T(section.en, section.ta)}
              </h2>

              {section.content_en && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-850">
                  {T(section.content_en, section.content_ta)}
                </p>
              )}

              {section.items_en && (
                <ul className="space-y-3 mt-3">
                  {(T(section.items_en, section.items_ta)).map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.link && (
                <a
                  href={section.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
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
            {T("We are dedicated to safeguarding community data. Feel free to reach out.", 'சமூகத் தரவைப் பாதுகாக்க நாங்கள் கடமைப்பட்டுள்ளோம். தாராளமாக எங்களைத் தொடர்பு கொள்ளலாம்.')}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="mailto:support@vizhitn.in"
              className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors"
            >
              support@vizhitn.in
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
