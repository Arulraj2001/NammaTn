import { createServerSupabase } from '@/lib/serverSupabase';
import { isPubliclyVisible } from '@/lib/visibility';

export async function getPublicRwaGroup(id) {
  const supabase = createServerSupabase();
  if (!id) return null;
  if (!supabase) throw new Error('Supabase is not configured');

  try {
    const { data, error } = await supabase
      .from('rwa_group')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_verified', true)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.warn(`[rwa:${id}] Server RWA fetch failed:`, error.message);
    throw error;
  }
}

export async function getRwaGroupDetailData(id) {
  const supabase = createServerSupabase();
  const empty = { group: null, areaPosts: [], districtPosts: [] };
  if (!id) return empty;
  if (!supabase) throw new Error('Supabase is not configured');

  try {
    const groupResult = await supabase
      .from('rwa_group')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_verified', true)
      .maybeSingle();

    if (groupResult.error) throw groupResult.error;
    const group = groupResult.data || null;
    if (!group) return empty;

    const areaSlug = group.area_slug;
    const districtSlug = group.district_slug;

    const [areaPostsResult, districtPostsResult] = await Promise.all([
      areaSlug
        ? supabase
            .from('post')
            .select('*')
            .eq('area_slug', areaSlug)
            .eq('status', 'active')
            .eq('post_type', 'complaint')
            .order('created_date', { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [] }),
      districtSlug
        ? supabase
            .from('post')
            .select('*')
            .eq('district_slug', districtSlug)
            .eq('status', 'active')
            .eq('post_type', 'complaint')
            .order('created_date', { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [] }),
    ]);

    if (areaPostsResult.error) throw areaPostsResult.error;
    if (districtPostsResult.error) throw districtPostsResult.error;

    return {
      group,
      areaPosts: (areaPostsResult.data || []).filter(isPubliclyVisible).slice(0, 10),
      districtPosts: (districtPostsResult.data || []).filter(isPubliclyVisible).slice(0, 10),
    };
  } catch (error) {
    console.warn(`[rwa:${id}] Server detail fetch failed:`, error.message);
    throw error;
  }
}
