import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthModal } from "@/context/AuthModalContext";
import GoogleIcon from "@/components/GoogleIcon";
import { Mail, Lock, Loader2 } from "lucide-react";

const TABS = [
  { id: "google", label: "Google" },
  { id: "password", label: "Email / Password" },
];

function GoogleTab() {
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname + window.location.search
      }
    });
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 text-center">Quickest way to join the community</p>
      <Button
        className="w-full h-12 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
        variant="outline"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
      <p className="text-xs text-slate-400 text-center">We only access your name and email</p>
    </div>
  );
}


function PasswordTab() {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (loginError) throw loginError;
      window.location.reload();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const { data, error: registerError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0],
            role: "user"
          }
        }
      });
      if (registerError) throw registerError;
      
      if (data?.session) {
        window.location.reload();
      } else {
        setSuccessMsg("Account created! Please check your email for a verification link.");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-slate-200 p-1 gap-1">
        {["login", "register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${mode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}>
            {m === "login" ? "Sign In" : "Register"}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      {successMsg && <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">{successMsg}</p>}
      <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-11" required />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-11" required />
        </div>
        {mode === "register" && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 h-11" required />
          </div>
        )}
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>
    </div>
  );
}

export default function AuthModal() {
  const { isOpen, close, reason } = useAuthModal();
  const [activeTab, setActiveTab] = useState("google");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <span className="font-bold text-lg">TN</span>
          </div>
          <h2 className="text-lg font-bold">Join TN Voice</h2>
          <p className="text-blue-100 text-sm mt-1">
            {reason || "Sign in to participate in the community"}
          </p>
        </div>

        <div className="p-5">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "google" && <GoogleTab />}
          {activeTab === "password" && <PasswordTab />}

          <p className="text-xs text-slate-400 text-center mt-4">
            By joining, you agree to keep discussions respectful and factual.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}