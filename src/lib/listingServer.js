import { createServerSupabase } from '@/lib/serverSupabase';

export async function getPublicListingDetail(id) {
  const supabase = createServerSupabase();
  const empty = { listing: null };
  if (!id) return empty;
  if (!supabase) throw new Error('Supabase is not configured');

  try {
    const { data: listing, error } = await supabase
      .from('local_listing')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .eq('is_publicly_visible', true)
      .maybeSingle();

    if (error) throw error;
    
    if (!listing || listing.safety_status === 'scam' || listing.safety_status === 'rejected' || (listing.report_count || 0) >= 5) {
      return empty;
    }

    return { listing };
  } catch (err) {
    console.error('Error fetching listing detail:', err);
    return empty;
  }
}
