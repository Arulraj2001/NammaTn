import { createClient } from '@supabase/supabase-js';

const DEFAULT_TIMEOUT_MS = 3000;

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

export function createServerSupabase({ timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const url = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createTimedFetch(timeoutMs) },
  });
}
