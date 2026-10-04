"use client";

import React, { useState, useRef } from "react";
import {
  FileText, Printer, Copy, Check, MessageCircle, CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/seo-data";

const RTI_TEMPLATES = [
  {
    id: "road-tender",
    title_en: "Road Quality, Tender Amount & Contractor Audit",
    title_ta: "சாலை அமைத்த நிதி ஒதுக்கீடு, தரம் & ஒப்பந்ததாரர் விபரம்",
    dept_en: "Highways Dept / Municipal Corporation",
    dept_ta: "நெடுஞ்சாலைத் துறை / மாநகராட்சி ஆணையர்",
    authority_en: "Public Information Officer, Office of the Executive Engineer / Municipal Commissioner",
    authority_ta: "பொதுத் தகவல் அதிகாரி, செயற்பொறியாளர் / மாநகராட்சி ஆணையர் அலுவலகம்",
    questions_en: (details) => [
      `What is the total sanctioned tender amount and budget allocation for relaying/repairing ${details.location || "[Road / Street Name]"}?`,
      `Provide the full name, registered address, and contract award date of the contractor who executed the work.`,
      `What was the scheduled date of completion and actual date of completion? Was any penalty levied for delay?`,
      `Provide a certified copy of the Quality Control Inspection Report and Bitumen/Concrete thickness test audit report.`,
      `What is the statutory Defect Liability Period (guarantee period) for this road? If potholes have appeared, what action has been initiated against the contractor?`
    ],
    questions_ta: (details) => [
      `${details.location || "[சாலையின் பெயர்/வார்டு]"} பகுதியைச் சீரமைக்க அல்லது தார்ச்சாலை அமைக்க அரசால் ஒதுக்கப்பட்ட மொத்த டெண்டர் நிதி எவ்வளவு?`,
      `இப்பணியை மேற்கொண்ட ஒப்பந்ததாரரின் (Contractor) முழு பெயர், பதிவு செய்யப்பட்ட முகவரி மற்றும் பணி ஆணை (Work Order) வழங்கப்பட்ட தேதி விபரம்.`,
      `இப்பணி முடிவடைய நிர்ணயிக்கப்பட்ட தேதி மற்றும் பணி முடிக்கப்பட்டதாக சான்றளிக்கப்பட்ட தேதி விபரம். பணிக் காலதாமதத்திற்கு ஏதேனும் அபராதம் விதிக்கப்பட்டதா?`,
      `இச்சாலையின் தரம் மற்றும் தார் தடிமன் (Bitumen thickness test) குறித்து தணிக்கை செய்யப்பட்ட தரக் கட்டுப்பாட்டு ஆய்வு அறிக்கையின் (Quality Audit Report) சான்றளிக்கப்பட்ட நகல்.`,
      `இச்சாலையின் உத்தரவாதக் காலம் (Defect Liability Period) எத்தனை ஆண்டுகள்? உத்தரவாத காலத்திற்குள் சாலை சேதமடைந்தால் ஒப்பந்ததாரர் மீது எடுக்கப்பட்ட நடவடிக்கை என்ன?`
    ]
  },
  {
    id: "patta-delay",
    title_en: "Patta / Chitta Transfer Delay & File Movement Reason",
    title_ta: "பட்டா மாறுதல் விண்ணப்ப தாமதம் & கோப்பு நிலை விபரம்",
    dept_en: "Revenue Department (Taluk Office)",
    dept_ta: "வருவாய்த் துறை (வட்டாட்சியர் அலுவலகம்)",
    authority_en: "Public Information Officer, Office of the Tahsildar",
    authority_ta: "பொதுத் தகவல் அதிகாரி, வட்டாட்சியர் அலுவலகம்",
    questions_en: (details) => [
      `My online Patta transfer application number is ${details.appId || "[Application ID Number]"} submitted on ${details.date || "[Date]"} for Survey No ${details.surveyNo || "[Survey Number]"} in ${details.location || "[Village Name]"}. What is the current file stage?`,
      `Name and designation of all officials (VAO, RI, Surveyor, Tahsildar) with whom my application has remained pending, including dates of file receipt and forwarding.`,
      `As per the Tamil Nadu Citizen Charter, the prescribed timeline for Patta transfer is 15-30 days. If delayed, provide the daily file notings explaining the reason for statutory delay.`,
      `Has any spot inspection or survey measurement been conducted on this land? If yes, provide a certified copy of the Surveyor / VAO field inspection report.`,
      `What is the expected date of issuing the final online Patta order?`
    ],
    questions_ta: (details) => [
      `${details.location || "[கிராமத்தின் பெயர்]"} கிராமம், சர்வே எண் ${details.surveyNo || "[சர்வே எண்]"}-க்கான எனது பட்டா மாறுதல் விண்ணப்பம் எண் ${details.appId || "[விண்ணப்ப எண்]"} நாள்: ${details.date || "[தேதி]"}. இதன் தற்போதைய கோப்பு நிலை என்ன?`,
      `இவ்விண்ணப்பம் கிராம நிர்வாக அலுவலர் (VAO), வருவாய் ஆய்வாளர் (RI), நில அளவர் (Surveyor), தலைமையிடத்து துணை வட்டாட்சியர் ஆகியோரிடம் எந்தெந்த தேதிகளில் இருந்தது என்ற நாள் குறிப்பு விபரம்.`,
      `தமிழ்நாடு குடிமக்கள் பட்டயத்தின்படி பட்டா மாறுதலுக்கான காலக்கெடு 15-30 நாட்கள் ஆகும். இக்காலக்கெடு கடந்தும் உத்தரவு பிறப்பிக்கப்படாததற்கான காரணங்களை விவரிக்கும் அலுவலக கோப்புக் குறிப்புகளின் (File Notings) சான்றளிக்கப்பட்ட நகல்.`,
      `இம்மனு தொடர்பாக கள ஆய்வு அல்லது சர்வே அளவீடு செய்யப்பட்டதா? ஆம் எனில், நில அளவர் / VAO அளித்த ஆய்வு அறிக்கையின் நகல்.`,
      `எனது பட்டா மாறுதல் உத்தரவு இறுதி செய்யப்பட்டு எப்போது வழங்கப்படும் என்ற தேதி விபரம்.`
    ]
  },
  {
    id: "tangedco-eb",
    title_en: "Frequent Power Cuts, Transformer Defect & Voltage Fluctuation",
    title_ta: "மின் பகிர்மான பழுது, மின்மாற்றி (டிரான்ஸ்பார்மர்) & தொடர் மின்தடை",
    dept_en: "TANGEDCO (Electricity Board)",
    dept_ta: "தமிழ்நாடு மின் உற்பத்தி மற்றும் பகிர்மானக் கழகம் (TANGEDCO)",
    authority_en: "Public Information Officer, Office of the Executive Engineer (O&M), TANGEDCO",
    authority_ta: "பொதுத் தகவல் அதிகாரி, செயற்பொறியாளர் அலுவலகம், மின் பகிர்மான வட்டம், TANGEDCO",
    questions_en: (details) => [
      `Provide the total number of scheduled and unscheduled power outages recorded in ${details.location || "[Feeder / Area Name]"} from ${details.date || "[Start Date]"} to till date, along with duration in hours.`,
      `What is the sanctioned capacity of the distribution transformer feeding this street, and what is the current peak load connected to it? Is it overloaded?`,
      `How many consumer complaints regarding low voltage and power failure have been registered in this section during the last 6 months, and what action was taken?`,
      `Under the TNERC Distribution Standards of Performance, what compensation is payable to consumers for failure to restore supply within the mandated time limit?`
    ],
    questions_ta: (details) => [
      `${details.location || "[பகுதி / மின் பாதை]"} பகுதியில் கடந்த 6 மாதங்களில் ஏற்பட்ட திட்டமிடப்பட்ட மற்றும் திட்டமிடப்படாத மின்தடைகளின் எண்ணிக்கை மற்றும் மொத்த மின்தடை நேரத்தின் (Log sheet) சான்றளிக்கப்பட்ட நகல்.`,
      `இப்பகுதிக்கு மின்சாரம் வழங்கும் மின்மாற்றியின் (Transformer) அனுமதிக்கப்பட்ட திறன் எவ்வளவு? தற்போது அதில் இணைக்கப்பட்டுள்ள மொத்த மின்சுமை (Peak Load) அளவு எவ்வளவு? மின்மாற்றி அதிக சுமையுடன் இயங்குகிறதா?`,
      `கடந்த 6 மாதங்களில் குறைந்த மின்னழுத்தம் மற்றும் மின்தடை தொடர்பாக இப்பிரிவில் பெறப்பட்ட பொதுமக்களின் புகார்கள் மற்றும் அதன் மீது எடுக்கப்பட்ட நடவடிக்கைகள் என்ன?`,
      `தமிழ்நாடு மின்சார ஒழுங்குமுறை ஆணையத்தின் (TNERC) தர நிர்ணய விதிகளின்படி குறிப்பிட்ட காலத்திற்குள் மின்சாரத்தை மீட்டெடுக்கத் தவறியதற்காக நுகர்வோருக்கு வழங்கப்பட வேண்டிய இழப்பீடு விபரம்.`
    ]
  },
  {
    id: "water-sewage",
    title_en: "Contaminated Water Supply & Underground Drainage Delay",
    title_ta: "குடிநீர் தரம், குழாய் உடைப்பு & பாதாள சாக்கடை திட்டம்",
    dept_en: "TWAD Board / Metrowater / Municipality",
    dept_ta: "குடிநீர் வடிகால் வாரியம் / மெட்ரோவாட்டர் / நகராட்சி",
    authority_en: "Public Information Officer, Office of the Area Engineer / Municipal Health Officer",
    authority_ta: "பொதுத் தகவல் அதிகாரி, செயற்பொறியாளர் / நகராட்சி பொறியாளர் அலுவலகம்",
    questions_en: (details) => [
      `What is the designated quantity of piped drinking water supplied per day to residents of ${details.location || "[Area / Ward Name]"}?`,
      `Provide certified copies of the Water Quality Testing and Chlorine level residual test reports conducted in this area for the past 3 months.`,
      `What is the tender amount, contractor details, and deadline for completing the ongoing underground drainage (UGD) / drinking water pipeline works in this ward?`,
      `Provide details of all complaints received regarding sewage mixing with drinking water lines in the last 90 days and actions taken to rectify them.`
    ],
    questions_ta: (details) => [
      `${details.location || "[பகுதி / வார்டு எண்]"} பகுதியில் வசிக்கும் மக்களுக்கு நாள் ஒன்றுக்கு நபர் ஒருவருக்கு வழங்கப்பட வேண்டிய நிர்ணயிக்கப்பட்ட பாதுகாக்கப்பட்ட குடிநீரின் அளவு எவ்வளவு?`,
      `இப்பகுதியில் கடந்த 3 மாதங்களில் சேகரிக்கப்பட்ட குடிநீர் மாதிரிகளின் வேதியியல் மற்றும் பாக்டீரியாவியல் ஆய்வு அறிக்கைகள் (Water Quality Test Reports) மற்றும் குளோரின் அளவு பரிசோதனை முடிவுகளின் சான்றளிக்கப்பட்ட நகல்கள்.`,
      `இப்பகுதியில் நடைபெற்று வரும் பாதாள சாக்கடை அல்லது குடிநீர் குழாய் பணிகளுக்கான மொத்த திட்ட மதிப்பு, ஒப்பந்ததாரர் பெயர் மற்றும் பணிகளை முடிக்க நிர்ணயிக்கப்பட்ட தேதி விபரம்.`,
      `குடிநீரில் கழிவுநீர் கலப்பதாக கடந்த 90 நாட்களில் பெறப்பட்ட புகார்களின் விபரம் மற்றும் அதன் மீது எடுக்கப்பட்ட உடனடி சீரமைப்பு நடவடிக்கைகள் என்ன?`
    ]
  },
  {
    id: "ration-pds",
    title_en: "Smart Ration Card Delay & Fair Price Shop Irregularities",
    title_ta: "ரேஷன் அட்டை ஒப்புதல் தாமதம் & நியாயவிலைக் கடை பொருட்கள் விபரம்",
    dept_en: "Civil Supplies & Consumer Protection Dept",
    dept_ta: "உணவுப் பொருள் வழங்கல் மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    authority_en: "Public Information Officer, Office of the Taluk Supply Officer (TSO)",
    authority_ta: "பொதுத் தகவல் அதிகாரி, வட்ட வழங்கல் அலுவலர் (TSO) அலுவலகம்",
    questions_en: (details) => [
      `My Smart Ration Card application reference number is ${details.appId || "[TN-PDS Number]"} applied on ${details.date || "[Date]"}. Why has it not been approved within the statutory 15-day timeline?`,
      `Provide the name and designation of the field verification officer who was assigned my application, and a certified copy of the inspection report submitted.`,
      `Provide the monthly sanctioned quota of rice, sugar, dal, and oil allocated to Fair Price Shop No ${details.location || "[Shop Number]"} for the past 3 months, and the actual stock disbursed to cardholders.`,
      `If stock was shown as sold without issuing bills to cardholders, provide details of inspections conducted by the flying squad on this shop.`
    ],
    questions_ta: (details) => [
      `புதிய குடும்ப அட்டைக்காக விண்ணப்பித்த எனது விண்ணப்ப எண் ${details.appId || "[விண்ணப்ப எண்]"} நாள்: ${details.date || "[தேதி]"}. 15 நாட்கள் கடந்தும் அட்டை வழங்கப்படாததற்கான காரணங்களை விளக்கும் கோப்புக் குறிப்பு நகல்.`,
      `எனது முகவரிக்கு கள ஆய்வு செய்ய உத்தரவிடப்பட்ட அதிகாரியின் பெயர், பதவி மற்றும் அவர் சமர்ப்பித்த ஆய்வு அறிக்கையின் சான்றளிக்கப்பட்ட நகல்.`,
      `நியாயவிலைக் கடை எண் ${details.location || "[கடை எண்/ஊர்]"} கடைக்கு கடந்த 3 மாதங்களில் ஒதுக்கப்பட்ட அரிசி, சர்க்கரை, துவரம்பருப்பு, பாமாயில் அளவு மற்றும் நுகர்வோருக்கு விநியோகிக்கப்பட்ட அளவு குறித்த பதிவேட்டின் நகல்.`,
      `இக்கடையில் பொருட்கள் இருப்பு வைப்பு மற்றும் முறைகேடுகள் குறித்து பறக்கும் படை அதிகாரிகள் மேற்கொண்ட ஆய்வுகள் குறித்த விபரம்.`
    ]
  },
  {
    id: "custom",
    title_en: "Custom Citizen RTI Application (Write Your Own Questions)",
    title_ta: "தனிப்பயன் மனு (உங்கள் சொந்த கேள்விகளை எழுதவும்)",
    dept_en: "Any Public Authority in Tamil Nadu",
    dept_ta: "எந்தவொரு தமிழ்நாடு அரசுத் துறை",
    authority_en: "Public Information Officer (PIO), Office of the [Department / Office]",
    authority_ta: "பொதுத் தகவல் அதிகாரி, [துறை / அலுவலகத்தின் பெயர்]",
    questions_en: (details) => [
      details.customQ1 || `Provide the certified copy of the government order or resolution regarding ${details.location || "[Subject Matter]"}.`,
      details.customQ2 || `What is the current status and reasons for delay in resolving my petition/grievance dated ${details.date || "[Date]"}?`,
      details.customQ3 || `Name, designation, and official contact details of the officer responsible for taking action on this matter.`
    ],
    questions_ta: (details) => [
      details.customQ1 || `${details.location || "[விஷயம்/பிரச்சினை]"} தொடர்பாக எடுக்கப்பட்ட நடவடிக்கைகள் மற்றும் துறைசார் அரசு ஆணைகளின் சான்றளிக்கப்பட்ட நகல்.`,
      details.customQ2 || `நாள்: ${details.date || "[தேதி]"} அன்று நான் சமர்ப்பித்த மனுவின் தற்போதைய நிலை மற்றும் தாமதத்திற்கான காரணங்களின் கோப்புக் குறிப்பு நகல்.`,
      details.customQ3 || `இம்மனு மீது சட்டப்பூர்வ நடவடிக்கை எடுக்க வேண்டிய அதிகாரியின் பெயர், பதவி மற்றும் தொடர்பு விபரம்.`
    ]
  }
];

export default function RtiDraftGenerator() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [selectedCategory, setSelectedCategory] = useState("road-tender");
  const [district, setDistrict] = useState("chennai");
  const [taluk, setTaluk] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantAddress, setApplicantAddress] = useState("");
  const [applicantMobile, setApplicantMobile] = useState("");
  const [location, setLocation] = useState("");
  const [appId, setAppId] = useState("");
  const [date, setDate] = useState("");
  const [surveyNo, setSurveyNo] = useState("");
  const [customQ1, setCustomQ1] = useState("");
  const [customQ2, setCustomQ2] = useState("");
  const [customQ3, setCustomQ3] = useState("");
  const [copied, setCopied] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState("ta");

  const printRef = useRef(null);

  const activeTemplate = RTI_TEMPLATES.find((t) => t.id === selectedCategory) || RTI_TEMPLATES[0];

  const currentQuestions = draftLanguage === "ta"
    ? activeTemplate.questions_ta({ location, appId, date, surveyNo, customQ1, customQ2, customQ3 })
    : activeTemplate.questions_en({ location, appId, date, surveyNo, customQ1, customQ2, customQ3 });

  const districtObj = DISTRICTS.find((d) => d.slug === district);
  const districtName = districtObj ? districtObj.name : "Chennai";

  const handleCopy = () => {
    const text = generateTextDraft();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = generateTextDraft();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const generateTextDraft = () => {
    if (draftLanguage === "ta") {
      return `தகவல் அறியும் உரிமைச் சட்டம் 2005, பிரிவு 6(1)-ன் கீழ் விண்ணப்பம்
--------------------------------------------------
[ ₹10 நீதிமன்ற கட்டண முத்திரை ஒட்டவும் ]

பெறுநர்:
பொதுத் தகவல் அதிகாரி (PIO),
${activeTemplate.authority_ta},
${taluk ? `${taluk} வட்டம் / பகுதி,` : ""}
${districtName} மாவட்டம், தமிழ்நாடு.

அனுப்புநர்:
பெயர்: ${applicantName || "[விண்ணப்பதாரர் பெயர்]"}
முகவரி: ${applicantAddress || "[முழு முகவரி, பின்கோடு]"}
கைபேசி எண்: ${applicantMobile || "[கைபேசி எண்]"}

பொருள்: தகவல் அறியும் உரிமைச் சட்டம் 2005 பிரிவு 6(1)-ன் கீழ் தகவல் மற்றும் சான்றளிக்கப்பட்ட ஆவணங்கள் கோருதல் - தொடர்பாக.

ஐயா/அம்மையீர்,
இந்திய குடிமகனாகிய நான் தகவல் அறியும் உரிமைச் சட்டம் 2005 பிரிவு 6(1)-ன் கீழ் பின்வரும் விபரங்களை சான்றளிக்கப்பட்ட நகல்களுடன் வழங்குமாறு பணிவுடன் கேட்டுக் கொள்கிறேன்:

${currentQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n\n")}

கட்டணம் விபரம்:
இவ்விண்ணப்பத்திற்கான சட்டப்பூர்வ கட்டணம் ₹10/- நீதிமன்ற முத்திரையாக (Court Fee Stamp) இவ்விண்ணப்பத்தின் மேல் ஒட்டப்பட்டுள்ளது / போஸ்டல் ஆர்டர் இணைக்கப்பட்டுள்ளது.

குறிப்பு & உறுதிமொழி:
1. கோரப்படும் தகவல்கள் தகவல் அறியும் உரிமைச் சட்டம் 2005-ன் பிரிவு 8 மற்றும் 9-ல் குறிப்பிடப்பட்டுள்ள விலக்குகளுக்கு உட்படாதவை என உறுதியளிக்கிறேன்.
2. சட்டம் பிரிவு 7(1)-ன் படி மனு கிடைத்த 30 நாட்களுக்குள் எனக்கு எழுத்துப்பூர்வமாக தகவல் வழங்கிட வேண்டுகிறேன்.

இடம்: ${districtName}
தேதி: ${new Date().toLocaleDateString("ta-IN")}

இப்படிக்கு,
தங்கள் உண்மையுள்ள,

(${applicantName || "விண்ணப்பதாரர் கையொப்பம்"})`;
    } else {
      return `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005
------------------------------------------------------------------------
[ Affix ₹10 Court Fee Stamp Here ]

To:
The Public Information Officer (PIO),
${activeTemplate.authority_en},
${taluk ? `${taluk} Taluk / Division,` : ""}
${districtName} District, Tamil Nadu.

From:
Name: ${applicantName || "[Applicant Name]"}
Address: ${applicantAddress || "[Full Address, PIN Code]"}
Mobile Number: ${applicantMobile || "[Mobile Number]"}

Subject: Request for information and certified documents under Section 6(1) of the RTI Act 2005 - Reg.

Sir/Madam,
I, a citizen of India, hereby request you to kindly furnish the following information and certified copies under Section 6(1) and Section 2(j)(ii) of the Right to Information Act 2005:

${currentQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n\n")}

Fee Details:
The prescribed application fee of ₹10/- has been paid by affixing a Court Fee Stamp of ₹10/- / Indian Postal Order (IPO).

Statutory Declarations:
1. The information sought falls within the jurisdiction of your public authority and does not attract any of the exemptions specified under Sections 8 and 9 of the RTI Act 2005.
2. Under Section 7(1) of the Act, I request you to furnish the information within the statutory 30-day window.

Place: ${districtName}
Date: ${new Date().toLocaleDateString("en-IN")}

Yours faithfully,

(${applicantName || "Applicant Signature"})`;
    }
  };

  return (
    <div className="w-full">
      {/* Configuration Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {T("Interactive Citizen Tool", "குடிமக்கள் ஊடாடும் கருவி")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {T("Tamil Nadu RTI Draft Generator", "RTI மாதிரி விண்ணப்ப ஜெனரேட்டர்")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {T("Generate a legally binding Tamil RTI letter in 60 seconds with statutory citations and ₹10 stamp format.", "60 வினாடிகளில் சட்டப்பூர்வ தமிழ் RTI மனுவை தயார் செய்து அச்சிடலாம்.")}
            </p>
          </div>
        </div>

        {/* Step 1: Select Grievance Category */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            1. {T("Select Grievance Subject", "மனுவின் பொருள் / துறை தேர்வு செய்க")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RTI_TEMPLATES.map((tpl) => {
              const isSelected = selectedCategory === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedCategory(tpl.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 shadow-sm ring-1 ring-blue-600"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"
                  }`}
                >
                  <p className="font-bold text-xs leading-snug">
                    {lang === "ta" ? tpl.title_ta : tpl.title_en}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {lang === "ta" ? tpl.dept_ta : tpl.dept_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: District & Taluk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. {T("Select District", "மாவட்டம் தேர்வு")}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            >
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({lang === "ta" ? d.name_ta || d.name : d.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {T("Taluk / Municipality / Ward Name", "வட்டம் / நகராட்சி / வார்டு பெயர்")}
            </label>
            <input
              type="text"
              value={taluk}
              onChange={(e) => setTaluk(e.target.value)}
              placeholder={T("e.g. Tambaram / Madurai North", "எ.கா. தாம்பரம் / மதுரை வடக்கு")}
              className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Step 3: Specific Grievance Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {T("Location / Road / Village", "இடம் / சாலை / ஊர் பெயர்")}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={T("e.g. Gandhi Road, Ward 14", "எ.கா. காந்தி சாலை, வார்டு 14")}
              className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {T("Application ID / Survey No (if any)", "மனு எண் / சர்வே எண் (இருப்பின்)")}
            </label>
            <input
              type="text"
              value={appId || surveyNo}
              onChange={(e) => { setAppId(e.target.value); setSurveyNo(e.target.value); }}
              placeholder={T("e.g. TN-PDS-82910 / Sy. 142/3B", "எ.கா. TN-7291 / சர்வே 142/3B")}
              className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {T("Application / Grievance Date", "விண்ணப்பித்த / புகார் தேதி")}
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder={T("e.g. 15-08-2026", "எ.கா. 15-08-2026")}
              className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Custom Question fields if custom selected */}
        {selectedCategory === "custom" && (
          <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {T("Write Your Specific Questions:", "உங்கள் பிரத்யேக வினாக்கள்:")}
            </label>
            <input
              type="text"
              value={customQ1}
              onChange={(e) => setCustomQ1(e.target.value)}
              placeholder={T("Question 1 (e.g. What is the total fund allocated...)", "கேள்வி 1 (எ.கா. ஒதுக்கப்பட்ட நிதி எவ்வளவு...)")}
              className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={customQ2}
              onChange={(e) => setCustomQ2(e.target.value)}
              placeholder={T("Question 2 (e.g. Provide certified copy of file notings...)", "கேள்வி 2 (எ.கா. கோப்புக் குறிப்புகளின் நகல்...)")}
              className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Step 4: Applicant Details */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            3. {T("Applicant Information (Required by Law)", "விண்ணப்பதாரர் விபரம் (சட்டப்படி கட்டாயம்)")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder={T("Your Full Name", "உங்கள் முழு பெயர்")}
                className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={applicantAddress}
                onChange={(e) => setApplicantAddress(e.target.value)}
                placeholder={T("Address with PIN Code", "முழு முகவரி, பின்கோடு")}
                className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={applicantMobile}
                onChange={(e) => setApplicantMobile(e.target.value)}
                placeholder={T("Mobile Phone Number", "கைபேசி எண்")}
                className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Generated Letter Card (Printable Sheet) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative print:border-none print:shadow-none print:p-0">
        {/* Output Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {T("Draft Language:", "மனுவின் மொழி:")}
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setDraftLanguage("ta")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  draftLanguage === "ta"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                தமிழ் (Tamil)
              </button>
              <button
                type="button"
                onClick={() => setDraftLanguage("en")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  draftLanguage === "en"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              {T("Print / Save A4 PDF", "அச்சிடு / PDF சேமி")}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Tamil Text", "மனுவை நகலெடு")}
            </button>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {T("WhatsApp Draft", "வாட்ஸ்அப்")}
            </button>
          </div>
        </div>

        {/* THE OFFICIAL LEGAL LETTER CONTENT */}
        <div ref={printRef} className="max-w-2xl mx-auto font-serif text-slate-900 dark:text-slate-100 leading-relaxed text-sm sm:text-base print:text-black print:text-xs">
          {/* Header Row with ₹10 Stamp Box */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-6">
            <div>
              <p className="font-bold text-sm tracking-wider uppercase text-blue-900 dark:text-blue-400">
                {draftLanguage === "ta"
                  ? "தகவல் அறியும் உரிமைச் சட்டம் 2005"
                  : "RIGHT TO INFORMATION ACT, 2005"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {draftLanguage === "ta"
                  ? "பிரிவு 6(1)-ன் கீழ் தகவல் பெறும் விண்ணப்பப் படிவம்"
                  : "Application Form for Seeking Information under Section 6(1)"}
              </p>
            </div>
            {/* Visual ₹10 Court Fee Stamp Box */}
            <div className="w-28 h-20 border-2 border-dashed border-slate-400 dark:border-slate-600 flex flex-col items-center justify-center text-center p-1 rounded bg-amber-50/50 dark:bg-slate-800/30">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                ₹10
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                {draftLanguage === "ta" ? "நீதிமன்ற முத்திரை ஒட்டும் இடம்" : "Court Fee Stamp Here"}
              </span>
            </div>
          </div>

          {/* Addressee */}
          <div className="mb-6 space-y-1">
            <p className="font-bold">{draftLanguage === "ta" ? "பெறுநர்:" : "To:"}</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {draftLanguage === "ta" ? "பொதுத் தகவல் அதிகாரி (PIO)," : "The Public Information Officer (PIO),"}
            </p>
            <p>{draftLanguage === "ta" ? activeTemplate.authority_ta : activeTemplate.authority_en},</p>
            {taluk && <p>{taluk} {draftLanguage === "ta" ? "வட்டம் / பகுதி," : "Taluk / Division,"}</p>}
            <p>{districtName} {draftLanguage === "ta" ? "மாவட்டம், தமிழ்நாடு." : "District, Tamil Nadu."}</p>
          </div>

          {/* Applicant Info */}
          <div className="mb-6 space-y-1">
            <p className="font-bold">{draftLanguage === "ta" ? "அனுப்புநர்:" : "From:"}</p>
            <p className="font-bold">{applicantName || (draftLanguage === "ta" ? "[விண்ணப்பதாரர் பெயர்]" : "[Applicant Name]")}</p>
            <p className="whitespace-pre-line">{applicantAddress || (draftLanguage === "ta" ? "[முழு முகவரி, பின்கோடு]" : "[Full Address, PIN Code]")}</p>
            <p>{draftLanguage === "ta" ? "கைபேசி எண்:" : "Mobile:"} {applicantMobile || (draftLanguage === "ta" ? "[கைபேசி எண்]" : "[Mobile Number]")}</p>
          </div>

          {/* Subject Line */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border-l-4 border-blue-600 mb-6 font-sans">
            <p className="font-bold text-xs sm:text-sm">
              <span className="text-blue-600 dark:text-blue-400">
                {draftLanguage === "ta" ? "பொருள்: " : "Subject: "}
              </span>
              {draftLanguage === "ta"
                ? `தகவல் அறியும் உரிமைச் சட்டம் 2005 பிரிவு 6(1)-ன் கீழ் தகவல் மற்றும் சான்றளிக்கப்பட்ட ஆவணங்கள் கோருதல் - தொடர்பாக.`
                : `Request for certified information and file inspection under Section 6(1) of the Right to Information Act 2005 - Reg.`}
            </p>
          </div>

          {/* Opening Salutation */}
          <p className="mb-4">
            {draftLanguage === "ta"
              ? "ஐயா / அம்மையீர்,"
              : "Sir / Madam,"}
          </p>
          <p className="mb-6 text-justify">
            {draftLanguage === "ta"
              ? "இந்தியக் குடியுரிமை பெற்ற குடிமகனாகிய நான், தகவல் அறியும் உரிமைச் சட்டம் 2005-ன் பிரிவு 6(1) மற்றும் பிரிவு 2(j)(ii)-ன் கீழ் பின்வரும் விபரங்கள் மற்றும் சான்றளிக்கப்பட்ட ஆவணங்களை எனக்கு வழங்குமாறு பணிவுடன் வேண்டுகிறேன்:"
              : "I, an Indian citizen, hereby request you to kindly furnish the following specific information along with certified copies of relevant files under Section 6(1) and Section 2(j)(ii) of the RTI Act 2005:"}
          </p>

          {/* Questions Ordered List */}
          <div className="space-y-4 mb-8 pl-2">
            {currentQuestions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {idx + 1}.
                </span>
                <p className="text-justify font-medium">{q}</p>
              </div>
            ))}
          </div>

          {/* Statutory Declarations */}
          <div className="space-y-3 mb-8 text-xs text-slate-600 dark:text-slate-300 font-sans border-t border-slate-200 dark:border-slate-700 pt-4">
            <p>
              <strong>{draftLanguage === "ta" ? "கட்டணம் விபரம்:" : "Application Fee:"}</strong>{" "}
              {draftLanguage === "ta"
                ? "இவ்விண்ணப்பத்திற்கான கட்டணம் ₹10/- நீதிமன்ற முத்திரையாக (Court Fee Stamp) இவ்விண்ணப்பத்தின் முகப்பில் ஒட்டப்பட்டுள்ளது / போஸ்டல் ஆர்டர் இணைக்கப்பட்டுள்ளது."
                : "The statutory application fee of ₹10/- has been paid via Court Fee Stamp affixed above / Indian Postal Order (IPO)."}
            </p>
            <p>
              <strong>{draftLanguage === "ta" ? "சட்டப்பூர்வ உறுதிமொழி:" : "Statutory Affirmation:"}</strong>{" "}
              {draftLanguage === "ta"
                ? "1. கோரப்படும் தகவல்கள் RTI சட்டம் 2005-ன் பிரிவு 8 மற்றும் 9-ல் உள்ள விலக்குகளுக்கு உட்படாதவை என உறுதியளிக்கிறேன்.\n2. சட்டம் பிரிவு 7(1)-ன் படி மனு கிடைத்த 30 நாட்களுக்குள் எனக்கு எழுத்துப்பூர்வமாக தகவல் வழங்கிட வேண்டுகிறேன்."
                : "1. The information sought does not attract any of the exemptions under Sections 8 and 9 of the RTI Act 2005.\n2. In accordance with Section 7(1), please provide the information within 30 days."}
            </p>
          </div>

          {/* Signatures & Date */}
          <div className="flex items-end justify-between pt-6 border-t border-slate-200 dark:border-slate-700 font-sans">
            <div>
              <p>{draftLanguage === "ta" ? "இடம்:" : "Place:"} <strong>{districtName}</strong></p>
              <p>{draftLanguage === "ta" ? "தேதி:" : "Date:"} <strong>{new Date().toLocaleDateString(draftLanguage === "ta" ? "ta-IN" : "en-IN")}</strong></p>
            </div>
            <div className="text-right">
              <p className="mb-8">{draftLanguage === "ta" ? "தங்கள் உண்மையுள்ள," : "Yours faithfully,"}</p>
              <p className="font-bold underline">({applicantName || (draftLanguage === "ta" ? "விண்ணப்பதாரர் கையொப்பம்" : "Applicant Signature")})</p>
            </div>
          </div>
        </div>

        {/* 4-Step Practical Submission Guide for Citizens */}
        <div className="mt-12 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 print:hidden">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            {T("4-Step RTI Filing Instructions for Tamil Nadu Citizens", "மனுவை அரசுக்கு அனுப்பும் 4 எளிய வழிமுறைகள்")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                1. {T("Affix ₹10 Court Fee Stamp", "1. ₹10 நீதிமன்ற முத்திரை ஒட்டவும்")}
              </span>
              {T("Buy a ₹10 court fee stamp from any court stamp vendor or Taluk office and affix it on the top right box.", "வட்டாட்சியர் அலுவலகம் அல்லது நீதிமன்ற வளாக முத்திரை விற்பனையாளரிடம் ₹10 முத்திரை வாங்கி வலது மேல் மூலையில் ஒட்டவும்.")}
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                2. {T("Send via RPAD Post", "2. பதிவுத் தபாலில் அனுப்பவும் (RPAD)")}
              </span>
              {T("Do not send by ordinary post. Send via Registered Post with Acknowledgement Due (RPAD) and keep postal receipt.", "சாதாரண தபாலில் அனுப்ப வேண்டாம். அஞ்சல் அலுவலகத்தில் 'பதிவுத் தபால்' (RPAD) மூலம் அனுப்பி ரசீதை பத்திரமாக வைக்கவும்.")}
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                3. {T("Mandatory 30-Day Response", "3. 30 நாள் சட்டப்பூர்வ காலக்கெடு")}
              </span>
              {T("The Public Information Officer is legally obligated to reply within 30 calendar days from receipt date.", "அதிகாரி தபாலைப் பெற்றுக் கொண்ட தேதியிலிருந்து 30 நாட்களுக்குள் எழுத்துப்பூர்வ பதில் அளிக்க வேண்டும்.")}
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                4. {T("No Reply? File First Appeal", "4. பதில் வரவில்லையா? மேல்முறையீடு")}
              </span>
              {T("If delayed or denied, file First Appeal to the Head of Office (FAA) within 30 days. No fees required!", "30 நாளில் பதில் வராவிட்டால், அதே அலுவலகத் தலைவரிடம் முதல் மேல்முறையீடு செய்யலாம். இதற்கு கட்டணம் கிடையாது!")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
