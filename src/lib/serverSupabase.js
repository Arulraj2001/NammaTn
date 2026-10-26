import { createClient } from '@supabase/supabase-js';

const DEFAULT_TIMEOUT_MS = 8000;

function createTimedFetch(timeoutMs) {
  return async function timedFetch(input, init = {}) {
    const controller = new AbortController();
    const upstreamSignal = init.signal;
    const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (upstreamSignal) {
      if (upstreamSignal.aborted) abortFromUpstream();
      else upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true });
    }

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
      upstreamSignal?.removeEventListener?.('abort', abortFromUpstream);
    }
  };
}

const FALLBACK_SUPABASE_URL = 'https://hzgrzcablefquddisqkf.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3J6Y2FibGVmcXVkZGlzcWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDY4MTUsImV4cCI6MjA5NzEyMjgxNX0.Q2bjuJNvR-bk4RK0X87G5Zz-zJgXrfPwdiOClpSpYWQ';

export function createServerSupabase({ timeoutMs = DEFAULT_TIMEOUT_MS, useServiceRole = false } = {}) {
  const url =
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    FALLBACK_SUPABASE_URL;

  const key = useServiceRole
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY)
    : (process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY);
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createTimedFetch(timeoutMs) },
  });
}
