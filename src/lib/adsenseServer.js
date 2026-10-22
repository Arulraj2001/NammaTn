import { createServerSupabase } from './serverSupabase';

let cachedConfig = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = process.env.NODE_ENV === 'production' ? 60 * 1000 : 1000;

export async function getServerAdSenseConfig() {
  const now = Date.now();
  if (cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  // Check environment variable fallback
  const envPubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || '';
  const envDigits = (envPubId.match(/\d{16}/) || [])[0];

  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'adsense_config')
        .limit(1)
        .maybeSingle();

      if (!error && data?.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        const digits = (String(parsed.pub_id || '').match(/\d{16}/) || [])[0];
        const normalized = {
          pub_id: digits ? `ca-pub-${digits}` : '',
          enabled: parsed.enabled !== false,
          slot_banner: parsed.slot_banner || '',
          slot_sidebar: parsed.slot_sidebar || '',
          slot_infeed: parsed.slot_infeed || '',
        };
        cachedConfig = normalized;
        lastFetchTime = now;
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[AdSense Server] Failed to query site_settings:', err.message);
  }

  if (envDigits) {
    const fallback = {
      pub_id: `ca-pub-${envDigits}`,
      enabled: true,
      slot_banner: '',
      slot_sidebar: '',
      slot_infeed: '',
    };
    cachedConfig = fallback;
    lastFetchTime = now;
    return fallback;
  }

  const empty = { pub_id: '', enabled: false, slot_banner: '', slot_sidebar: '', slot_infeed: '' };
  cachedConfig = empty;
  lastFetchTime = now;
  return empty;
}

export function invalidateAdSenseCache() {
  cachedConfig = null;
  lastFetchTime = 0;
}
