import { createServerSupabase } from '@/lib/serverSupabase';
import { isPubliclyVisible } from '@/lib/visibility';

function formatScam(scam) {
  return {
    ...scam,
    title_en: scam.title,
    content_en: scam.description,
    category_slug: 'scam',
    post_type: 'alert',
    civic_receipt_id: `SCAM-${scam.id}`,
    upvotes: scam.confirm_count || 0,
    downvotes: 0,
  };
}

function formatEmergency(emergency) {
  return {
    ...emergency,
    title_en: emergency.title,
    content_en: emergency.description,
    category_slug: 'emergency',
    post_type: 'alert',
    civic_receipt_id: `EMERG-${emergency.id}`,
    upvotes: emergency.confirm_count || 0,
    downvotes: 0,
  };
}

export async function getPublicPostDetail(idOrSlug) {
  const supabase = createServerSupabase();
  const empty = { post: null, complaintTrackers: [] };
  if (!idOrSlug) return empty;
  if (!supabase) throw new Error('Supabase is not configured');

  const raw = String(idOrSlug).trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

  try {
    let post = null;

    if (isUuid) {
      const [postResult, scamResult, emergencyResult] = await Promise.all([
        supabase.from('post').select('*').eq('id', raw).maybeSingle(),
        supabase.from('scam_alert').select('*').eq('id', raw).maybeSingle().catch(() => ({ data: null })),
        supabase.from('emergency_post').select('*').eq('id', raw).maybeSingle().catch(() => ({ data: null })),
      ]);

      post = postResult.data;
      if (!post && scamResult?.data?.status === 'active') post = formatScam(scamResult.data);
      if (!post && emergencyResult?.data?.status === 'active') post = formatEmergency(emergencyResult.data);
    } else {
      // 1. First attempt query by slug
      const { data: bySlug, error: slugErr } = await supabase
        .from('post')
        .select('*')
        .eq('slug', raw)
        .maybeSingle();

      if (!slugErr && bySlug) {
        post = bySlug;
      } else {
        // 2. Query by civic_receipt_id (e.g. TN-718669)
        const { data: byReceipt } = await supabase
          .from('post')
          .select('*')
          .eq('civic_receipt_id', raw)
          .maybeSingle();

        if (byReceipt) {
          post = byReceipt;
        } else if (/^\d+$/.test(raw)) {
          // Numeric ID for legacy non-UUID tables
          const numId = Number(raw);
          const [scamRes, emergRes] = await Promise.all([
            supabase.from('scam_alert').select('*').eq('id', numId).maybeSingle().catch(() => ({ data: null })),
            supabase.from('emergency_post').select('*').eq('id', numId).maybeSingle().catch(() => ({ data: null })),
          ]);
          if (!post && scamRes?.data?.status === 'active') post = formatScam(scamRes.data);
          if (!post && emergRes?.data?.status === 'active') post = formatEmergency(emergRes.data);
        }
      }
    }

    if (post && (post.status !== 'active' || !isPubliclyVisible(post))) {
      post = null;
    }

    if (!post) return empty;

    let complaintTrackers = [];
    if (post.civic_receipt_id) {
      const { data } = await supabase
        .from('complaint_tracker')
        .select('*')
        .eq('post_id', post.id)
        .order('created_date', { ascending: false })
        .limit(50);
      complaintTrackers = data || [];
    }

    return { post, complaintTrackers };
  } catch (error) {
    console.error(`[post:${idOrSlug}] Server detail fetch failed:`, error.message);
    throw error;
  }
}
