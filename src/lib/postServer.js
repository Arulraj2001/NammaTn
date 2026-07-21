import { createServerSupabase } from '@/lib/serverSupabase';
import { isPubliclyVisible } from '@/lib/visibility';

export async function getPublicPostDetail(id) {
  const supabase = createServerSupabase();
  const empty = { post: null, complaintTrackers: [] };
  if (!supabase || !id) return empty;

  try {
    const [postResult, situationResult, scamResult, emergencyResult] = await Promise.all([
      supabase.from('post').select('*').eq('id', id).maybeSingle(),
      supabase.from('situation_update').select('*').eq('id', id).maybeSingle(),
      supabase.from('scam_alert').select('*').eq('id', id).maybeSingle(),
      supabase.from('emergency_post').select('*').eq('id', id).maybeSingle(),
    ]);

    let post = postResult.data;
    if (post && (post.status !== 'active' || !isPubliclyVisible(post))) post = null;

    if (!post && situationResult.data?.status === 'active') {
      const situation = situationResult.data;
      post = {
        ...situation,
        title_en: situation.title,
        content_en: situation.details,
        category_slug: situation.situation_type === 'eb_shutdown'
          ? 'power-cut'
          : situation.situation_type === 'water_shortage' ? 'water-issue' : 'road-problem',
        post_type: 'alert',
        civic_receipt_id: `SIT-${situation.id}`,
        upvotes: situation.confirm_count || 0,
        downvotes: 0,
      };
    }

    if (!post && scamResult.data?.status === 'active') {
      const scam = scamResult.data;
      post = {
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

    if (!post && emergencyResult.data?.status === 'active') {
      const emergency = emergencyResult.data;
      post = {
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
    console.warn(`[post:${id}] Server detail fetch failed:`, error.message);
    return empty;
  }
}
