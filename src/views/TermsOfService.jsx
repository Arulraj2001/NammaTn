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
    content_en: 'By accessing, registering, or using VizhiTN at vizhitn.in, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must immediately cease using the platform. These terms apply to all visitors, registered users, and others who access or use the platform.',
    content_ta: 'vizhitn.in என்ற இணையதள முகவரியில் VizhiTN ஐ அணுகுவதன், பதிவு செய்வதன் அல்லது பயன்படுத்துவதன் மூலம், இந்த சேவை விதிமுறைகளை நீங்கள் ஏற்றுக்கொள்கிறீர்கள். இந்த விதிமுறைகளுடன் நீங்கள் உடன்படவில்லை எனில், தளத்தைப் பயன்படுத்துவதை உடனடியாக நிறுத்த வேண்டும்.'
  },
  {
    num: '2',
    en: 'Independent Status (Non-Government Disclaimer)',
    ta: 'சுதந்திரமான தளம் (அரசு சாரா தளம்)',
    content_en: 'VizhiTN is an independent, community-driven civic information and public dialogue platform. We are NOT associated, affiliated, authorized, endorsed by, or in any way officially connected with the Government of Tamil Nadu, the Government of India, or any municipal corporation, government department, or public utility provider. VizhiTN is a private public-interest project. Filing a report or creating a Civic Receipt on VizhiTN does NOT constitute lodging a formal or legal complaint with government authorities. For official grievances, users must use designated government portals (such as e-Sevai, TNEB, and CM Grievance portals).',
    content_ta: 'VizhiTN என்பது ஒரு சுதந்திரமான, சமூகத்தால் இயக்கப்படும் குடிமைத் தகவல் மற்றும் பொது உரையாடல் தளமாகும். நாங்கள் தமிழ்நாடு அரசு, இந்திய அரசு அல்லது எந்தவொரு மாநகராட்சி மற்றும் அரசுத் துறைகளுடனும் தொடர்புடையவர்கள் அல்ல. VizhiTN ஒரு தனிப்பட்ட பொதுநலத் திட்டமாகும். VizhiTN இல் ஒரு சிக்கலைப் புகாரளிப்பது அதிகாரப்பூர்வ அரசுப் புகாராகக் கருதப்படாது. முறையான அரசுப் புகார்களுக்கு, பயனர்கள் நியமிக்கப்பட்ட அரசு இணையதளங்களை மட்டுமே பயன்படுத்த வேண்டும்.'
  },
  {
    num: '3',
    en: 'Eligibility & Account Security',
    ta: 'தகுதி மற்றும் கணக்கு பாதுகாப்பு',
    content_en: 'VizhiTN is intended for users who are at least 13 years of age. If you are under 18, you represent that you have parental or guardian consent to use the platform. When registering (typically via Google Sign-In), you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your profile. You agree to notify us immediately of any unauthorized access at support@vizhitn.in.',
    content_ta: 'VizhiTN 13 அல்லது அதற்கு மேற்பட்ட வயதுடைய பயனர்களுக்காக வடிவமைக்கப்பட்டுள்ளது. 18 வயதுக்குட்பட்டவர்கள் எனில், தங்களின் பெற்றோர் அல்லது பாதுகாவலரின் அனுமதியைப் பெற்றிருப்பதை உறுதி செய்கிறீர்கள். உங்கள் கணக்கைப் பதிவு செய்யும் போது, அதன் பாதுகாப்பு மற்றும் நடக்கும் அனைத்துச் செயல்பாடுகளுக்கும் நீங்களே முழுப் பொறுப்பாவீர்கள். ஏதேனும் அங்கீகரிக்கப்படாத அணுகலைக் கண்டறிந்தால் support@vizhitn.in என்ற மின்னஞ்சலுக்குத் தெரிவிக்கவும்.'
  },
  {
    num: '4',
    en: 'Community Guidelines & Prohibited Content',
    ta: 'சமூக வழிகாட்டுதல்கள் மற்றும் தடைசெய்யப்பட்ட உள்ளடக்கம்',
    items_en: [
      'Deliberately False Information: Submitting fabricated, staging, or intentionally misleading civic reports or scam alerts.',
      'Hate Speech & Abuse: Posting content that attacks or incites violence against individuals or groups based on caste, religion, gender, race, language, or community.',
      'Harassment: Targeted cyberbullying, doxxing, personal attacks, or defamation of other users, residents, or public servants.',
      'Obscenity: Adult, sexually explicit, or sexually inappropriate text, images, or links.',
      'Commercial Spam: Unauthorized advertisements, affiliate marketing, promotional campaigns, or repetitive bot-generated comments.',
      'Impersonation: Pretending to be another user, celebrity, government officer, or public servant.',
      'Illegal Activities: Promoting banned substances, illegal actions, or sharing instructions on breaking applicable laws.'
    ],
    items_ta: [
      'பொய்யான தகவல்கள்: வேண்டுமென்றே உண்மைக்கு புறம்பான, ஜோடிக்கப்பட்ட அல்லது தவறான குடிமைப் புகார்கள் மற்றும் மோசடி எச்சரிக்கைகளை உருவாக்குவது.',
      'வெறுப்புப் பேச்சு: சாதி, மதம், பாலினம், இனம் அல்லது மொழியின் அடிப்படையில் வன்முறையைத் தூண்டும் அல்லது அவமதிக்கும் உள்ளடக்கங்களை இடுவது.',
      'துன்புறுத்தல்: பிற பயனர்கள், பொதுமக்கள் அல்லது அரசுப் பணியாளர்களைத் தரம் தாழ்ந்து தாக்குவது, தனிப்பட்ட விவரங்களை வெளியிடுவது அல்லது அவதூறு பரப்புவது.',
      'பாதுகாப்பற்ற உள்ளடக்கம்: ஆபாசமான அல்லது பாலியல் சார்ந்த படங்கள், கருத்துக்கள் அல்லது இணைப்புகளைப் பகிர்வது.',
      'வணிக ஸ்பேம்: தளத்தின் அனுமதியின்றி விளம்பரங்கள் செய்வது, ஸ்பேம் அல்லது மீண்டும் மீண்டும் ஒரே கருத்துகளை இடுவது.',
      'ஆள்மாறாட்டம்: பிற பயனர், பிரமுகர் அல்லது அரசு அதிகாரிகள் போலப் போலியாக நடிப்பது.',
      'சட்டவிரோத செயல்கள்: தடைசெய்யப்பட்ட பொருட்கள் அல்லது சட்டவிரோத செயல்களை ஊக்குவிக்கும் தகவல்களைப் பரப்புவது.'
    ]
  },
  {
    num: '5',
    en: 'Civic Report Submissions & Content Accuracy',
    ta: 'குடிமைப் புகார்கள் மற்றும் உள்ளடக்கத் துல்லியம்',
    content_en: 'When you submit a civic report or create a Civic Receipt on VizhiTN, you represent that you have personally witnessed or verified the issue, and that the media (such as photos) and descriptions you provide are accurate and truthful. Submitting deliberately false or exaggerated reports damages community trust and may result in immediate account suspension.',
    content_ta: 'VizhiTN இல் நீங்கள் ஒரு குடிமை ரசீதை உருவாக்கும்போது, அந்த சிக்கலை நீங்கள் நேரில் கண்டறிந்து சரிபார்த்துள்ளீர்கள் என்பதையும், நீங்கள் வழங்கும் விவரங்கள் மற்றும் புகைப்படங்கள் உண்மை என்பதையும் உறுதிப்படுத்துகிறீர்கள். வேண்டுமென்றே தவறான புகாரை அளிப்பது சமூகத்தின் நம்பிக்கையைக் கெடுக்கும், இதனால் உங்கள் கணக்கு முடக்கப்படலாம்.'
  },
  {
    num: '6',
    en: 'No Guarantee of Government Action',
    ta: 'அரசு நடவடிக்கைக்கு உத்தரவாதம் இல்லை',
    content_en: 'VizhiTN is a private community tracking tool. We provide a space for documentation and public awareness, but we do NOT guarantee that any government department, municipal corporation, official, or public worker will view, respond to, or resolve the issues reported on this platform. We are not responsible for the speed, quality, or absence of governmental response or repair action.',
    content_ta: 'VizhiTN என்பது ஒரு தனிப்பட்ட சமூக கண்காணிப்பு தளம் மட்டுமே. ஆவணப்படுத்துவதற்கும் சமூக விழிப்புணர்வுக்கும் மட்டுமே நாங்கள் இடத்தை வழங்குகிறோம். இந்தத் தளத்தில் புகாரளிக்கப்படும் சிக்கல்களை அரசுத் துறைகளோ அல்லது நகராட்சியோ பார்வையிடும், பதிலளிக்கும் அல்லது தீர்க்கும் என்பதற்கு நாங்கள் எந்தவித உத்தரவாதமும் வழங்கவில்லை.'
  },
  {
    num: '7',
    en: 'User Content License & Ownership',
    ta: 'உள்ளடக்க உரிமம் மற்றும் உரிமை',
    content_en: 'You retain all intellectual property rights and ownership of the text, photographs, and other materials you post on VizhiTN. However, by uploading content, you grant VizhiTN a worldwide, non-exclusive, royalty-free, transferable, and perpetual license to host, display, copy, format, distribute, translate, and archive your content on the platform to serve its public-interest goals. You can delete your posts at any time, but you acknowledge that search engines may index and cache pages independently.',
    content_ta: 'VizhiTN இல் நீங்கள் பதிவிடும் உரை, புகைப்படங்கள் போன்றவற்றின் அறிவுசார் சொத்துரிமை உங்களுக்கே சொந்தமானது. இருப்பினும், உள்ளடக்கத்தைப் பதிவிடுவதன் மூலம், அதைத் தளத்தில் ஹோஸ்ட் செய்யவும், காண்பிக்கவும், நகலெடுக்கவும், பொது நல நோக்கங்களுக்காகப் பயன்படுத்தவும் VizhiTN க்கு உலகளாவிய, இலவச உரிமத்தை வழங்குகிறீர்கள். உங்கள் இடுகைகளை நீங்கள் எப்போது வேண்டுமானாலும் நீக்கலாம்.'
  },
  {
    num: '8',
    en: 'Moderation and Right to Remove Content',
    ta: 'மதிப்பீட்டு முறை மற்றும் உள்ளடக்கத்தை நீக்கும் உரிமை',
    content_en: 'VizhiTN reserves the right, but does not assume the obligation, to monitor, review, edit, or permanently delete user-generated content that we determine in our sole discretion violates these Terms, harms community interests, or violates safety guidelines. We utilize peer-reporting flags to identify problematic content for moderation.',
    content_ta: 'இந்த சேவை விதிமுறைகளை மீறும், சமூக நலனுக்கு ஊறு விளைவிக்கும் அல்லது பாதுகாப்பு வழிகாட்டுதல்களை மீறும் உள்ளடக்கங்களை எங்கள் சொந்த முடிவின்படி கண்காணிக்கவும், திருத்தவும் அல்லது நிரந்தரமாக நீக்கவும் VizhiTN க்கு உரிமை உண்டு.'
  },
  {
    num: '9',
    en: 'Security & Misuse Policies',
    ta: 'பாதுகாப்பு மற்றும் துஷ்பிரயோகக் கொள்கைகள்',
    content_en: 'You are strictly prohibited from attempting to compromise the security of VizhiTN. This includes deploying automated crawlers, scrapers, indexers, or bots to harvest user data; attempting to disrupt database operations hosted on Supabase; sending mass requests to platform APIs; or introducing viruses or malicious code. Violating platform security will lead to legal action and cooperation with cybersecurity authorities.',
    content_ta: 'VizhiTN இன் பாதுகாப்பைக் குலைக்கும் செயல்களில் ஈடுபடுவது கடுமையான தடையாகும். தானியங்கி பாட்டுகள் (bots), ஸ்கிராப்பர்கள் மூலமாகப் பயனர் தரவைச் சேகரிப்பதோ, Supabase தரவுத்தளத்தின் செயல்பாடுகளைத் தடுப்பதோ, வைரஸ்கள் மற்றும் தீங்கிழைக்கும் நிரல்களை அனுப்புவதோ சட்டப்படி குற்றமாகும்.'
  },
  {
    num: '10',
    en: 'Limitation of Liability',
    ta: 'பொறுப்பு வரம்பு',
    content_en: 'To the maximum extent permitted by law, VizhiTN, its founders, and operators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of, or inability to use, the platform. This includes reliance on user-submitted civic reports, scam alerts, directories, or the resolution status of reported local issues.',
    content_ta: 'சட்டப்பூர்வமாக அனுமதிக்கப்பட்ட வரம்பிற்குட்பட்டு, இந்தத் தளத்தைப் பயன்படுத்துவதால் அல்லது பயன்படுத்த இயலாமல் போவதால் ஏற்படும் எந்தவொரு நேரடி, மறைமுக, தற்செயலான அல்லது விளைவான சேதங்களுக்கும் VizhiTN, அதன் உருவாக்குநர்கள் மற்றும் நிர்வாகிகள் பொறுப்பாக மாட்டார்கள்.'
  },
  {
    num: '11',
    en: 'Account Suspension & Termination',
    ta: 'கணக்கு இடைநீக்கம் மற்றும் நிறுத்தம்',
    content_en: 'We reserve the right to temporarily suspend or permanently terminate your account and restrict your access to VizhiTN without prior notice if you repeatedly violate these Terms, engage in fraudulent activity, submit false reports, or engage in behavior harmful to other users.',
    content_ta: 'இந்த விதிமுறைகளைத் தொடர்ந்து மீறினாலோ, ஏமாற்று வேலைகளில் ஈடுபட்டாலோ, போலிப் புகார்களை அளித்தாலோ அல்லது பிறருக்குத் தீங்கு விளைவிக்கும் வகையில் நடந்துகொண்டாலோ, முன்னறிவிப்பின்றி உங்கள் கணக்கை தற்காலிகமாகவோ அல்லது நிரந்தரமாகவோ முடக்க எங்களுக்கு உரிமை உண்டு.'
  },
  {
    num: '12',
    en: 'Governing Law & Dispute Resolution',
    ta: 'நிர்வகிக்கும் சட்டம் மற்றும் அதிகார வரம்பு',
    content_en: 'These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, claim, or action arising from or related to these Terms or your use of VizhiTN shall be subject to the exclusive jurisdiction of the competent courts located in Chennai, Tamil Nadu.',
    content_ta: 'இந்த சேவை விதிமுறைகள் இந்தியக் குடியரசின் சட்டங்களுக்கு உட்பட்டு நிர்வகிக்கப்படும். இந்த விதிமுறைகள் அல்லது VizhiTN பயன்பாடு தொடர்பான ஏதேனும் சட்டரீதியான தகராறுகள் அல்லது உரிமைகோரல்கள் சென்னை, தமிழ்நாட்டில் உள்ள நீதிமன்றங்களின் அதிகார வரம்பிற்கு உட்பட்டது.'
  },
  {
    num: '13',
    en: 'Contact Information',
    ta: 'தொடர்பு தகவல்',
    content_en: 'If you have any questions or clarifications regarding these Terms of Service, please reach out to us at support@vizhitn.in.',
    content_ta: 'இந்த சேவை விதிமுறைகள் குறித்து ஏதேனும் கேள்விகள் அல்லது விளக்கங்கள் இருந்தால், எங்களை support@vizhitn.in என்ற மின்னஞ்சலில் தொடர்பு கொள்ளவும்.'
  }
];

function TermSection({ section, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-205 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
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
        <div className="px-4 sm:px-5 pb-5 pt-2 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
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
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center justify-center text-[10px] font-bold mt-0.5">✗</span>
                  <span className="leading-relaxed">{item}</span>
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
    title: T('Terms of Service | VizhiTN', 'சேவை விதிமுறைகள் | VizhiTN'),
    description: T(
      'VizhiTN Terms of Service — read our rules for using the civic platform, content guidelines, disclaimers, and user licensing.',
      'VizhiTN சேவை விதிமுறைகள் — குடிமைத் தளத்தைப் பயன்படுத்துவதற்கான விதிகள், பொறுப்புத் துறப்புகள் மற்றும் உரிம வழிகாட்டிகள்.'
    ),
    canonical: 'https://vizhitn.in/terms',
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
              'These terms govern your use of VizhiTN. Please review them to understand your rights and guidelines as a platform contributor.',
              'இந்த விதிமுறைகள் VizhiTN இன் பயன்பாட்டை நிர்வகிக்கின்றன. தளப் பங்களிப்பாளராக உங்கள் உரிமைகள் மற்றும் விதிகளை அறிய இதைப் படியுங்கள்.'
            )}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-white/10 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium">
            📅 {T('Last updated: June 18, 2026', 'கடைசியாக புதுப்பிக்கப்பட்டது: ஜூன் 18, 2026')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
          ⚠️ {T(
            'VizhiTN is an independent, community-driven civic platform, not a government website. By accessing or using this website, you agree to these Terms.',
            'VizhiTN ஒரு சுதந்திரமான, சமூக அடிப்படையிலான குடிமைத் தளம் ஆகும், இது அரசு இணையதளம் அல்ல. தளத்தைப் பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகளை ஒப்புக்கொள்கிறீர்கள்.'
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
            {T('Questions?', 'கேள்விகள் உள்ளதா?')}{' '}
            <a href="mailto:support@vizhitn.in" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              support@vizhitn.in
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
