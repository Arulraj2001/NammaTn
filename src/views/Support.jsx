import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Heart, Upload, CheckCircle, Copy, ExternalLink, Coffee, 
  Shield, Zap, Lock, Check, Server, Bell, Users, MapPin 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

const PRESET_AMOUNTS = [10, 25, 50, 100, 200, 500];

function getSetting(settings, key, fallback = "") {
  return settings.find((s) => s.key === key)?.value || fallback;
}

export default function Support() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", transaction_ref: "", message: "" });
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const session = (() => {
    let s = localStorage.getItem("tn_session");
    if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem("tn_session", s); }
    return s;
  })();

  const { data: settings = [] } = useQuery({
    queryKey: ["donation-settings-public"],
    queryFn: () => base44.entities.PaymentSettings.list("key", 30),
    staleTime: 5 * 60 * 1000,
  });

  const upiId = getSetting(settings, "upi_id", "vizhitn@upi");
  const upiName = getSetting(settings, "upi_name", "VizhiTN");
  const qrUrl = getSetting(settings, "qr_image_url", "");
  const bmcLink = getSetting(settings, "buymecoffee_link", "");
  const razorpayEnabled = getSetting(settings, "razorpay_enabled", "false") === "true";
  const stripeEnabled = getSetting(settings, "stripe_enabled", "false") === "true";
  const bmcEnabled = getSetting(settings, "buymecoffee_enabled", "false") === "true";
  const donationMsg = getSetting(settings, "donation_message", "Your support keeps VizhiTN free, fast, and community-driven. Every contribution matters — thank you!");
  const minAmount = parseInt(getSetting(settings, "min_donation_amount", "10")) || 10;

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setScreenshot(file_url);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to make a donation", "நன்கொடை வழங்க உள்நுழையுங்கள்"));
      return;
    }
    setError(null);
    if (!form.transaction_ref.trim()) { setError(T("Transaction reference is required.", "பரிவர்த்தனை குறிப்பு அவசியம்.")); return; }
    if (finalAmount < minAmount) { setError(T(`Minimum donation is ₹${minAmount}.`, `குறைந்தது ₹${minAmount} நன்கொடை தேவை.`)); return; }

    await base44.entities.DonationRecord.create({
      session_ref: session,
      email: form.email,
      amount: finalAmount,
      currency: "INR",
      payment_method: "upi",
      transaction_ref: form.transaction_ref,
      message: form.message,
      is_anonymous: isAnonymous,
      status: "pending",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{T("Thank you!", "நன்றி!")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {T("Your donation has been received and will be confirmed within 24 hours. VizhiTN is grateful for your support!", "உங்கள் நன்கொடை பெறப்பட்டது. 24 மணி நேரத்தில் உறுதிப்படுத்தப்படும்.")}
          </p>
          <Button variant="outline" className="w-full" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", transaction_ref: "", message: "" }); setScreenshot(null); setCustomAmount(""); setAmount(50); }}>
            {T("Make another donation", "மீண்டும் நன்கொடை வழங்கு")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#e11d48] via-[#db2777] to-[#7c3aed] text-white py-12 px-4 overflow-hidden relative">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-md mx-auto lg:mx-0">
              <Heart className="w-6 h-6 text-[#e11d48] fill-[#e11d48]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {T("Support VizhiTN", "VizhiTN-ஐ ஆதரியுங்கள்")}
            </h1>
            <p className="text-rose-100 text-sm md:text-base max-w-lg mb-8 leading-relaxed font-medium mx-auto lg:mx-0">
              {T("Together, we can keep Tamil Nadu informed, safe and empowered.", "ஒன்றாக இணைந்து, பாதுகாப்பான மற்றும் தற்சார்புடைய தமிழ்நாட்டை உருவாக்குவோம்.")}
            </p>
            
            {/* 3 Columns of Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mb-8">
              <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Shield className="w-5 h-5 text-rose-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">{T("Community Driven", "சமூக வளர்ச்சி")}</p>
                  <p className="text-[10px] text-rose-100/80 mt-0.5 leading-normal">{T("100% independent and non-profit", "100% சுதந்திரமானது, லாப நோக்கற்றது")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Zap className="w-5 h-5 text-rose-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">{T("Real-time Impact", "உடனடி தாக்கம்")}</p>
                  <p className="text-[10px] text-rose-100/80 mt-0.5 leading-normal">{T("Your support helps us deliver faster alerts", "வேகமாக எச்சரிக்கைகளை அனுப்ப உதவும்")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Lock className="w-5 h-5 text-rose-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs text-white">{T("No Locked Features", "கட்டுப்பாடுகள் இல்லை")}</p>
                  <p className="text-[10px] text-rose-100/80 mt-0.5 leading-normal">{T("Everything on VizhiTN will always stay free", "அனைத்து அம்சங்களும் என்றும் இலவசம்")}</p>
                </div>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 text-xs font-semibold text-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{T("No subscriptions. No hidden fees. Everything stays free.", "சந்தாக்கள் இல்லை. மறைமுக கட்டணங்கள் இல்லை. அனைத்தும் இலவசம்.")}</span>
            </div>
          </div>
          
          {/* Right side illustration container */}
          <div className="flex-1 hidden lg:flex items-center justify-center relative w-full max-w-md">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes float-banner {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
            `}} />
            <img 
              src="/support-banner.png" 
              alt="VizhiTN Citizens" 
              className="w-full h-auto max-h-[220px] object-contain rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/15" 
              style={{
                animation: "float-banner 4s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Containers */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Support Amount Picker Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {T("Choose Support Amount", "ஆதரவு தொகையை தேர்வு செய்யவும்")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T("Your small support makes a big difference.", "உங்கள் சிறிய பங்களிப்பு பெரிய மாற்றத்தை ஏற்படுத்தும்.")}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
            {PRESET_AMOUNTS.map((a) => {
              const isSelected = amount === a && !customAmount;
              return (
                <div key={a} className="relative">
                  {a === 50 && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-500 text-[9px] font-extrabold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10">
                      {T("Most Popular", "பிரபலம்")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`w-full py-4 rounded-2xl border text-base font-extrabold transition-all relative ${isSelected ? "border-rose-500 bg-rose-500 text-white shadow-md ring-2 ring-rose-500/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg">₹{a}</span>
                      <span className={`text-[10px] font-normal mt-0.5 ${isSelected ? "text-rose-100" : "text-slate-400"}`}>
                        {a === 10 && T("Help get started", "தொடங்க உதவுங்கள்")}
                        {a === 25 && T("Support our work", "பணியை ஆதரியுங்கள்")}
                        {a === 50 && T("Keep us going", "தொடரச் செய்யுங்கள்")}
                        {a === 100 && T("Great choice", "சிறந்த தேர்வு")}
                        {a === 200 && T("Super supporter", "சூப்பர் ஆதரவாளர்")}
                        {a === 500 && T("Hero support", "ஹீரோ ஆதரவு")}
                      </span>
                    </div>
                  </button>
                  
                  {isSelected && (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center border border-white dark:border-slate-800 z-10 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="relative max-w-xl mx-auto mt-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
              placeholder={T(`Custom amount (min ₹${minAmount})`, `தனிப்பயன் தொகை (குறைந்தது ₹${minAmount})`)}
              className="w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium"
            />
          </div>
        </div>

        {/* Two Column Layout (UPI Details + Why Support) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: UPI Code and QR */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white mb-1 text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,2 L2,22 L22,22 Z" fill="#10B981" />
                  <path d="M12,5 L4.5,20 L19.5,20 Z" fill="#fff" />
                  <path d="M12,8 L7,18 L17,18 Z" fill="#10B981" />
                </svg>
                {T("Pay via UPI / QR", "UPI / QR மூலம் பணம் செலுத்துங்கள்")}
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                {T("Scan the QR code or pay using the UPI ID below.", "QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது கீழே உள்ள UPI ஐடியைப் பயன்படுத்தி செலுத்தவும்.")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* QR Code Container */}
                <div className="flex-shrink-0 bg-white p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
                  {qrUrl ? (
                    <img src={qrUrl} alt="UPI QR Code" className="w-32 h-32 object-contain" />
                  ) : (
                    <svg className="w-32 h-32 text-slate-800" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0" y="0" width="25" height="25" />
                      <rect x="3" y="3" width="19" height="19" fill="white" />
                      <rect x="7" y="7" width="11" height="11" />
                      
                      <rect x="75" y="0" width="25" height="25" />
                      <rect x="78" y="3" width="19" height="19" fill="white" />
                      <rect x="82" y="7" width="11" height="11" />
                      
                      <rect x="0" y="75" width="25" height="25" />
                      <rect x="3" y="78" width="19" height="19" fill="white" />
                      <rect x="7" y="82" width="11" height="11" />
                      
                      <rect x="35" y="5" width="6" height="6" />
                      <rect x="45" y="15" width="6" height="12" />
                      <rect x="55" y="5" width="12" height="6" />
                      <rect x="60" y="15" width="6" height="6" />
                      
                      <rect x="5" y="35" width="12" height="6" />
                      <rect x="20" y="45" width="6" height="12" />
                      <rect x="5" y="55" width="6" height="6" />
                      
                      <rect x="35" y="35" width="30" height="30" />
                      <rect x="38" y="38" width="24" height="24" fill="white" />
                      <path d="M50,44 C48,42 45,42 43,44 C41,46 41,50 43,52 L50,58 L57,52 C59,50 59,46 57,44 C55,42 52,42 50,44 Z" fill="#e11d48" />
                      
                      <rect x="75" y="35" width="6" height="18" />
                      <rect x="85" y="45" width="10" height="6" />
                      
                      <rect x="35" y="75" width="18" height="6" />
                      <rect x="45" y="85" width="6" height="10" />
                      <rect x="55" y="75" width="6" height="18" />
                      
                      <rect x="75" y="75" width="12" height="12" />
                    </svg>
                  )}
                </div>
                
                {/* UPI ID Details */}
                <div className="flex-1 w-full space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{T("UPI ID", "UPI ஐடி")}</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{upiId}</p>
                    </div>
                    <button
                      onClick={handleCopyUpi}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy", "நகலெடு")}
                    </button>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        {T("This UPI ID is linked to VizhiTN support account.", "இந்த UPI ஐடி VizhiTN ஆதரவு கணக்குடன் இணைக்கப்பட்டுள்ளது.")}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                        {T("Your payment is safe and secure.", "உங்கள் பரிவர்த்தனை முற்றிலும் பாதுகாப்பானது.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Why Support */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-base">
              {T("Why support VizhiTN?", "ஏன் VizhiTN-ஐ ஆதரிக்க வேண்டும்?")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Keeps servers running", "சேவையகங்களை இயக்குகிறது")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{T("Ensures 24x7 uptime", "24x7 தடையில்லா சேவையை உறுதி செய்யும்")}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-600 flex-shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Real-time civic alerts", "உடனடி குடிமை எச்சரிக்கைகள்")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{T("Faster updates for everyone", "அனைவருக்கும் வேகமான செய்திகள்")}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Better platform for all", "அனைவருக்குமான சிறந்த தளம்")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{T("More features, better experience", "அதிக அம்சங்கள், சிறந்த அனுபவம்")}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Expanding across TN", "தமிழகம் முழுவதும் விரிவுபடுத்தல்")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{T("Reaching more districts", "அதிக மாவட்டங்களை சென்றடையும்")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-1 text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            {T("Confirm Your Donation (Optional)", "உங்கள் நன்கொடையை உறுதிப்படுத்தவும் (விருப்பமானது)")}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {T("Already paid via UPI? Share your transaction details so we can acknowledge your support.", "UPI மூலம் ஏற்கனவே பணம் செலுத்தியிருந்தால், உங்கள் பரிவர்த்தனை விவரங்களை இங்கே பகிரவும்.")}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* UTR reference */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {T("UPI Transaction Reference / UTR *", "பரிவர்த்தனை குறிப்பு எண் / UTR *")}
                </label>
                <input
                  required
                  value={form.transaction_ref}
                  onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
                  placeholder="e.g. 123456789012"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400 font-medium"
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {T("Email (optional)", "மின்னஞ்சல் (விருப்பமானது)")}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Upload Payment Screenshot dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {T("Upload Payment Screenshot (optional)", "பரிவர்த்தனை ஸ்கிரீன்ஷாட் (விருப்பமானது)")}
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors h-[46px] overflow-hidden">
                  <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-500 font-semibold truncate max-w-[160px]">
                    {screenshot ? T("✓ Screenshot uploaded", "✓ பதிவேற்றப்பட்டது") : uploading ? T("Uploading...", "பதிவேற்றுகிறது...") : T("Upload Screenshot", "ஸ்கிரீன்ஷாட் பதிவேற்றவும்")}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="text-[10px] text-slate-400 mt-1 text-right">{T("JPG, PNG up to 5MB", "JPG, PNG 5MB வரை")}</p>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="accent-rose-500 rounded w-4 h-4"
                />
                {T("Keep my donation anonymous", "என் நன்கொடையை அநாமதேயமாக வைக்கவும்")}
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {T("Message (optional)", "செய்தி (விருப்பமானது)")}
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={T("Any message for the VizhiTN team...", "குழுவிற்கு ஏதேனும் செய்தி...")}
                rows={3}
                maxLength={300}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none placeholder:text-slate-400 font-medium"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <Button
              type="submit"
              className="w-full py-4 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all"
              disabled={uploading}
            >
              <Heart className="w-4 h-4 mr-2 fill-current" />
              {T("Submit Donation Details", "நன்கொடை விவரங்களை சமர்ப்பி")}
            </Button>
            
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{T("We respect your privacy. Your information is only used to verify your support.", "நாங்கள் உங்கள் தனியுரிமையை மதிக்கிறோம். உங்கள் தகவல் சரிபார்ப்பிற்கு மட்டுமே பயன்படுத்தப்படும்.")}</span>
            </div>
          </form>
        </div>

        {/* Footer Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 pt-8 mt-4">
          <div className="flex items-center justify-center md:justify-start gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Secure UPI Payments", "பாதுகாப்பான UPI செலுத்துதல்")}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{T("100% safe and encrypted", "100% பாதுகாப்பானது மற்றும் குறியாக்கம் செய்யப்பட்டது")}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-500 flex-shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Trusted by Community", "சமூகத்தின் நம்பிக்கை")}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{T("Thank you for supporting!", "ஆதரவு தந்தமைக்கு நன்றி!")}</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{T("Transparent & Honest", "வெளிப்படையானது & நேர்மையானது")}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{T("Every rupee makes impact", "ஒவ்வொரு ரூபாயும் மாற்றத்தை ஏற்படுத்தும்")}</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}