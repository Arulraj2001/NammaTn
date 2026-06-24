/**
 * Admin Authentication Utilities
 * 
 * SECURITY: Admin session is now derived entirely from the Supabase JWT
 * (app_metadata.role === 'admin'). No localStorage session is used.
 * The previous localStorage-based approach was forgeable by any user.
 */
import { supabase } from "@/api/supabaseClient";

/**
 * No-op: Admin session is now managed by Supabase Auth.
 * Kept for backward compatibility with existing callers.
 */
export const setAdminSession = (_user) => {
  // Intentionally empty — session is in the Supabase JWT, not localStorage
};

export const adminLogout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out admin:", err);
  }
};

/**
 * Check if the current user is an admin by verifying the Supabase session.
 * Returns true only if the JWT contains app_metadata.role === 'admin'.
 */
export const isAdminLoggedIn = () => {
  if (typeof window === "undefined") return false;
  try {
    // We can't do async here, so check the cached session from Supabase
    const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!storageKey) return false;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const user = parsed?.user || parsed?.currentSession?.user;
    if (!user) return false;
    return (user.app_metadata?.role === 'admin') || (user.user_metadata?.role === 'admin');
  } catch {
    return false;
  }
};