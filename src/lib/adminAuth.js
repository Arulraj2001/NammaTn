import { supabase } from "@/api/supabaseClient";

const ADMIN_KEY = "tn_admin_session";

export const setAdminSession = (user) => {
  const session = { 
    loggedIn: true, 
    email: user.email,
    id: user.id,
    ts: Date.now() 
  };
  localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
};

export const adminLogout = async () => {
  localStorage.removeItem(ADMIN_KEY);
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out admin:", err);
  }
};

export const isAdminLoggedIn = () => {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    // Session expires after 8 hours
    const eightHours = 8 * 60 * 60 * 1000;
    if (Date.now() - session.ts > eightHours) {
      localStorage.removeItem(ADMIN_KEY);
      return false;
    }
    return session.loggedIn === true;
  } catch {
    return false;
  }
};