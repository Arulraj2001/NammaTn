import { createServerSupabase } from '@/lib/serverSupabase';

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
