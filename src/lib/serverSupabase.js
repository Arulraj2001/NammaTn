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

export function createServerSupabase({ timeoutMs = DEFAULT_TIMEOUT_MS, useServiceRole = false } = {}) {
  const url = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const key = useServiceRole
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY)
    : process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createTimedFetch(timeoutMs) },
  });
}
