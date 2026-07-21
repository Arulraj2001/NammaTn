import { createServerSupabase } from '@/lib/serverSupabase';
import { isPubliclyVisible } from '@/lib/visibility';

const engagementScore = (post) => {
  const ageHours = (Date.now() - new Date(post.created_date).getTime()) / 3600000;
  const recency = Math.max(0, 1 - ageHours / 168);
  return (post.upvotes || 0) * 2 + (post.comment_count || 0) * 3 + recency * 20;
};

const trendingReason = (post) => {
  if ((post.verification_count || 0) >= 10) return 'Highly Verified';
  if ((post.upvotes || 0) >= 20) return 'Most Voted';
  if ((post.comment_count || 0) >= 10) return 'Hot Discussion';
  if ((post.still_not_fixed_count || 0) >= 5) return 'Urgent — Not Fixed';
  if (post.civic_status === 'unresolved_escalated') return 'Escalated';
  if (post.civic_status === 'citizen_verified_fixed') return 'Resolved';
  return null;
};

export async function getActiveScamAlerts(limit = 40) {
  const supabase = createServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('scam_alert')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('[scams] Server alert fetch failed:', error.message);
    return [];
  }
}

export async function getActiveJobAlerts(limit = 40) {
  const supabase = createServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('job_alert')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(limit * 2);
    if (error) throw error;

    return (data || [])
      .filter(job =>
        job.safety_status !== 'scam' &&
        job.safety_status !== 'rejected' &&
        (job.report_count || 0) < 5 &&
        job.is_publicly_visible !== false,
      )
      .slice(0, limit);
  } catch (error) {
    console.warn('[jobs] Server job fetch failed:', error.message);
    return [];
  }
}

export async function getActiveStayListings(limit = 100) {
  const supabase = createServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('stay_listing')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(limit * 2);
    if (error) throw error;

    return (data || [])
      .filter(listing =>
        listing.safety_status !== 'scam' &&
        listing.safety_status !== 'rejected' &&
        (listing.report_count || 0) < 5 &&
        listing.is_publicly_visible !== false,
      )
      .slice(0, limit);
  } catch (error) {
    console.warn('[stay] Server listing fetch failed:', error.message);
    return [];
  }
}

export async function getActiveAreas(limit = 100) {
  const supabase = createServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('area')
      .select('*')
      .eq('active', true)
      .order('name_en', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('[areas] Server area fetch failed:', error.message);
    return [];
  }
}

export async function getCommunityHubData() {
  const supabase = createServerSupabase();
  const empty = { settings: {}, situations: [], emergencies: [], scams: [], questions: [], posts: [] };
  if (!supabase) return empty;

  const requests = [
    supabase.from('site_settings').select('key,value').order('key', { ascending: true }).limit(200),
    supabase.from('situation_update').select('*').eq('status', 'active').order('created_date', { ascending: false }).limit(20),
    supabase.from('emergency_post').select('*').eq('status', 'active').order('created_date', { ascending: false }).limit(20),
    supabase.from('scam_alert').select('*').eq('status', 'active').order('created_date', { ascending: false }).limit(20),
    supabase.from('question').select('*').order('created_date', { ascending: false }).limit(20),
    supabase.from('unified_explore_feed').select('*').eq('status', 'active').order('created_date', { ascending: false }).limit(100),
  ];

  try {
    const results = await Promise.all(requests);
    const failed = results.find(result => result.error);
    if (failed) throw failed.error;
    const [settings, situations, emergencies, scams, questions, posts] = results.map(result => result.data || []);

    return {
      settings: Object.fromEntries(settings.map(setting => [setting.key, setting.value])),
      situations,
      emergencies,
      scams,
      questions,
      posts: posts.filter(isPubliclyVisible).slice(0, 50),
    };
  } catch (error) {
    console.warn('[community] Server hub fetch failed:', error.message);
    return empty;
  }
}

export async function getTrendingHubData(limit = 9) {
  const supabase = createServerSupabase();
  const empty = { posts: [], categories: [], districts: [] };
  if (!supabase) return empty;

  try {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(300);
    if (error) throw error;

    const visible = (data || []).filter(isPubliclyVisible);
    const weekCutoff = Date.now() - 7 * 24 * 3600 * 1000;
    const posts = visible
      .filter(post => new Date(post.created_date).getTime() >= weekCutoff)
      .map(post => ({ ...post, _score: engagementScore(post), _reason: trendingReason(post) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
    const categoryMap = {};
    const districtMap = {};

    visible.forEach((post) => {
      const score = engagementScore(post);
      if (post.category_slug) {
        const category = categoryMap[post.category_slug] ||= {
          slug: post.category_slug,
          name: post.category_name || post.category_slug,
          postCount: 0,
          engagement: 0,
        };
        category.postCount += 1;
        category.engagement += score;
      }
      if (post.district_slug) {
        const district = districtMap[post.district_slug] ||= {
          slug: post.district_slug,
          name: post.district_name || post.district_slug,
          postCount: 0,
          engagement: 0,
          recentPosts: [],
        };
        district.postCount += 1;
        district.engagement += score;
        if (district.recentPosts.length < 3) district.recentPosts.push(post);
      }
    });

    return {
      posts,
      categories: Object.values(categoryMap).sort((a, b) => b.engagement - a.engagement).slice(0, 8),
      districts: Object.values(districtMap).sort((a, b) => b.engagement - a.engagement).slice(0, 10),
    };
  } catch (error) {
    console.warn('[trending] Server hub fetch failed:', error.message);
    return empty;
  }
}

export async function getActiveBribePosts(limit = 200) {
  const supabase = createServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('post_type', 'bribe')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).filter(isPubliclyVisible);
  } catch (error) {
    console.warn('[bribes] Server report fetch failed:', error.message);
    return [];
  }
}

export async function getPublicArea(slug) {
  const supabase = createServerSupabase();
  if (!supabase || !slug) return null;

  try {
    const { data, error } = await supabase
      .from('area')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.warn(`[area:${slug}] Server area fetch failed:`, error.message);
    return null;
  }
}

export async function getAreaDetailData(slug) {
  const supabase = createServerSupabase();
  const empty = { area: null, civicPosts: [], scams: [], emergencies: [] };
  if (!supabase || !slug) return empty;

  try {
    const results = await Promise.all([
      supabase.from('area').select('*').eq('slug', slug).eq('active', true).maybeSingle(),
      supabase.from('post').select('*').eq('area_slug', slug).eq('status', 'active').eq('post_type', 'complaint').order('created_date', { ascending: false }).limit(200),
      supabase.from('scam_alert').select('*').eq('area_slug', slug).eq('status', 'active').order('created_date', { ascending: false }).limit(30),
      supabase.from('emergency_post').select('*').eq('area_slug', slug).eq('status', 'active').order('created_date', { ascending: false }).limit(20),
    ]);
    const failed = results.find(result => result.error);
    if (failed) throw failed.error;

    return {
      area: results[0].data || null,
      civicPosts: (results[1].data || []).filter(post => post.civic_receipt_id && isPubliclyVisible(post)).slice(0, 100),
      scams: results[2].data || [],
      emergencies: results[3].data || [],
    };
  } catch (error) {
    console.warn(`[area:${slug}] Server detail fetch failed:`, error.message);
    return empty;
  }
}

export async function getQuestionDetailData(id) {
  const supabase = createServerSupabase();
  const empty = { question: null, answers: [] };
  if (!supabase || !id) return empty;

  try {
    const [questionResult, answersResult] = await Promise.all([
      supabase.from('question').select('*').eq('id', id).maybeSingle(),
      supabase.from('answer').select('*').eq('question_id', id).eq('status', 'active').order('helpful_count', { ascending: false }).limit(50),
    ]);
    if (questionResult.error) throw questionResult.error;
    if (answersResult.error) throw answersResult.error;
    return { question: questionResult.data || null, answers: answersResult.data || [] };
  } catch (error) {
    console.warn(`[question:${id}] Server detail fetch failed:`, error.message);
    return empty;
  }
}

export async function getCategoryHubData(slug) {
  const supabase = createServerSupabase();
  const empty = { posts: [], stats: null };
  if (!supabase || !slug) return empty;

  const targetSlugs = [slug];
  if (slug === 'electricity') targetSlugs.push('power-cut');
  if (slug === 'power-cut') targetSlugs.push('electricity');
  if (slug === 'water-sanitation') targetSlugs.push('water-issue');
  if (slug === 'water-issue') targetSlugs.push('water-sanitation');
  if (slug === 'road-infrastructure') targetSlugs.push('road-problem');
  if (slug === 'road-problem') targetSlugs.push('road-infrastructure');

  try {
    const { data, error } = await supabase
      .from('unified_explore_feed')
      .select('*')
      .in('category_slug', targetSlugs)
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(200);
    if (error) throw error;

    const visible = (data || []).filter(isPubliclyVisible);
    const districtMap = {};
    const byType = {};
    visible.forEach((post) => {
      if (post.district_slug) {
        districtMap[post.district_slug] = {
          slug: post.district_slug,
          name: post.district_name || post.district_slug,
          count: (districtMap[post.district_slug]?.count || 0) + 1,
        };
      }
      if (post.post_type) byType[post.post_type] = (byType[post.post_type] || 0) + 1;
    });

    return {
      posts: visible.slice(0, 30),
      stats: {
        totalPosts: visible.length,
        totalUpvotes: visible.reduce((sum, post) => sum + (post.upvotes || 0), 0),
        totalComments: visible.reduce((sum, post) => sum + (post.comment_count || 0), 0),
        topDistricts: Object.values(districtMap).sort((a, b) => b.count - a.count).slice(0, 5),
        byType,
      },
    };
  } catch (error) {
    console.warn(`[category:${slug}] Server hub fetch failed:`, error.message);
    return empty;
  }
}

export async function getExplorePosts(limit = 18) {
  const supabase = createServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('unified_explore_feed')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(limit * 2);
    if (error) throw error;
    return (data || []).filter(isPubliclyVisible).slice(0, limit);
  } catch (error) {
    console.warn('[explore] Server feed fetch failed:', error.message);
    return [];
  }
}
