import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/context/AuthModalContext";
import { useLanguage } from "@/context/LanguageContext";
import GoogleIcon from "@/components/GoogleIcon";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthModal() {
  const { isOpen, close, reason } = useAuthModal();
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoadingGoogle(true);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname + window.location.search
        }
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setLoadingGoogle(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 px-6 pt-6 pb-5 text-white relative">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 shadow-xs">
            <span className="font-black text-lg tracking-wider">TN</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {T("Join VizhiTN", "VizhiTN-ல் இணையுங்கள்")}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 leading-snug">
            {reason || T("Sign in with Google to participate in your local civic community.", "குடிமக்கள் சமூகத்தில் பங்கேற்க உங்கள் கூகுள் கணக்குடன் இணையுங்கள்.")}
          </p>
        </div>

        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-sm font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white shadow-sm hover:shadow-md transition-all rounded-xl active:scale-[0.98]"
              variant="outline"
              disabled={loadingGoogle}
              onClick={handleGoogle}
            >
              {loadingGoogle ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
              ) : (
                <GoogleIcon className="w-5 h-5 mr-2.5 flex-shrink-0" />
              )}
              <span>{loadingGoogle ? T("Connecting to Google...", "கூகுள் கணக்கு இணைக்கப்படுகிறது...") : T("Continue with Google", "கூகுள் மூலம் தொடர்க")}</span>
            </Button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>{T("Instant 1-tap sign in. No password needed.", "கடவுச்சொல் இன்றி ஒரு நொடியில் உள்நுழையலாம்.")}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>{T("We only verify your name & email. Zero spam.", "பெயர் மற்றும் மின்னஞ்சல் மட்டுமே சரிபார்க்கப்படும்.")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}