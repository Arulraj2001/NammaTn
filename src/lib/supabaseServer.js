// src/lib/supabaseServer.js
// Server-side Supabase client factory for Server Components and Route Handlers.
import { createServerSupabase } from '@/lib/serverSupabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const client = createServerSupabase();
  if (client) return client;

  // Fallback to direct env vars if createServerSupabase returned null
  const url = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables (URL/ANON_KEY) are missing.');
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
