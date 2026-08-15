import { createServerSupabase } from '@/lib/serverSupabase';

export async function getPublicJobDetail(id) {
  const supabase = createServerSupabase();
  const empty = { job: null };
  if (!id) return empty;
  if (!supabase) throw new Error('Supabase is not configured');

  try {
    const { data: job, error } = await supabase
      .from('job_alert')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .eq('is_publicly_visible', true)
      .maybeSingle();

    if (error) throw error;
    
    if (!job || job.safety_status === 'scam' || job.safety_status === 'rejected' || (job.report_count || 0) >= 5) {
      return empty;
    }

    return { job };
  } catch (err) {
    console.error('Error fetching job detail:', err);
    return empty;
  }
}
