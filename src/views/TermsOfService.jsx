'use client';
import React, { useState } from 'react';
import { Link } from "@/lib/router-compat";
import { useLanguage } from '@/context/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSettingsMap } from '@/services/admin/settings';

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
    en: 'Nature of Platform — Non-Governmental Disclaimer',
    ta: 'தளத்தின் இயல்பு — அரசு சாரா அறிவிப்பு',
    content_en: 'VizhiTN is an independent, community-driven civic proof and public information platform. VizhiTN IS NOT AFFILIATED WITH, ENDORSED BY, OR AN OFFICIAL REPRESENTATIVE OF THE GOVERNMENT OF TAMIL NADU, THE GOVERNMENT OF INDIA, OR ANY LOCAL MUNICIPAL CORPORATION OR PANCHAYAT. Civic Receipts generated on VizhiTN are persistent public records created by platform users for transparency and evidence tracking purposes. They do not constitute official government filings, legal notices, or administrative complaints unless formally submitted through government channels (such as CM Cell, e-District, or official municipal portals).',
    content_ta: 'VizhiTN என்பது ஒரு சுதந்திரமான, சமூக அடிப்படையிலான குடிமைப் பதிவுத் தளமாகும். VizhiTN தமிழ்நாடு அரசு, இந்திய அரசு அல்லது எந்தவொரு உள்ளூர் நகராட்சி அல்லது பஞ்சாயத்துடன் இணைக்கப்படவில்லை அல்லது அதிகாரப்பூர்வ பிரதிநிதி அல்ல. VizhiTN இல் உருவாக்கப்படும் குடிமை ரசீதுகள் பயனர்களால் உருவாக்கப்படும் பொதுப் பதிவுகள் ஆகும். அவை அதிகாரப்பூர்வ அரசுப் பதிவுகள் அல்ல.'
  },
  {
    num: '3',
    en: 'Eligibility & User Accounts',
    ta: 'தகுதி மற்றும் பயனர் கணக்குகள்',
    content_en: 'VizhiTN is intended for users who are at least 13 years of age. If you are under 18, you represent that you have parental or guardian consent to use the platform. When registering (typically via Google Sign-In), you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your profile. You agree to notify us immediately of any unauthorized access.',
    content_ta: 'VizhiTN 13 அல்லது அதற்கு மேற்பட்ட வயதுடைய பயனர்களுக்காக வடிவமைக்கப்பட்டுள்ளது. 18 வயதுக்குட்பட்டவர்கள் எனில், தங்களின் பெற்றோர் அல்லது பாதுகாவலரின் அனுமதியைப் பெற்றிருப்பதை உறுதி செய்கிறீர்கள். உங்கள் கணக்கைப் பதிவு செய்யும் போது, அதன் பாதுகாப்பு மற்றும் நடக்கும் அனைத்துச் செயல்பாடுகளுக்கும் நீங்களே முழுப் பொறுப்பாவீர்கள்.'
  },
  {
    num: '4',
    en: 'Community Content Standards & Prohibited Conduct',
    ta: 'சமூக உள்ளடக்கத் தரநிலைகள் & தடைசெய்யப்பட்ட நடத்தைகள்',
    content_en: 'To maintain a trusted, constructive platform for neighborhood issues, users must adhere to community standards. You agree NOT to post:',
    content_ta: 'நம்பகமான, ஆக்கபூர்வமான தளத்தைப் பராமரிக்க, பயனர்கள் பின்வருவனவற்றைப் பதிவிடக்கூடாது என ஒப்புக்கொள்கிறார்கள்:',
    items_en: [
      'False, fabricated, or intentionally misleading civic reports or photo evidence.',
      'Defamatory statements targeting specific individuals, private properties, or businesses.',
      'Personal attacks, hate speech, threats, harassment, or incitement to violence.',
      'Sexually explicit material, graphic violence, or illegal content.',
      'Commercial spam, unauthorized promotional links, or automated submissions.',
      'Personal sensitive data of third parties (DOXXing) such as phone numbers, home addresses, or financial details.'
    ],
    items_ta: [
      'பொய்யான, புனையப்பட்ட அல்லது வேண்டுமென்றே தவறாக வழிநடத்தும் குடிமைப் புகார்கள் அல்லது புகைப்பட ஆதாரங்கள்.',
      'குறிப்பிட்ட தனிநபர்கள், தனியார் சொத்துக்கள் அல்லது வணிகங்களை இலக்காகக் கொண்ட அவதூறு கூற்றுகள்.',
      'தனிநபர் தாக்குதல்கள், வெறுப்புப் பேச்சுகள், அச்சுறுத்தல்கள், துன்புறுத்தல்கள் அல்லது வன்முறைத் தூண்டுதல்கள்.',
      'அபாச உள்ளடக்கம், வன்முறை அல்லது சட்டவிரோத உள்ளடக்கம்.',
      'வணிக ஸ்பேம் அல்லது தானியங்கி சமர்ப்பிப்புகள்.',
      'தொலைபேசி எண்கள், வீட்டு முகவரிகள் போன்ற மூன்றாம் தரப்பினரின் தனிப்பட்ட முக்கியமான தரவுகள்.'
    ]
  },
  {
    num: '5',
    en: 'Content Ownership & Public Licensing',
    ta: 'உள்ளடக்க உரிமையாளர் & பொது உரிமம்',
    content_en: 'You retain ownership of the text, photos, and media you submit to VizhiTN. However, by posting content on the platform (including Civic Receipts, discussions, questions, and scam alerts), you grant VizhiTN a non-exclusive, worldwide, royalty-free, perpetual, and transferable license to display, index, distribute, format, and share your content for public interest, indexing by search engines, community awareness, and media transparency.',
    content_ta: 'VizhiTN இல் நீங்கள் சமர்ப்பிக்கும் உரை, புகைப்படங்கள் மற்றும் ஊடகங்களின் உரிமையை நீங்கள் தக்க வைத்துக் கொள்கிறீர்கள். இருப்பினும், உள்ளடக்கத்தைப் பதிவிடுவதன் மூலம், அதை பொது நலன் மற்றும் தேடுபொறி இண்டெக்சிங்கிற்குப் பயன்படுத்த VizhiTN க்கு உலகளாவிய, இலவச உரிமத்தை வழங்குகிறீர்கள்.'
  },
  {
    num: '6',
    en: 'Public Archival & Anonymization Policy',
    ta: 'பொது ஆவணக் காப்பகம் & அநாமதேயக் கொள்கை',
    content_en: 'Civic Receipts and public community posts serve as historical records of neighborhood infrastructure status. If you delete your account, your personal identifying details (name, email, profile photo) are permanently purged from our systems. However, to preserve the historical integrity of community boards and resolution tracking, the public civic reports and comments you authored will remain visible, permanently anonymized and labeled as "Deleted User".',
    content_ta: 'குடிமை ரசீதுகள் மற்றும் பொதுச் சமூகப் பதிவுகள் உள்கட்டமைப்பு நிலையின் வரலாற்றுப் பதிவுகளாகப் செயல்படுகின்றன. உங்கள் கணக்கை நீக்கினால், உங்கள் தனிப்பட்ட அடையாள விவரங்கள் நிரந்தரமாக நீக்கப்படும். இருப்பினும், சமூகப் பலகைகளின் வரலாற்று நம்பகத்தன்மையைப் பாதுகாக்க, நீங்கள் எழுதிய பொது அறிக்கைகள் "நீக்கப்பட்ட பயனர்" என அநாமதேயமாக்கப்பட்டுத் தொடர்ந்து காணப்படும்.'
  },
  {
    num: '7',
    en: 'Content Moderation & Account Actions',
    ta: 'உள்ளடக்கத் தணிக்கை & கணக்கு നടപடிகள்',
    content_en: 'VizhiTN reserves the right, but has no obligation, to review, flag, edit, hide, or permanently remove any content that violates these Terms, receives multiple user flags, or compromises platform integrity. Accounts that repeatedly post false reports, spam, or abusive material may be suspended or permanently banned.',
    content_ta: 'இந்த விதிமுறைகளை மீறும், பல பயனர் புகார்களைப் பெறும் அல்லது தளத்தின் நம்பகத்தன்மையைப் பாதிக்கும் எந்தவொரு உள்ளடக்கத்தையும் மதிப்பாய்வு செய்ய, மறைக்க அல்லது நீக்க VizhiTN க்கு உரிமை உண்டு.'
  },
  {
    num: '8',
    en: 'Limitation of Liability',
    ta: 'பொறுப்பு வரம்பு',
    content_en: 'To the fullest extent permitted by applicable law, VizhiTN, its founders, operators, and contributors shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of your access to or use of (or inability to use) the platform, any errors or omissions in user-generated content, or any action taken by public authorities or third parties in response to posted reports.',
    content_ta: 'சட்டத்தால் அனுமதிக்கப்படும் முழு அளவிற்கு, VizhiTN, அதன் நிறுவனர்கள் மற்றும் நிர்வாகிகள், தளத்தைப் பயன்படுத்துவதால் ஏற்படும் எந்தவொரு நேரடி அல்லது மறைமுக இழப்புகளுக்கும் பொறுப்பாக மாட்டார்கள்.'
  },
  {
    num: '9',
    en: 'Disclaimer of Warranties',
    ta: 'உத்தரவாதங்களின் மறுப்பு',
    content_en: 'The VizhiTN platform and all content are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the platform will be uninterrupted, error-free, or entirely secure.',
    content_ta: 'VizhiTN தளம் மற்றும் அனைத்து உள்ளடக்கங்களும் எந்தவிதமான உத்தரவாதமும் இன்றி "உள்ளவாறே" வழங்கப்படுகின்றன.'
  },
  {
    num: '10',
    en: 'Third-Party Links & Advertisements',
    ta: 'மூன்றாம் தரப்பு இணைப்புகள் & விளம்பரங்கள்',
    content_en: 'VizhiTN may display links to official government portals, third-party services, and clean advertisements (including Google AdSense). We do not control or endorse the content, policies, or practices of any third-party websites. Accessing third-party links is at your own risk.',
    content_ta: 'VizhiTN அதிகாரப்பூர்வ அரசு போர்ட்டல்கள், மூன்றாம் தரப்பு சேவைகள் மற்றும் விளம்பரங்களுக்கான இணைப்புகளைக் காட்டலாம். எந்தவொரு மூன்றாம் தரப்பு தளங்களின் உள்ளடக்கத்தையும் நாங்கள் கட்டுப்படுத்தவோ அல்லது ஆதரிக்கவோ இல்லை.'
  },
  {
    num: '11',
    en: 'Modifications to Terms',
    ta: 'விதிமுறைகளில் மாற்றங்கள்',
    content_en: 'We reserve the right to update or modify these Terms at any time. Changes become effective immediately upon posting. Your continued use of VizhiTN following any updates constitutes your acceptance of the revised Terms.',
    content_ta: 'எந்த நேரத்திலும் இந்த விதிமுறைகளைப் புதுப்பிக்க அல்லது மாற்ற எங்களுக்கு உரிமை உண்டு. புதுப்பிப்புகளுக்குப் பிறகும் VizhiTN ஐத் தொடர்ந்து பயன்படுத்துவது மாற்றப்பட்ட விதிமுறைகளை ஏற்றுக்கொண்டதாகக் கருதப்படும்.'
  },
  {
    num: '12',
    en: 'Governing Law & Jurisdiction',
    ta: 'நிர்வகிக்கும் சட்டம் & এখ்தியார்',
    content_en: 'These Terms of Service are governed by and construed in accordance with the laws of India. Any legal disputes arising from or relating to the platform shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu, India.',
    content_ta: 'இந்த சேவை விதிமுறைகள் இந்தியச் சட்டங்களின்படி நிர்வகிக்கப்பட்டு நிர்வகிக்கப்படுகின்றன. தளத்தில் இருந்து возникаும் எந்தவொரு சட்ட தகராறுகளும் தமிழ்நாட்டின் நீதிமன்றங்களின் பிரத்யேக அதிகார வரம்பிற்கு உட்பட்டவை.'
  },
  {
    num: '13',
    en: 'Contact & Legal Inquiries',
    ta: 'தொடர்பு & சட்டப்பூர்வ விசாரணைகள்',
    content_en: 'If you have questions, feedback, or legal inquiries regarding these Terms of Service, please reach out to us via our',
    content_ta: 'இந்த சேவை விதிமுறைகள் குறித்து கேள்விகள் அல்லது சட்டப்பூர்வ விசாரணைகள் இருந்தால், எங்களை அணுகவும்:'
  }
];

function TermSection({ section, T }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
            {section.num}
          </span>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
            {T(section.en, section.ta)}
          </h3>
        </div>
        {open ? <ChevronDown className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 stroke-[2.5]" /> : <ChevronRight className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 stroke-[2.5]" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 bg-slate-50/70 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-800">
          {section.content_en && (
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {T(section.content_en, section.content_ta)}
              {section.num === '13' && (
                <>
                  {' '}<Link to="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{T('Contact page', 'தொடர்பு பக்கம்')}</Link>
                </>
              )}
            </p>
          )}
          {section.items_en && (
            <ul className="space-y-2.5 mt-3">
              {(T(section.items_en, section.items_ta)).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 flex items-center justify-center text-[10px] font-extrabold mt-0.5">✕</span>
                  <span className="leading-relaxed font-medium">{item}</span>
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

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  const contactEmail = settings.support_email || settings.contact_email || "support@vizhitn.in";

  usePageMeta({
    title: T('Terms of Service | VizhiTN', 'சேவை விதிமுறைகள் | VizhiTN'),
    description: T(
      'VizhiTN Terms of Service — read our rules for using the civic platform, content guidelines, disclaimers, and user licensing.',
      'VizhiTN சேவை விதிமுறைகள் — குடிமைத் தளத்தைப் பயன்படுத்துவதற்கான விதிகள், பொறுப்புத் துறப்புகள் மற்றும் உரிம வழிகாட்டிகள்.'
    ),
    canonical: 'https://www.vizhitn.in/terms',
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
            <a href={`mailto:${contactEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              {contactEmail}
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
