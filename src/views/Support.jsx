import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Heart, Upload, CheckCircle, Copy, ExternalLink, Coffee } from "lucide-react";
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
      requireAuth(() => {}, T("Sign in to make a donation support", "நன்கொடை வழங்க உள்நுழையுங்கள்"));
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {T("Support VizhiTN", "VizhiTN-ஐ ஆதரியுங்கள்")}
          </h1>
          <p className="text-rose-100 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {donationMsg}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white">
            <span>✅</span>
            {T("No subscriptions. No locked features. Everything stays free.", "சந்தா இல்லை. அனைத்தும் இலவசம்.")}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Amount picker */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">{T("Choose an amount", "தொகையை தேர்வு செய்யுங்கள்")}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAmount(a); setCustomAmount(""); }}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${amount === a && !customAmount ? "bg-rose-500 text-white border-rose-500" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-700"}`}
              >
                ₹{a}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
            placeholder={T(`Custom amount (min ₹${minAmount})`, `தனிப்பயன் தொகை (குறைந்தது ₹${minAmount})`)}
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* UPI Payment */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm flex items-center gap-2">
            <span className="text-base">📱</span> {T("Pay via UPI / QR", "UPI / QR மூலம் பணம் செலுத்துங்கள்")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {qrUrl && (
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <img src={qrUrl} alt="QR Code" className="w-32 h-32 object-contain rounded-xl border border-slate-200 dark:border-slate-600" />
                <span className="text-xs text-slate-400">{T("Scan QR", "QR ஸ்கேன் செய்யுங்கள்")}</span>
              </div>
            )}
            <div className="flex-1 space-y-3">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{T("UPI ID", "UPI ID")}</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-sm flex-1 select-all">{upiId}</p>
                  <button onClick={handleCopyUpi} className="text-xs text-blue-600 flex items-center gap-1 hover:underline flex-shrink-0">
                    <Copy className="w-3 h-3" /> {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy", "நகலெடு")}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{upiName}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {T(`Send ₹${finalAmount || "—"} to the UPI ID above, then fill in the details below.`, `மேலே உள்ள UPI ID க்கு ₹${finalAmount || "—"} அனுப்பி, கீழே விவரங்களை நிரப்புங்கள்.`)}
              </p>
            </div>
          </div>
        </div>

        {/* External payment options */}
        {(bmcEnabled || razorpayEnabled || stripeEnabled) && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">{T("Other Payment Options", "மற்ற பணம் செலுத்தல் விருப்பங்கள்")}</h2>
            {bmcEnabled && bmcLink && (
              <a href={bmcLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 hover:shadow-sm transition-all">
                <Coffee className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{T("Buy Me a Coffee", "ஒரு கப் காபி வாங்கி தாருங்கள்")}</p>
                  <p className="text-xs text-slate-500">{T("Support instantly via Buy Me a Coffee", "Buy Me a Coffee மூலம் உடனடியாக ஆதரவு")}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
              </a>
            )}
            {razorpayEnabled && (
              <div className="flex items-center gap-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 opacity-70">
                <span className="text-lg">💳</span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Razorpay</p>
                  <p className="text-xs text-slate-500">{T("Cards, Net Banking, Wallets", "கார்டுகள், நெட் பேங்கிங்")}</p>
                </div>
                <span className="text-xs text-blue-600 ml-auto">{T("Coming soon", "விரைவில்")}</span>
              </div>
            )}
            {stripeEnabled && (
              <div className="flex items-center gap-3 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 opacity-70">
                <span className="text-lg">💳</span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Stripe</p>
                  <p className="text-xs text-slate-500">{T("International cards", "சர்வதேச கார்டுகள்")}</p>
                </div>
                <span className="text-xs text-purple-600 ml-auto">{T("Coming soon", "விரைவில்")}</span>
              </div>
            )}
          </div>
        )}

        {/* Confirmation form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
            {T("Confirm Your Donation (Optional)", "உங்கள் நன்கொடையை உறுதிப்படுத்துங்கள் (விருப்பமானது)")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {T("Already paid via UPI? Submit your transaction reference so we can acknowledge your contribution.", "UPI மூலம் பணம் செலுத்தியிருந்தால், உங்கள் பரிவர்த்தனை குறிப்பை சமர்ப்பியுங்கள்.")}
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{T("Transaction Reference / UTR *", "பரிவர்த்தனை குறிப்பு *")}</label>
              <input
                required
                value={form.transaction_ref}
                onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
                placeholder="UTR123456789"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{T("Email (optional)", "மின்னஞ்சல் (விருப்பமானது)")}</label>
              <input
                value={form.email}
                type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="accent-rose-500 rounded" />
              {T("Keep my donation anonymous", "என் நன்கொடையை அநாமதேயமாக வைக்கவும்")}
            </label>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{T("Message (optional)", "செய்தி (விருப்பமானது)")}</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={T("Any message for the team...", "குழுவிற்கு ஏதேனும் செய்தி...")}
                rows={2}
                maxLength={300}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">
                  {screenshot ? T("✓ Screenshot uploaded", "✓ ஸ்கிரீன்ஷாட் பதிவேற்றப்பட்டது") : uploading ? T("Uploading...", "பதிவேற்றுகிறது...") : T("Upload payment screenshot (optional)", "ஸ்கிரீன்ஷாட் பதிவேற்றுங்கள் (விருப்பமானது)")}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={uploading}>
              <Heart className="w-4 h-4 mr-2" />
              {T("Submit Donation Details", "நன்கொடை விவரங்களை சமர்ப்பி")}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          {T("VizhiTN is a community platform. All features remain free for everyone.", "VizhiTN ஒரு சமுதாய தளம். அனைத்து அம்சங்களும் அனைவருக்கும் இலவசம்.")}
        </p>
      </div>
    </div>
  );
}