import { createClient } from '@/lib/supabaseServer'
import { TN_MLAS_DATA, MLAS_BY_DISTRICT } from '@/lib/mlaData'

// Get all politics posts (paginated)
export async function getPoliticsPosts({ 
  limit = 20, 
  offset = 0, 
  partySlug = null,
  postType = null 
} = {}) {
  try {
    const supabase = createClient()
    let query = supabase
      .from('post')
      .select(`
        id, slug, title_en, title_ta, content_en, content_ta,
        post_type, category_slug, district_slug, area_name,
        author_name, created_date, updated_date, upvotes,
        seo_title, seo_description, canonical_url,
        civic_receipt_id, is_publicly_visible, status
      `)
      .eq('category_slug', 'tn-politics')
      .eq('status', 'active')
      .eq('is_publicly_visible', true)
      .order('created_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (partySlug) query = query.eq('district_slug', partySlug)
    if (postType) query = query.eq('post_type', postType)

    const { data, error } = await query
    if (error) {
      console.warn('[politicsServer] getPoliticsPosts error:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.warn('[politicsServer] getPoliticsPosts exception:', err.message)
    return []
  }
}

// Get single politics post by slug
export async function getPoliticsPost(slug) {
  try {
    const supabase = createClient()
    
    // Try slug first, then ID fallback
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(slug)
    
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq(isUUID ? 'id' : 'slug', slug)
      .eq('category_slug', 'tn-politics')
      .eq('status', 'active')
      .eq('is_publicly_visible', true)
      .single()

    if (error) return null
    return data
  } catch (err) {
    console.warn('[politicsServer] getPoliticsPost exception:', err.message)
    return null
  }
}

// Get MLA tracker for a district
export async function getMLATracker(districtSlug) {
  const fallback = MLAS_BY_DISTRICT[districtSlug] || null
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('mla_tracker')
      .select('*')
      .eq('district_slug', districtSlug)
      .eq('is_active', true)
      .single()

    if (error || !data) return fallback
    // If database still contains placeholder test strings, merge with real verified data
    if (data.mla_name === 'TVK Representative' || data.mla_name === 'Multiple MLAs') {
      return { ...fallback, ...data, mla_name: fallback?.mla_name || data.mla_name, mla_name_ta: fallback?.mla_name_ta || data.mla_name_ta, photo_url: fallback?.photo_url || data.photo_url, party_slug: fallback?.party_slug || data.party_slug, party_name: fallback?.party_name || data.party_name }
    }
    return { ...fallback, ...data }
  } catch (err) {
    console.warn('[politicsServer] getMLATracker exception:', err.message)
    return fallback
  }
}

// Get all MLA trackers
export async function getAllMLATrackers() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('mla_tracker')
      .select('*')
      .eq('is_active', true)
      .order('district_name', { ascending: true })

    if (error || !data || data.length === 0) {
      return TN_MLAS_DATA
    }

    // Check if database contains outdated TVK placeholders
    const hasPlaceholders = data.some(m => m.mla_name === 'TVK Representative')
    if (hasPlaceholders) {
      return data.map(dbRow => {
        const fallback = MLAS_BY_DISTRICT[dbRow.district_slug]
        if (dbRow.mla_name === 'TVK Representative' || dbRow.mla_name === 'Multiple MLAs') {
          return { ...fallback, ...dbRow, mla_name: fallback?.mla_name || dbRow.mla_name, mla_name_ta: fallback?.mla_name_ta || dbRow.mla_name_ta, photo_url: fallback?.photo_url || dbRow.photo_url, party_slug: fallback?.party_slug || dbRow.party_slug, party_name: fallback?.party_name || dbRow.party_name }
        }
        return { ...fallback, ...dbRow }
      })
    }

    return data
  } catch (err) {
    console.warn('[politicsServer] getAllMLATrackers exception:', err.message)
    return TN_MLAS_DATA
  }
}

// Get politics posts by party slug
export async function getPoliticsPostsByParty(partySlug, limit = 10) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('post')
      .select(`
        id, slug, title_en, title_ta, post_type,
        created_date, seo_description, author_name
      `)
      .eq('category_slug', 'tn-politics')
      .eq('status', 'active')
      .eq('is_publicly_visible', true)
      .ilike('tags', `%${partySlug}%`)
      .order('created_date', { ascending: false })
      .limit(limit)

    if (error) return []
    return data || []
  } catch (err) {
    console.warn('[politicsServer] getPoliticsPostsByParty exception:', err.message)
    return []
  }
}

// Get recent civic posts for a specific district to link MLA accountability to ground reality
export async function getDistrictCivicPosts(districtSlug, limit = 6) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('post')
      .select(`
        id, slug, title_en, title_ta, post_type, category_slug,
        civic_status, urgency_level, civic_receipt_id, created_date,
        area_name, assigned_department
      `)
      .eq('district_slug', districtSlug)
      .eq('status', 'active')
      .eq('is_publicly_visible', true)
      .neq('category_slug', 'tn-politics')
      .order('created_date', { ascending: false })
      .limit(limit)

    if (error) return []
    return data || []
  } catch (err) {
    console.warn('[politicsServer] getDistrictCivicPosts exception:', err.message)
    return []
  }
}

