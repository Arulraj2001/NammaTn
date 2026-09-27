"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  FileText, Search, CheckCircle2, Copy, Check, MessageCircle, ExternalLink,
  Clock, CreditCard, AlertCircle, HelpCircle, ShieldCheck, ChevronDown,
  Building, Sparkles, UserCheck, Layers, FileCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ESEVAI_SERVICES = [
  {
    id: "patta-chitta-transfer",
    category: "land",
    code: "REV-401",
    title_en: "Patta & Chitta Transfer (பட்டா மாறுதல்)",
    title_ta: "பட்டா மாறுதல் (உட்பிரிவு இல்லாதது & உட்பிரிவு உள்ளது)",
    department_en: "Revenue and Disaster Management Department",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_name: "AnyTime Anywhere e-Services / e-Sevai",
    portal_url: "https://eservices.tn.gov.in/eservicesweb/",
    fee_en: "₹60 (Non-subdivision) / ₹460 (With sub-division & survey fee)",
    fee_ta: "₹60 (உட்பிரிவு இல்லாதது) / ₹460 (உட்பிரிவு மற்றும் அளவீட்டுக் கட்டணம்)",
    sla_en: "15 to 30 Working Days",
    sla_ta: "15 முதல் 30 வேலை நாட்கள்",
    summary_en: "Transfer land ownership records into buyer's name following property purchase, inheritance, or gift deed registration.",
    summary_ta: "நிலம் வாங்கிய பின், வாரிசுரிமை அல்லது தானப் பத்திரப் பதிவுக்குப் பிறகு நில உரிமையை வாங்குபவர் பெயருக்கு மாற்றும் சட்டப்பூர்வ சேவை.",
    documents_en: [
      "Registered Sale Deed / Settlement Deed / Gift Deed copy (கிரயப் பத்திரம்)",
      "Previous owner's Patta copy or Patta number (முந்தைய பட்டா நகல்)",
      "Encumbrance Certificate (EC) for the property (வில்லங்கச் சான்றிதழ்)",
      "Applicant Aadhaar Card & Smart Ration Card (ஆதார் & குடும்ப அட்டை)",
      "Latest Property Tax / Land Revenue receipt (நில வரி ரசீது)",
      "Legal Heir Certificate & No Objection Certificate (NOC) if applying after parent's demise"
    ],
    documents_ta: [
      "பதிவு செய்யப்பட்ட கிரயப் பத்திரம் / தானப் பத்திரம் / செட்டில்மெண்ட் பத்திர நகல்",
      "முந்தைய உரிமையாளரின் பட்டா நகல் அல்லது பட்டா எண்",
      "சொத்தின் வில்லங்கச் சான்றிதழ் (EC) நகல்",
      "விண்ணப்பதாரரின் ஆதார் அட்டை மற்றும் குடும்ப அட்டை",
      "சமீபத்திய நில வரி / சொத்து வரி செலுத்திய ரசீது",
      "பெற்றோர் மறைவுக்குப் பின் எனில், வாரிசுச் சான்றிதழ் மற்றும் பிற வாரிசுகளின் ஆட்சேபனையின்மை கடிதம் (NOC)"
    ],
    procedure_en: [
      "Visit eservices.tn.gov.in and click 'Apply Patta Transfer (Online)'.",
      "Select District, Taluk, Village, and enter Survey / Sub-division Number.",
      "Upload PDF copies of Registered Deed, EC, and Identity proofs (file size under 2MB each).",
      "Pay application fee of ₹60 (without subdivision) or ₹460 (with survey subdivision) via UPI or Netbanking.",
      "VAO and Field Surveyor conduct field inspection, after which Tahsildar digitally issues the new Patta."
    ],
    procedure_ta: [
      "eservices.tn.gov.in தளத்திற்குச் சென்று 'பட்டா மாறுதல் விண்ணப்பிக்க' என்பதைத் தேர்ந்தெடுக்கவும்.",
      "மாவட்டம், வட்டம், கிராமம் மற்றும் சர்வே எண் / உட்பிரிவு எண்ணைத் தேர்வு செய்யவும்.",
      "கிரயப் பத்திரம், வில்லங்கச் சான்றிதழ் மற்றும் அடையாள ஆவணங்களைப் பதிவேற்றவும் (2MB-க்குள்).",
      "₹60 அல்லது ₹460 கட்டணத்தை UPI அல்லது Netbanking மூலம் செலுத்தவும்.",
      "VAO மற்றும் நில அளவர் கள ஆய்வு செய்த பின் தாசில்தார் டிஜிட்டல் கையொப்பமிட்ட புதிய பட்டாவை வழங்குவார்."
    ],
    rejection_tips_en: "Common rejection reasons: Incomplete prior title documents, discrepancy in survey number or boundary extent, or pending civil court suit.",
    rejection_tips_ta: "நிராகரிப்பைத் தவிர்க்க: சர்வே எண் அல்லது எல்லை அளவுகளில் முரண்பாடு இருக்கக் கூடாது. நீதிமன்ற வழக்குகள் நிலுவையில் இருக்கக் கூடாது."
  },
  {
    id: "encumbrance-certificate-ec",
    category: "land",
    code: "REG-EC",
    title_en: "Encumbrance Certificate (EC / வில்லங்கச் சான்றிதழ்)",
    title_ta: "வில்லங்கச் சான்றிதழ் (EC - பதிவுத் துறை)",
    department_en: "Registration Department (TNREGINET)",
    department_ta: "வணிக வரிகள் மற்றும் பதிவுத் துறை",
    portal_name: "TNREGINET Portal",
    portal_url: "https://tnreginet.gov.in",
    fee_en: "Free for online viewing / ₹100 for digitally signed certified copy",
    fee_ta: "ஆன்லைனில் பார்க்க இலவசம் / டிஜிட்டல் கையொப்பமிட்ட நகலுக்கு ₹100",
    sla_en: "Instant view & download / 3 days for certified signed copy",
    sla_ta: "உடனடி பதிவிறக்கம் / கையொப்பமிட்ட சான்றுக்கு 3 நாட்கள்",
    summary_en: "Provides chronological record of all registered property transactions, loans, mortgages, or attachments for up to 50+ years.",
    summary_ta: "ஒரு குறிப்பிட்ட சொத்தில் கடந்த 50+ ஆண்டுகளில் நடைபெற்ற அனைத்து விற்பனை, அடமானம் மற்றும் கடன் பதிவுகளின் முழு பட்டியல்.",
    documents_en: [
      "Village name, Sub-Registrar Office (SRO) zone & District (பதிவு அலுவலக மண்டலம்)",
      "Survey Number and Sub-division Number (சர்வே எண்)",
      "Boundary details (North, South, East, West boundaries - நான்கு எல்லைகள்)",
      "Period of search required (e.g. from 01/01/1987 to till date)",
      "Previous registered document number and year (if known for cross-checking)"
    ],
    documents_ta: [
      "கிராமத்தின் பெயர், சார்-பதிவாளர் அலுவலகம் (SRO) மற்றும் மாவட்டம்",
      "சொத்தின் சர்வே எண் மற்றும் உட்பிரிவு எண்",
      "சொத்தின் நான்கு எல்லை விபரங்கள் (வடக்கு, தெற்கு, கிழக்கு, மேற்கு)",
      "தேவையான தேடல் கால அளவு (எ.கா: 01/01/1990 முதல் இன்று வரை)",
      "முந்தைய பத்திரப் பதிவு எண் மற்றும் பதிவு ஆண்டு (தெரிந்திருப்பின்)"
    ],
    procedure_en: [
      "Visit tnreginet.gov.in and click 'E-Services' -> 'Encumbrance Certificate' -> 'View EC'.",
      "Select Zone, District, Sub-Registrar Office, and Village.",
      "Enter EC Start Date and End Date along with Survey Number and Sub-division.",
      "Enter captcha and view/download the instant digitally generated PDF report free of cost.",
      "For a legally certified copy required by banks for home loans, log in as a registered user and apply with ₹100 fee."
    ],
    procedure_ta: [
      "tnreginet.gov.in தளத்திற்குச் சென்று 'மின்னணு சேவைகள்' -> 'வில்லங்கச் சான்றிதழ்' -> 'வில்லங்கச் சான்றிதழ் பார்வையிடுதல்' கிளிக் செய்யவும்.",
      "மண்டலம், மாவட்டம், சார் பதிவாளர் அலுவலகம் மற்றும் கிராமத்தைத் தேர்ந்தெடுக்கவும்.",
      "தேடல் தொடக்க தேதி, முடிவு தேதி மற்றும் சர்வே எண்ணை உள்ளிடவும்.",
      "கேப்ட்சா குறியீட்டை உள்ளிட்டு உடனடி வில்லங்க அறிக்கையை இலவசமாகப் பதிவிறக்கலாம்.",
      "வங்கி வீட்டுக் கடனுக்கான சான்றளிக்கப்பட்ட நகல் தேவைப்பட்டால், பயனர் கணக்கில் உள்நுழைந்து ₹100 கட்டணம் செலுத்திப் பெறலாம்."
    ],
    rejection_tips_en: "Always search a minimum 30-year span to uncover historical mortgages or inherited partition suits.",
    rejection_tips_ta: "சொத்து வாங்கும் போது குறைந்தபட்சம் 30 ஆண்டுகளுக்கான வில்லங்கத்தை ஆய்வு செய்வது பாதுகாப்பானது."
  },
  {
    id: "legal-heir-certificate",
    category: "family",
    code: "REV-114",
    title_en: "Legal Heir Certificate (வாரிசுச் சான்றிதழ்)",
    title_ta: "வாரிசுச் சான்றிதழ் (நேரடி வாரிசு & வாரிசுரிமை)",
    department_en: "Revenue and Disaster Management Department",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_name: "TNeGA e-Sevai Portal",
    portal_url: "https://www.tnesevai.tn.gov.in",
    fee_en: "₹60 Application Fee",
    fee_ta: "₹60 விண்ணப்பக் கட்டணம்",
    sla_en: "15 Working Days",
    sla_ta: "15 வேலை நாட்கள்",
    summary_en: "Establishes legal successors of a deceased family member for pension settlement, bank deposits, property transfer, and compassionate jobs.",
    summary_ta: "மறைந்த குடும்பத் தலைவரின் வாரிசுகளை சட்டப்பூர்வமாக உறுதிசெய்து பிஎஃப், வங்கி சேமிப்பு மற்றும் சொத்து மாற்றத்திற்குப் பயன்படும் சான்றிதழ்.",
    documents_en: [
      "Original Death Certificate of the deceased person (இறப்புச் சான்றிதழ்)",
      "Smart Ration Card of the deceased and all legal heirs (குடும்ப அட்டை)",
      "Aadhaar Cards of all surviving legal heirs (மனைவி/கணவர், பிள்ளைகள், தாய்)",
      "Birth certificates or School TCs of all children showing parents' names",
      "Marriage Registration Certificate or wedding invitation of the spouse",
      "Parent's Death Certificate if deceased's mother/father are also deceased",
      "Self-declaration affidavit signed before a Notary Public stating complete list of legal heirs"
    ],
    documents_ta: [
      "மறைந்த நபரின் அசல் இறப்புச் சான்றிதழ்",
      "இறந்தவர் மற்றும் அனைத்து வாரிசுகளின் ஸ்மார்ட் குடும்ப அட்டை",
      "உயிருடன் உள்ள அனைத்து வாரிசுகளின் ஆதார் அட்டைகள் (மனைவி/கணவர், பிள்ளைகள், தாய்)",
      "பிள்ளைகளின் பிறப்புச் சான்றிதழ் அல்லது பள்ளி மாற்றுச் சான்றிதழ் (TC)",
      "திருமணப் பதிவுச் சான்றிதழ் அல்லது திருமண அழைப்பிதழ்",
      "இறந்தவரின் தாய்/தந்தை ஏற்கனவே மறைந்திருந்தால் அவர்களின் இறப்புச் சான்றிதழ்",
      "அனைத்து வாரிசுகளின் விபரங்களை உறுதிசெய்யும் நோட்டரி உறுதிமொழிப் பத்திரம்"
    ],
    procedure_en: [
      "Log in to tnesevai.tn.gov.in with CAN number and select 'Legal Heir Certificate (REV-114)'.",
      "Fill deceased person's details, date of death, and add all surviving legal heirs with relationship.",
      "Upload scanned PDFs of Death Certificate, Ration Card, Aadhaar cards, and Affidavit.",
      "Pay ₹60 fee online and note the application tracking ID.",
      "VAO and Revenue Inspector perform local inquiry and submit report to Tahsildar for approval."
    ],
    procedure_ta: [
      "tnesevai.tn.gov.in தளத்தில் CAN எண் மூலம் உள்நுழைந்து 'Legal Heir Certificate (REV-114)' தேர்வு செய்யவும்.",
      "மறைந்த நபரின் விபரங்கள் மற்றும் அனைத்து நேரடி வாரிசுகளின் விபரங்களை உள்ளிடவும்.",
      "இறப்புச் சான்றிதழ், குடும்ப அட்டை, ஆதார் அட்டைகள் மற்றும் உறுதிமொழிப் படிவத்தைப் பதிவேற்றவும்.",
      "₹60 கட்டணம் செலுத்தி ஒப்புகை ரசீதைப் பெறவும்.",
      "VAO மற்றும் வருவாய் ஆய்வாளர் நேரடி விசாரணை நடத்தி தாசில்தாருக்கு அறிக்கை சமர்ப்பித்து சான்றிதழ் வழங்குவர்."
    ],
    rejection_tips_en: "Do not omit any daughter, married daughter, or second wife's children; false affidavits lead to criminal prosecution and cancellation.",
    rejection_tips_ta: "திருமணமான மகள்கள் உட்பட எந்தவொரு நேரடி வாரிசையும் மறைக்கக் கூடாது. வாரிசு மறைப்பு கண்டறியப்பட்டால் மனு நிராகரிக்கப்படும்."
  },
  {
    id: "income-certificate",
    category: "identity",
    code: "REV-103",
    title_en: "Income Certificate (வருமானச் சான்றிதழ்)",
    title_ta: "வருமானச் சான்றிதழ் (ஆண்டு குடும்ப வருமானம்)",
    department_en: "Revenue and Disaster Management Department",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_name: "TNeGA e-Sevai Portal",
    portal_url: "https://www.tnesevai.tn.gov.in",
    fee_en: "₹60 Application Fee",
    fee_ta: "₹60 விண்ணப்பக் கட்டணம்",
    sla_en: "7 to 15 Working Days",
    sla_ta: "7 முதல் 15 வேலை நாட்கள்",
    summary_en: "Certifies total annual family income from all sources; mandatory for scholarships, fee waivers, and welfare entitlements.",
    summary_ta: "குடும்பத்தின் மொத்த ஆண்டு வருமானத்தைச் சான்றளிக்கும் ஆவணம். கல்வி உதவித்தொகை மற்றும் அரசு நலத்திட்டங்களுக்கு கட்டாயம்.",
    documents_en: [
      "Applicant Aadhaar Card (விண்ணப்பதாரர் ஆதார் அட்டை)",
      "Smart Ration Card / Family Card (குடும்ப அட்டை)",
      "Applicant passport size photograph (பாஸ்போர்ட் அளவு புகைப்படம்)",
      "Salary Slip / Form 16 / Income Certificate from employer (for employed persons)",
      "Income Tax Returns (ITR-V) acknowledgement (if paying income tax)",
      "Self-declaration certificate on income signed by applicant"
    ],
    documents_ta: [
      "விண்ணப்பதாரரின் ஆதார் அட்டை",
      "ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு)",
      "விண்ணப்பதாரரின் சமீபத்திய பாஸ்போர்ட் அளவு புகைப்படம்",
      "சம்பளச் சான்றிதழ் / Form 16 (வேலைக்குச் செல்வோர் எனில்)",
      "வருமான வரி செலுத்துபவர் எனில் ITR தாக்கல் செய்த ரசீது",
      "விண்ணப்பதாரரின் வருமான சுய பிரகடனப் படிவம் (Self Declaration Form)"
    ],
    procedure_en: [
      "Log in to tnesevai.tn.gov.in and click Revenue Department -> Income Certificate (REV-103).",
      "Select source of income (agriculture, salary, business, daily wage) and enter total annual income.",
      "Upload PDF copies of Ration Card, Aadhaar, salary proof, and photo.",
      "Pay ₹60 fee online. Track status via SMS alerts.",
      "Download digitally signed certificate valid for 1 financial year."
    ],
    procedure_ta: [
      "tnesevai.tn.gov.in தளத்தில் உள்நுழைந்து 'Income Certificate (REV-103)' தேர்ந்தெடுக்கவும்.",
      "வருமான ஆதாரம் (வேளாண்மை, மாத சம்பளம், கூலி வேலை) மற்றும் ஆண்டு வருமானத்தை குறிப்பிடவும்.",
      "ஆதார், குடும்ப அட்டை, வருமான ஆதாரம் மற்றும் புகைப்படத்தைப் பதிவேற்றவும்.",
      "₹60 கட்டணம் செலுத்தவும். VAO ஆய்வுக்குப் பின் டிஜிட்டல் சான்றிதழைப் பதிவிறக்கலாம்."
    ],
    rejection_tips_en: "Ensure income declared on application matches salary slip or bank credit records exactly.",
    rejection_tips_ta: "விண்ணப்பத்தில் குறிப்பிட்ட வருமானமும் வங்கி கணக்கு / சம்பளச் சான்றிதழில் உள்ள வருமானமும் சரியாகப் பொருந்த வேண்டும்."
  },
  {
    id: "community-caste-certificate",
    category: "identity",
    code: "REV-101",
    title_en: "Community / Caste Certificate (சாதிச் சான்றிதழ்)",
    title_ta: "சாதிச் சான்றிதழ் (BC, MBC, SC, ST இடஒதுக்கீடு)",
    department_en: "Revenue and Disaster Management Department",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_name: "TNeGA e-Sevai Portal",
    portal_url: "https://www.tnesevai.tn.gov.in",
    fee_en: "₹60 Application Fee",
    fee_ta: "₹60 விண்ணப்பக் கட்டணம்",
    sla_en: "15 Working Days",
    sla_ta: "15 வேலை நாட்கள்",
    summary_en: "Mandatory statutory proof of social category required for school/college admissions, competitive exams (TNPSC/UPSC), and job reservations.",
    summary_ta: "பள்ளி, கல்லூரி சேர்க்கை மற்றும் அரசு வேலைவாய்ப்பு இடஒதுக்கீட்டைப் பெற உதவும் வாழ்நாள் சட்டப்பூர்வ சான்றிதழ்.",
    documents_en: [
      "Applicant Aadhaar Card and Smart Ration Card (ஆதார் & குடும்ப அட்டை)",
      "Father's or Mother's Community Certificate copy (பெற்றோரின் சாதிச் சான்றிதழ்)",
      "Applicant's School Transfer Certificate (TC) or Bonafide mentioning caste",
      "Parents' School TC showing caste column (if parent has no community certificate)",
      "Passport size photograph of the applicant",
      "Self-declaration form signed by parent / guardian"
    ],
    documents_ta: [
      "விண்ணப்பதாரரின் ஆதார் அட்டை மற்றும் குடும்ப அட்டை",
      "தந்தை அல்லது தாயின் சாதிச் சான்றிதழ் நகல்",
      "விண்ணப்பதாரரின் பள்ளி மாற்றுச் சான்றிதழ் (TC) அல்லது பயிலும் சான்றிதழ்",
      "பெற்றோருக்கு சாதிச் சான்றிதழ் இல்லாதபோது பெற்றோரின் பள்ளி மாற்றுச் சான்றிதழ் (TC)",
      "பாஸ்போர்ட் அளவு புகைப்படம் மற்றும் சுய பிரகடனப் படிவம்"
    ],
    procedure_en: [
      "Select Community Certificate (REV-101) on tnesevai.tn.gov.in using CAN account.",
      "Choose Community category (BC, MBC/DNC, SC, ST) and specific caste name from the official dropdown.",
      "Upload Parent Community Certificate and School TC proofs.",
      "Pay ₹60 fee online. Tahsildar / Zonal Deputy Tahsildar approves after VAO enquiry.",
      "Community certificate has lifetime validity — no renewal needed."
    ],
    procedure_ta: [
      "tnesevai தளத்தில் 'Community Certificate (REV-101)' என்பதைத் தேர்வு செய்யவும்.",
      "பிரிவு (BC, MBC, SC, ST) மற்றும் உள் சாதிப் பெயரை பட்டியலிலிருந்து தேர்ந்தெடுக்கவும்.",
      "பெற்றோரின் சாதிச் சான்றிதழ் மற்றும் பள்ளி TC நகல்களைப் பதிவேற்றவும்.",
      "₹60 கட்டணம் செலுத்தவும். VAO நேரடி விசாரணைக்குப் பின் நிரந்தர வாழ்நாள் சான்றிதழ் வழங்கப்படும்."
    ],
    rejection_tips_en: "For ST community certificates, applications must be submitted directly to RDO (Revenue Divisional Officer), not Tahsildar.",
    rejection_tips_ta: "பழங்குடியினர் (ST) சான்றிதழுக்கு தாசில்தார் வழங்க முடியாது; வருவாய் கோட்டாட்சியர் (RDO) அலுவலகத்திற்கு விண்ணப்பிக்க வேண்டும்."
  },
  {
    id: "nativity-residence-certificate",
    category: "identity",
    code: "REV-102",
    title_en: "Nativity & Residence Certificate (இருப்பிட சான்றிதழ்)",
    title_ta: "இருப்பிட / தமிழ்நாட்டு பூர்வீகச் சான்றிதழ்",
    department_en: "Revenue and Disaster Management Department",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_name: "TNeGA e-Sevai Portal",
    portal_url: "https://www.tnesevai.tn.gov.in",
    fee_en: "₹60 Application Fee",
    fee_ta: "₹60 விண்ணப்பக் கட்டணம்",
    sla_en: "7 Working Days",
    sla_ta: "7 வேலை நாட்கள்",
    summary_en: "Proves continuous residence in Tamil Nadu; mandatory for state-quota medical (NEET) and engineering (TNEA) counselling admissions.",
    summary_ta: "தமிழ்நாட்டில் நிரந்தரமாக வசிப்பதை உறுதிசெய்யும் சான்றிதழ். தமிழ்நாடு அரசு ஒதுக்கீட்டு மருத்துவ மற்றும் பொறியியல் கலந்தாய்விற்கு கட்டாயம்.",
    documents_en: [
      "Applicant Aadhaar Card and Smart Ration Card (ஆதார் & குடும்ப அட்டை)",
      "Applicant's School Study Certificates continuously from Std 1 to 12 in Tamil Nadu",
      "Birth Certificate of applicant showing birth place within Tamil Nadu",
      "Parents' Smart Ration Card or Voter ID card in Tamil Nadu",
      "EB Electricity Bill / Property Tax receipt / Rental Agreement for 5+ years residence proof"
    ],
    documents_ta: [
      "விண்ணப்பதாரர் ஆதார் அட்டை மற்றும் குடும்ப அட்டை",
      "தமிழ்நாட்டில் 1-ஆம் வகுப்பு முதல் 12-ஆம் வகுப்பு வரை தொடர்ந்து படித்ததற்கான பள்ளி படிப்புச் சான்றிதழ்கள்",
      "தமிழ்நாட்டில் பிறந்ததற்கான பிறப்புச் சான்றிதழ்",
      "பெற்றோரின் வாக்காளர் அடையாள அட்டை / குடும்ப அட்டை",
      "வீட்டு மின் கட்டண ரசீது / சொத்து வரி ரசீது / வாடகை ஒப்பந்தம்"
    ],
    procedure_en: [
      "Apply for Nativity Certificate (REV-102) under Revenue tab on tnesevai.tn.gov.in.",
      "Upload birth certificate, continuous school study proofs, and parent residence documents.",
      "Pay ₹60 fee online.",
      "VAO verifies local residence history and Tahsildar approves within 7 days."
    ],
    procedure_ta: [
      "tnesevai தளத்தில் 'Nativity Certificate (REV-102)' தேர்ந்தெடுக்கவும்.",
      "பிறப்புச் சான்றிதழ், பள்ளி படிப்புச் சான்றுகள் மற்றும் குடும்ப அட்டையைப் பதிவேற்றவும்.",
      "₹60 கட்டணம் செலுத்தவும். VAO ஆய்வுக்குப் பின் 7 நாட்களில் டிஜிட்டல் சான்றிதழ் வழங்கப்படும்."
    ],
    rejection_tips_en: "Students who studied outside TN for part of schooling must submit parent nativity proofs to claim 85% TN state quota.",
    rejection_tips_ta: "வெளி மாநிலத்தில் சில ஆண்டுகள் படித்த மாணவர்கள் பெற்றோரின் பூர்வீக ஆவணங்களை சமர்ப்பிக்க வேண்டும்."
  },
  {
    id: "first-graduate-certificate",
    category: "education",
    code: "REV-104",
    title_en: "First Graduate Certificate (முதல் பட்டதாரி சான்றிதழ்)",
    title_ta: "முதல் பட்டதாரி சான்றிதழ் (கல்லூரி கட்டண சலுகை)",
    department_en: "Revenue and Disaster Management Department",
    department_ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
    portal_name: "TNeGA e-Sevai Portal",
    portal_url: "https://www.tnesevai.tn.gov.in",
    fee_en: "₹60 Application Fee",
    fee_ta: "₹60 விண்ணப்பக் கட்டணம்",
    sla_en: "15 Working Days",
    sla_ta: "15 வேலை நாட்கள்",
    summary_en: "Waives annual tuition fee up to ₹25,000 to ₹75,000 in professional degree courses (Engineering, Medical, Agri) for first-generation graduates.",
    summary_ta: "குடும்பத்தில் யாரும் பட்டப்படிப்பு முடிக்காத பட்சத்தில், பொறியியல்/மருத்துவக் கல்லூரிகளில் ஆண்டுக்கு ₹25,000 முதல் ₹75,000 வரை கல்விக் கட்டண விலக்கு அளிக்கும் சான்றிதழ்.",
    documents_en: [
      "Applicant 10th and 12th Marksheets / School TC (பள்ளி மாற்றுச் சான்றிதழ்)",
      "Father's and Mother's School TC or Educational Proof (declaring they have not graduated)",
      "Elder siblings' (brothers/sisters) School/College TC or Bonafide (proving they are not graduates)",
      "Death certificate of parent if deceased",
      "Smart Ration Card and Applicant Aadhaar Card",
      "Joint Declaration signed by student and parents certifying no graduate in family"
    ],
    documents_ta: [
      "மாணவரின் 10 மற்றும் 12-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ் / பள்ளி TC",
      "தந்தை மற்றும் தாயின் பள்ளி மாற்றுச் சான்றிதழ் (பட்டப்படிப்பு படிக்கவில்லை என்பதை உறுதிசெய்ய)",
      "உடன்பிறந்த மூத்த சகோதரர்/சகோதரிகளின் பள்ளி/கல்லூரி TC நகல்கள்",
      "பெற்றோர் மறைந்திருந்தால் அவர்களின் இறப்புச் சான்றிதழ்",
      "ஸ்மார்ட் குடும்ப அட்டை மற்றும் மாணவரின் ஆதார் அட்டை",
      "குடும்பத்தில் யாரும் பட்டதாரி இல்லை என்பதை உறுதிசெய்யும் தந்தை, தாய், மாணவர் கையொப்பமிட்ட கூட்டு உறுதிமொழிப் படிவம்"
    ],
    procedure_en: [
      "Select First Graduate Certificate (REV-104) on tnesevai.tn.gov.in.",
      "Enter family tree (Father, Mother, Brothers, Sisters) and upload each member's educational TC.",
      "Upload signed Joint Declaration form (downloadable template from portal).",
      "Pay ₹60 fee online and submit before TNEA / Medical counselling deadline.",
      "Download certificate and upload to TNEA counselling portal for immediate tuition fee waiver."
    ],
    procedure_ta: [
      "tnesevai தளத்தில் 'First Graduate Certificate (REV-104)' தேர்ந்தெடுக்கவும்.",
      "குடும்ப உறுப்பினர்கள் (தந்தை, தாய், உடன்பிறப்புகள்) கல்வி விபரங்களை உள்ளிட்டு அவர்களின் TC நகல்களைப் பதிவேற்றவும்.",
      "கூட்டு உறுதிமொழிப் படிவத்தைப் பதிவிறக்கி கையொப்பமிட்டு பதிவேற்றவும்.",
      "₹60 கட்டணம் செலுத்தவும். VAO ஆய்வுக்குப் பின் சான்றிதழ் வழங்கப்படும்."
    ],
    rejection_tips_en: "If an elder brother or sister has already graduated or availed first graduate concession, younger siblings are strictly NOT eligible.",
    rejection_tips_ta: "மூத்த அண்ணன் அல்லது அக்கா ஏற்கனவே பட்டப்படிப்பு முடித்திருந்தால் அல்லது சலுகை பெற்றிருந்தால் இளையவருக்கு இச்சலுகை கிடைக்காது."
  },
  {
    id: "smart-ration-card-services",
    category: "family",
    code: "PDS-CARD",
    title_en: "Smart Ration Card Services (TNPDS குடும்ப அட்டை)",
    title_ta: "புதிய குடும்ப அட்டை & பெயர் சேர்த்தல்/நீக்கல் சேவைகள்",
    department_en: "Civil Supplies and Consumer Protection Department",
    department_ta: "உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை",
    portal_name: "TNPDS Portal",
    portal_url: "https://www.tnpds.gov.in",
    fee_en: "Free online application",
    fee_ta: "இணையவழியில் முற்றிலும் இலவசம்",
    sla_en: "15 to 30 Working Days",
    sla_ta: "15 முதல் 30 வேலை நாட்கள்",
    summary_en: "Apply for new Smart Ration Card, add child's name, remove married member, or update address & gas cylinder count.",
    summary_ta: "புதிய ஸ்மார்ட் குடும்ப அட்டைக்கு விண்ணப்பித்தல், குழந்தை பெயர் சேர்த்தல், திருமணமான உறுப்பினர் பெயர் நீக்குதல் மற்றும் முகவரி மாற்றம்.",
    documents_en: [
      "Aadhaar Cards of all family members to be included on the card (அனைத்து குடும்ப உறுப்பினர்கள் ஆதார்)",
      "Surrender / Deletion Certificate from parental card (for newly married applicants)",
      "Child's Birth Certificate (for adding children below 5 years without Aadhaar)",
      "Gas connection consumer number / LPG booking slip",
      "Residence proof: Electricity (EB) bill, Property tax receipt, or Registered rent agreement"
    ],
    documents_ta: [
      "அட்டையில் சேர்க்கப்பட வேண்டிய அனைத்து குடும்ப உறுப்பினர்களின் ஆதார் அட்டைகள்",
      "திருமணமானவர்கள் எனில் பெற்றோரின் குடும்ப அட்டையிலிருந்து பெயர் நீக்கியதற்கான நீக்கல் சான்றிதழ் (Deletion Certificate)",
      "5 வயதுக்குட்பட்ட குழந்தைகள் எனில் பிறப்புச் சான்றிதழ் நகல்",
      "எரிவாயு இணைப்பு விபரம் (LPG Consumer No.)",
      "இருப்பிட ஆதாரம்: மின் கட்டண ரசீது / வீட்டு வரி ரசீது / வாடகை ஒப்பந்தம்"
    ],
    procedure_en: [
      "Visit tnpds.gov.in and select 'Apply New Smart Card' or 'Smart Card Related Services'.",
      "Enter Head of Family details, address, and upload photograph.",
      "Add members by validating their 12-digit Aadhaar numbers with OTP.",
      "Upload gas connection proof and address proof PDF.",
      "Inspection Officer (TSO / Taluk Supply Officer) validates and approves delivery via Fair Price Shop."
    ],
    procedure_ta: [
      "tnpds.gov.in தளத்திற்குச் சென்று 'புதிய மின்னணு அட்டை விண்ணப்பிக்க' அல்லது 'அட்டை தொடர்பான சேவைகள்' கிளிக் செய்யவும்.",
      "குடும்பத் தலைவர் விபரங்கள், முகவரி மற்றும் புகைப்படத்தைப் பதிவேற்றவும்.",
      "ஆதார் எண்களை உள்ளிட்டு OTP மூலம் உறுப்பினர்களை இணைக்கவும்.",
      "எரிவாயு இணைப்பு மற்றும் முகவரி ஆதாரத்தைப் பதிவேற்றவும்.",
      "வட்ட வழங்கல் அலுவலர் (TSO) கள ஆய்வுக்குப் பின் நியாயவிலைக் கடையில் புதிய அட்டை வழங்கப்படும்."
    ],
    rejection_tips_en: "Applicant's name must NOT be present in any active ration card anywhere in India. Deletion certificate is mandatory.",
    rejection_tips_ta: "பெயர் ஏற்கனவே பெற்றோரின் அட்டையில் இருந்தால் கண்டிப்பாக பெயர் நீக்கல் சான்றிதழ் இணைக்கப்பட வேண்டும்."
  }
];

const CATEGORIES = [
  { id: "all", label_en: "All 8 Core Services", label_ta: "அனைத்து 8 சேவைகள்" },
  { id: "land", label_en: "Land & Property (பட்டா & EC)", label_ta: "நிலம் & பட்டா / EC" },
  { id: "identity", label_en: "Identity & Caste (சாதி & வருமானம்)", label_ta: "சாதி & வருமானம்" },
  { id: "education", label_en: "Education (முதல் பட்டதாரி)", label_ta: "கல்வி & முதல் பட்டதாரி" },
  { id: "family", label_en: "Family & Ration (குடும்பம் & ரேஷன்)", label_ta: "குடும்பம் & ரேஷன்" },
];

export default function EsevaiCertificateFinder() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(ESEVAI_SERVICES[0].id);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return ESEVAI_SERVICES.filter((svc) => {
      const matchesCategory = activeCategory === "all" || svc.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        svc.title_en.toLowerCase().includes(q) ||
        svc.title_ta.toLowerCase().includes(q) ||
        svc.code.toLowerCase().includes(q) ||
        svc.summary_en.toLowerCase().includes(q) ||
        svc.summary_ta.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  // Toggle document checklist
  const toggleDoc = (svcId, docIdx) => {
    const key = `${svcId}-${docIdx}`;
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Copy document checklist to clipboard
  const handleCopyDocs = (svc) => {
    const title = lang === "ta" ? svc.title_ta : svc.title_en;
    const docs = lang === "ta" ? svc.documents_ta : svc.documents_en;
    const fee = lang === "ta" ? svc.fee_ta : svc.fee_en;
    const sla = lang === "ta" ? svc.sla_ta : svc.sla_en;

    const text = `📋 ${title} (${svc.code})\n` +
      `🌐 Portal: ${svc.portal_url}\n` +
      `💰 Fee: ${fee}\n` +
      `⏱️ Delivery: ${sla}\n\n` +
      `📌 Required Documents Checklist:\n` +
      docs.map((d, i) => `${i + 1}. ${d}`).join("\n") +
      `\n\nVerified via VizhiTN.in — Tamil Nadu Civic Platform`;

    navigator.clipboard.writeText(text);
    setCopiedId(svc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // WhatsApp Share
  const handleWhatsappShare = (svc) => {
    const title = lang === "ta" ? svc.title_ta : svc.title_en;
    const docs = lang === "ta" ? svc.documents_ta : svc.documents_en;
    const fee = lang === "ta" ? svc.fee_ta : svc.fee_en;

    const message = `*${title} (${svc.code}) — Documents Checklist*\n\n` +
      `*Fee:* ${fee}\n*Apply Online:* ${svc.portal_url}\n\n` +
      `*Required Documents:*\n` +
      docs.map((d, i) => `✓ ${d}`).join("\n") +
      `\n\nShared via VizhiTN: https://www.vizhitn.in/esevai`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="w-full">
      {/* Hero Visual Card with High-Impact Badge */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-10 mb-8 border border-emerald-500/20 shadow-xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{T("Updated 2026 TNeGA Citizen Guide", "2026 தமிழ்நாடு இ-சேவை வழிகாட்டி")}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            {T(
              "Tamil Nadu e-Sevai Online Services & Certificate Checklist",
              "தமிழ்நாடு இ-சேவை ஆன்லைன் சான்றிதழ்கள் & ஆவணங்கள் வழிகாட்டி"
            )}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
            {T(
              "Never pay middleman fees or face application rejections. Check exact official fees, statutory delivery timelines, and interactive document checklists for Patta, EC, Legal Heir, Income, and Community certificates.",
              "இடத்தரகர்களுக்கு லஞ்சம் கொடுக்காமல் சாதி, வருமானம், பட்டா மாறுதல், வில்லங்கச் சான்றிதழ் (EC), வாரிசுச் சான்றிதழ்களை அரசு நிர்ணயித்த ₹60 கட்டணத்தில் ஆன்லைனில் விண்ணப்பிக்கும் முழு வழிகாட்டி."
            )}
          </p>

          {/* Quick CAN Registration Notice Banner */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/30 rounded-xl text-emerald-300 flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">
                  {T("First Time Applying? You Need a CAN Number", "முதல்முறை விண்ணப்பிக்கிறீர்களா? CAN எண் அவசியம்")}
                </p>
                <p className="text-slate-300">
                  {T("Citizen Access Number links your Aadhaar to all 150+ TNeGA services. Created once, valid for life.", "ஆதார் மற்றும் மொபைல் எண்ணை இணைத்து உருவாக்கப்படும் 13 இலக்க நிரந்தர அடையாள எண்.")}
                </p>
              </div>
            </div>
            <a
              href="https://www.tnesevai.tn.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap"
            >
              <span>{T("Open tnesevai.tn.gov.in", "இ-சேவை தளம் திற")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T(
                "Search certificate name (e.g. Patta, Income, REV-103, வாரிசு, EC)...",
                "சான்றிதழ் பெயர் உள்ளிடவும் (எ.கா: பட்டா, வருமானம், வாரிசு, EC)..."
              )}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(cat.label_en, cat.label_ta)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid & Accordion */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
              {T("No certificates matched your search.", "தேடலுக்குரிய சான்றிதழ்கள் கிடைக்கவில்லை.")}
            </p>
          </div>
        ) : (
          filteredServices.map((svc) => {
            const isExpanded = expandedId === svc.id;
            const isCopied = copiedId === svc.id;

            return (
              <div
                key={svc.id}
                id={svc.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-emerald-500 dark:border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : svc.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex-shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-900/40">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          {svc.code}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {T(svc.department_en, svc.department_ta)}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {T(svc.title_en, svc.title_ta)}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {T(svc.summary_en, svc.summary_ta)}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Toggle */}
                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    <div className="hidden lg:flex flex-col items-end text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                        {T(svc.fee_en, svc.fee_ta)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {T(svc.sla_en, svc.sla_ta)}
                      </span>
                    </div>
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180 text-emerald-600" : ""}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                    {/* Key Metrics Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          {T("Official Govt Fee", "அரசு நிர்ணயித்த கட்டணம்")}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {T(svc.fee_en, svc.fee_ta)}
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          {T("Statutory Timeline (SLA)", "சட்டப்பூர்வ காலக்கெடு")}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          {T(svc.sla_en, svc.sla_ta)}
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          {T("Authorized Web Portal", "அதிகாரப்பூர்வ இணையதளம்")}
                        </span>
                        <a
                          href={svc.portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 truncate"
                        >
                          <Building className="w-4 h-4 flex-shrink-0" />
                          {svc.portal_name}
                        </a>
                      </div>
                    </div>

                    {/* Interactive Document Checklist */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            {T("Required Documents Checklist (தேவையான ஆவணங்கள்)", "விண்ணப்பிக்க தேவையான ஆவணங்கள் பட்டியல்")}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {T("Tick the boxes as you arrange each document. Never submit without all items.", "ஆவணங்களை சரிபார்த்து டிக் செய்யவும். அனைத்தும் தயாரான பின் விண்ணப்பிக்கவும்.")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyDocs(svc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy List", "பட்டியலை நகலெடு")}</span>
                          </button>
                          <button
                            onClick={() => handleWhatsappShare(svc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition border border-emerald-200 dark:border-emerald-800/50"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{T("WhatsApp", "வாட்ஸ்அப்")}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {(lang === "ta" ? svc.documents_ta : svc.documents_en).map((doc, idx) => {
                          const isChecked = !!checkedDocs[`${svc.id}-${idx}`];
                          return (
                            <label
                              key={idx}
                              onClick={() => toggleDoc(svc.id, idx)}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                                isChecked
                                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                              />
                              <span className={`text-xs font-medium leading-relaxed ${isChecked ? "text-emerald-900 dark:text-emerald-200 line-through opacity-80" : "text-slate-700 dark:text-slate-300"}`}>
                                {doc}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step-by-Step Procedure */}
                    <div className="mb-6">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                        {T("Step-by-Step Online Application Workflow", "ஆன்லைனில் விண்ணப்பிக்கும் படிநிலைகள்")}
                      </h3>
                      <div className="space-y-2">
                        {(lang === "ta" ? svc.procedure_ta : svc.procedure_en).map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="leading-relaxed font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rejection Prevention Alert */}
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 mb-6">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5">
                          {T("Rejection Prevention Advice:", "விண்ணப்பம் நிராகரிக்கப்படாமல் இருக்க:")}
                        </strong>
                        <p>{T(svc.rejection_tips_en, svc.rejection_tips_ta)}</p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500">
                        {T("Verify all uploaded files are below 2MB in PDF/JPEG format.", "அனைத்து ஆவணங்களும் 2MB அளவுக்குள் இருப்பதை உறுதிசெய்யவும்.")}
                      </span>
                      <a
                        href={svc.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                      >
                        <span>{T("Apply on Official Govt Portal", "அரசு தளத்தில் விண்ணப்பிக்க")}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3-Step CAN Registration Walkthrough Card */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            {T("TNeGA Master Guide", "தமிழ்நாடு மின் ஆளுமை முகமை")}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            {T("How to Register CAN Number (Citizen Access Number) on e-Sevai", "e-Sevai தளத்தில் CAN எண் பதிவு செய்வது எப்படி?")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
            {T(
              "A Citizen Access Number (CAN) is a 13-digit unique identifier created by the Revenue Department. Once registered, you do not need to re-enter your family particulars for each certificate.",
              "CAN எண் என்பது உங்கள் ஆதார் அடிப்படையில் வழங்கப்படும் 13 இலக்க நிரந்தர அரசு அடையாள எண். இதை ஒருமுறை பதிவு செய்தால் போதும்; அனைத்து வருவாய்த் துறை சான்றிதழ்களையும் எளிதில் பெறலாம்."
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mb-3">
              1
            </span>
            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
              {T("Visit Citizen Portal", "1. குடிமக்கள் தளம் செல்லவும்")}
            </strong>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {T("Go to tnesevai.tn.gov.in and click 'Citizen Login'. Register with your mobile number to create your user account.", "tnesevai.tn.gov.in சென்று 'Citizen Login' கிளிக் செய்து மொபைல் எண் மூலம் பயனர் கணக்கை உருவாக்கவும்.")}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mb-3">
              2
            </span>
            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
              {T("Link Aadhaar & OTP", "2. ஆதார் & OTP சரிபார்ப்பு")}
            </strong>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {T("Click 'Register CAN'. Enter your 12-digit Aadhaar number, Father's name, Date of birth, and verify with Aadhaar OTP.", "'Register CAN' கிளிக் செய்து ஆதார் எண், பெற்றோர் பெயர், முகவரி உள்ளிட்டு OTP மூலம் உறுதிப்படுத்தவும்.")}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mb-3">
              3
            </span>
            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
              {T("Get 13-Digit CAN", "3. 13 இலக்க CAN எண்")}
            </strong>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {T("Your 13-digit CAN number is generated immediately and SMSed. Use this CAN to apply for all 150+ government services.", "உங்கள் மொபைலுக்கு 13 இலக்க CAN எண் குறுஞ்செய்தியாக வரும். இதை வைத்து சான்றிதழ்களை உடனடியாக விண்ணப்பிக்கலாம்.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
