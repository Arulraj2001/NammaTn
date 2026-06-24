import { supabase } from "@/api/supabaseClient";

// ============================================================
// CATEGORY → CIVIC RECEIPT DEPARTMENT MAPPING
// ============================================================
const CATEGORY_DEPT_MAP = {
  flooding:       { dept: "Municipality / Corporation",     hint: "Water logging requires municipal drainage response" },
  water_supply:   { dept: "Municipality / Corporation",     hint: "Water supply managed by municipality" },
  power_failure:  { dept: "TANGEDCO",                       hint: "Power failures handled by TANGEDCO" },
  road_damage:    { dept: "Highways / Corporation",         hint: "Road damage reported to highways department" },
  tree_fallen:    { dept: "Municipality",                   hint: "Tree removal is a municipal responsibility" },
  accident:       { dept: "Traffic Police",                 hint: "Road accidents reported to traffic police" },
  fire:           { dept: "Fire & Rescue Services",         hint: "Fire incidents handled by fire department" },
  traffic:        { dept: "Traffic Police",                 hint: "Traffic disruptions handled by traffic police" },
  hospital_crowd: { dept: "Health Department",              hint: "Hospital crowding escalated to health dept" },
  office_closure: { dept: "Relevant Government Department", hint: "Contact department directly for office closures" },
  public_safety:  { dept: "Local Police",                   hint: "Public safety concerns reported to police" },
  scam_activity:  { dept: "Local Police / Cybercrime",      hint: "Scams reported to police or cybercrime cell" },
  crowd:          { dept: "Local Police",                   hint: "Crowd management handled by police" },
  festival:       { dept: "Local Police / Municipality",    hint: "Festival management coordinated with civic bodies" },
  water_supply:   { dept: "Municipality / Corporation",     hint: "Water supply managed by municipality" },
};

// ============================================================
// SCORE CALCULATIONS
// ============================================================

export function calculateConfidence(event) {
  let score = 0;
  score += Math.min((event.evidence_count || 0) * 7, 35);       // evidence   max 35
  score += Math.min((event.witness_count || 0) * 6, 30);         // witnesses  max 30
  score += Math.min((event.verification_count || 0) * 5, 20);   // verif.     max 20
  if (event.location_accuracy === "gps") score += 10;           // gps        max 10
  else if (event.location_accuracy === "approximate") score += 5;
  const ageHours = (Date.now() - new Date(event.created_at || Date.now()).getTime()) / 3_600_000;
  if (ageHours > 24) score -= 5;                                 // time decay

  const pct = Math.max(0, Math.min(score, 100)) / 100;
  const level = pct < 0.25 ? "low" : pct < 0.55 ? "medium" : pct < 0.80 ? "high" : "verified";
  return { score: pct, level };
}

export function calculateImpact(event) {
  const SEV = { minor: 5, moderate: 15, major: 30, critical: 50 };
  let score = SEV[event.severity] || 15;
  const ageHours = (Date.now() - new Date(event.created_at || Date.now()).getTime()) / 3_600_000;
  score += Math.min(ageHours * 1.5, 20);                        // duration
  score += Math.min((event.witness_count || 0) * 3, 15);        // witnesses
  score += Math.min((event.evidence_count || 0) * 2, 10);       // evidence

  const pct = Math.max(0, Math.min(score, 100)) / 100;
  const level = pct < 0.25 ? "low" : pct < 0.55 ? "medium" : pct < 0.75 ? "high" : "major";
  return { score: pct, level };
}

export function getDeptSuggestion(categorySlug) {
  return CATEGORY_DEPT_MAP[categorySlug] || { dept: "Relevant Government Department", hint: "" };
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories() {
  const { data, error } = await supabase
    .from("ground_event_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

// ============================================================
// DUPLICATE DETECTION
// ============================================================

export async function detectNearbyDuplicates({ latitude, longitude, category_slug }) {
  if (!latitude || !longitude) return [];
  const since = new Date(Date.now() - 6 * 3_600_000).toISOString();
  const { data, error } = await supabase
    .from("ground_events")
    .select("id,event_code,title,status,latitude,longitude,category_slug,area_name,district_name,evidence_count,witness_count,created_at")
    .eq("category_slug", category_slug)
    .not("status", "in", "(archived,resolved)")
    .gte("created_at", since)
    .limit(20);

  if (error || !data) return [];

  const LAT_DELTA = 0.018; // ~2km
  const LNG_DELTA = 0.018;
  return data.filter(
    (e) => e.latitude && e.longitude &&
           Math.abs(e.latitude - latitude) < LAT_DELTA &&
           Math.abs(e.longitude - longitude) < LNG_DELTA
  );
}

// ============================================================
// TIMELINE HELPER (internal)
// ============================================================

async function addTimelineEntry(eventId, { type, content, is_system = false, metadata = {} }) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    await supabase.from("ground_event_timeline").insert({
      event_id:  eventId,
      actor_id:  authData?.user?.id || null,
      is_system,
      type,
      content,
      metadata,
    });
  } catch (_) {
    // non-critical
  }
}

// ============================================================
// CREATE EVENT
// ============================================================

export async function createGroundEvent(formData) {
  const initial = calculateConfidence({
    evidence_count: 0, witness_count: 0, verification_count: 0,
    location_accuracy: formData.location_accuracy || "manual",
    created_at: new Date().toISOString(),
  });

  const { data: event, error } = await supabase
    .from("ground_events")
    .insert({
      title:             formData.title,
      description:       formData.description,
      category_slug:     formData.category_slug,
      subcategory_slug:  formData.subcategory_slug || null,
      district_id:       formData.district_id || null,
      district_name:     formData.district_name || null,
      area_id:           formData.area_id || null,
      area_name:         formData.area_name || null,
      location_text:     formData.location_text || null,
      latitude:          formData.latitude || null,
      longitude:         formData.longitude || null,
      location_accuracy: formData.location_accuracy || "manual",
      severity:          formData.severity || "moderate",
      is_anonymous:      formData.is_anonymous || false,
      confidence_score:  initial.score,
      confidence_level:  initial.level,
    })
    .select()
    .single();

  if (error) throw error;

  await addTimelineEntry(event.id, {
    type: "created",
    content: `Event created${formData.is_anonymous ? " anonymously" : ""}`,
    is_system: true,
  });

  return event;
}

// ============================================================
// EVIDENCE UPLOAD
// ============================================================

export async function uploadEvidence(eventId, files, options = {}) {
  const results = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `events/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const isVideo = file.type.startsWith("video/");

    const { error: storageError } = await supabase.storage
      .from("gi-evidence")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (storageError) { console.error("Upload error:", storageError); continue; }

    const { data: { publicUrl } } = supabase.storage.from("gi-evidence").getPublicUrl(path);

    const { data: evidence, error: insertError } = await supabase
      .from("ground_event_evidence")
      .insert({
        event_id:      eventId,
        type:          isVideo ? "video" : "photo",
        url:           publicUrl,
        thumbnail_url: isVideo ? null : publicUrl,
        file_size:     file.size,
        caption:       options.caption || null,
        status:        "approved",
        is_anonymous:  options.is_anonymous || false,
      })
      .select()
      .single();

    if (!insertError && evidence) {
      results.push(evidence);
      await addTimelineEntry(eventId, {
        type: "evidence_added",
        content: `New ${isVideo ? "video" : "photo"} evidence added`,
        is_system: true,
      });
    }
  }
  return results;
}

// ============================================================
// READ
// ============================================================

export async function getGroundEvents({
  status, district_name, area_id, category_slug, severity, limit = 20, cursor = null,
} = {}) {
  let q = supabase
    .from("ground_events")
    .select("*")
    .eq("is_merged", false)
    .not("status", "eq", "archived")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status)        q = q.eq("status", status);
  if (district_name) q = q.eq("district_name", district_name);
  if (area_id)       q = q.eq("area_id", area_id);
  if (category_slug) q = q.eq("category_slug", category_slug);
  if (severity)      q = q.eq("severity", severity);
  if (cursor)        q = q.lt("created_at", cursor);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getGroundEventById(id) {
  const { data, error } = await supabase.from("ground_events").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function getEvidenceForEvent(eventId) {
  const { data, error } = await supabase
    .from("ground_event_evidence")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTimelineForEvent(eventId) {
  const { data, error } = await supabase
    .from("ground_event_timeline")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getUpdatesForEvent(eventId) {
  const { data, error } = await supabase
    .from("ground_event_updates")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getWitnessCountsForEvent(eventId) {
  const { data, error } = await supabase
    .from("ground_event_witnesses")
    .select("action")
    .eq("event_id", eventId);
  if (error) return {};
  const counts = { witnessed: 0, nearby: 0, looks_accurate: 0, still_active: 0, resolved: 0 };
  (data || []).forEach((w) => { if (counts[w.action] !== undefined) counts[w.action]++; });
  return counts;
}

export async function getEventsForArea(areaId, limit = 10) {
  return getGroundEvents({ area_id: areaId, limit });
}

export async function getEventsForDistrict(districtName, limit = 20) {
  return getGroundEvents({ district_name: districtName, limit });
}

export async function getUserGroundEvents(userId) {
  const { data, error } = await supabase
    .from("ground_events")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getLiveStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [liveRes, verifiedRes, resolvedRes] = await Promise.all([
    supabase.from("ground_events").select("id", { count: "exact", head: true })
      .in("status", ["reported","evidence_added","witnesses_joined","community_verified","situation_updated"])
      .eq("is_merged", false),
    supabase.from("ground_events").select("id", { count: "exact", head: true })
      .eq("status", "community_verified").gte("updated_at", todayISO),
    supabase.from("ground_events").select("id", { count: "exact", head: true })
      .eq("status", "resolved").gte("updated_at", todayISO),
  ]);

  return {
    live:          liveRes.count  || 0,
    verifiedToday: verifiedRes.count || 0,
    resolvedToday: resolvedRes.count || 0,
  };
}

// ============================================================
// INTERACTIONS
// ============================================================

export async function addWitnessAction(eventId, action) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { error } = await supabase.from("ground_event_witnesses").upsert(
    { event_id: eventId, user_id: user.id, action },
    { onConflict: "event_id,user_id,action", ignoreDuplicates: true }
  );
  if (error) throw error;

  const labels = {
    witnessed:     "A citizen confirmed witnessing this event",
    nearby:        "A nearby citizen joined this event",
    looks_accurate:"A citizen verified this report looks accurate",
    still_active:  "A citizen confirmed the situation is still active",
    resolved:      "A citizen reported the situation appears resolved",
  };
  await addTimelineEntry(eventId, { type: "witness_joined", content: labels[action], is_system: true });
  await checkAndAutoVerify(eventId);
}

async function checkAndAutoVerify(eventId) {
  const [{ data: settings }, { data: event }] = await Promise.all([
    supabase.from("site_settings").select("key,value").in("key", ["gi_witness_threshold","gi_evidence_threshold"]),
    supabase.from("ground_events").select("status,witness_count,evidence_count").eq("id", eventId).single(),
  ]);
  const s = {};
  (settings || []).forEach((r) => { s[r.key] = parseInt(r.value, 10); });
  const wThresh = s.gi_witness_threshold  || 3;
  const eThresh = s.gi_evidence_threshold || 2;

  if (event && event.status === "witnesses_joined" &&
      event.witness_count >= wThresh && event.evidence_count >= eThresh) {
    await supabase.from("ground_events")
      .update({ status: "community_verified", updated_at: new Date().toISOString() })
      .eq("id", eventId);
    await addTimelineEntry(eventId, {
      type: "verified",
      content: `Community Verified — ${event.witness_count} witnesses, ${event.evidence_count} evidence items`,
      is_system: true,
    });
  }
}

export async function addSituationUpdate(eventId, content, situationStatus = null) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("ground_event_updates").insert({
    event_id: eventId, author_id: user?.id || null, content, situation_status: situationStatus,
  });
  if (error) throw error;
  if (situationStatus) {
    await supabase.from("ground_events")
      .update({ situation_status: situationStatus, status: "situation_updated", updated_at: new Date().toISOString() })
      .eq("id", eventId);
  }
  await addTimelineEntry(eventId, {
    type: "update_added",
    content: `Update: ${content.slice(0, 80)}${content.length > 80 ? "…" : ""}`,
    is_system: true,
  });
}

export async function followEvent(eventId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  await supabase.from("ground_event_followers")
    .upsert({ event_id: eventId, user_id: user.id }, { ignoreDuplicates: true });
}

export async function unfollowEvent(eventId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("ground_event_followers")
    .delete().eq("event_id", eventId).eq("user_id", user.id);
}

export async function isFollowing(eventId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("ground_event_followers")
    .select("event_id").eq("event_id", eventId).eq("user_id", user.id).single();
  return !!data;
}

export async function reportAbuse(eventId, reason, description = "", evidenceId = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  await supabase.from("ground_event_reports").insert({
    event_id: eventId, reporter_id: user.id, evidence_id: evidenceId, reason, description,
  });
}

export async function incrementViewCount(eventId) {
  try {
    await supabase.from("ground_events")
      .update({ view_count: supabase.rpc("increment_gi_views", { eid: eventId }) })
      .eq("id", eventId);
  } catch (_) {}
}

// ============================================================
// CONVERT TO CIVIC RECEIPT
// ============================================================

export async function convertToCivicReceipt(eventId) {
  const [event, evidence] = await Promise.all([
    getGroundEventById(eventId),
    getEvidenceForEvent(eventId),
  ]);
  if (!event) throw new Error("Event not found");

  const deptInfo = getDeptSuggestion(event.category_slug);
  const photoUrls = evidence.filter((e) => e.type === "photo").map((e) => e.url);

  const { data: post, error } = await supabase.from("post").insert({
    title_en:      event.title,
    description:   `${event.description || ""}\n\n[Ground Intelligence Event: ${event.event_code}]`.trim(),
    category_slug: event.category_slug,
    post_type:     "civic",
    status:        "active",
    area_id:       event.area_id,
    area_name:     event.area_name,
    district_name: event.district_name,
    location:      event.location_text,
    latitude:      event.latitude,
    longitude:     event.longitude,
    photo_urls:    photoUrls,
    source_type:   "ground_intelligence",
  }).select().single();

  if (error) throw error;

  await Promise.all([
    supabase.from("ground_events")
      .update({ civic_receipt_id: post.id, updated_at: new Date().toISOString() })
      .eq("id", eventId),
    addTimelineEntry(eventId, {
      type: "civic_receipt_created",
      content: `Converted to Civic Receipt — ${deptInfo.dept}`,
      is_system: true,
      metadata: { post_id: post.id, dept: deptInfo.dept },
    }),
  ]);

  return { post, deptInfo };
}

// ============================================================
// ADMIN
// ============================================================

export async function adminUpdateEvent(eventId, updates) {
  const { data, error } = await supabase.from("ground_events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", eventId).select().single();
  if (error) throw error;
  return data;
}

export async function adminResolveEvent(eventId) {
  await supabase.from("ground_events")
    .update({ status: "resolved", updated_at: new Date().toISOString() }).eq("id", eventId);
  await addTimelineEntry(eventId, { type: "resolved", content: "Marked resolved by admin", is_system: true });
}

export async function adminArchiveEvent(eventId) {
  await supabase.from("ground_events")
    .update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", eventId);
  await addTimelineEntry(eventId, { type: "archived", content: "Archived by admin", is_system: true });
}

export async function adminMergeEvents(masterEventId, mergedEventId, reason = "") {
  await Promise.all([
    supabase.from("ground_event_witnesses").update({ event_id: masterEventId }).eq("event_id", mergedEventId),
    supabase.from("ground_event_evidence").update({ event_id: masterEventId }).eq("event_id", mergedEventId),
    supabase.from("ground_event_timeline").update({ event_id: masterEventId }).eq("event_id", mergedEventId),
  ]);
  await supabase.from("ground_events")
    .update({ is_merged: true, merged_into: masterEventId, status: "archived" })
    .eq("id", mergedEventId);
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("ground_event_merges").insert({
    master_id: masterEventId, merged_id: mergedEventId, merged_by: user?.id, reason,
  });
  await addTimelineEntry(masterEventId, {
    type: "admin_action",
    content: `Merged with duplicate event. Reason: ${reason || "Duplicate report"}`,
    is_system: true,
  });
}

export async function adminHideEvidence(evidenceId, note = "") {
  await supabase.from("ground_event_evidence")
    .update({ status: "hidden", admin_note: note }).eq("id", evidenceId);
}

export async function adminGetPendingReports() {
  const { data, error } = await supabase.from("ground_event_reports")
    .select("*, ground_events(title, event_code, status)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function adminReviewReport(reportId, status, note = "") {
  await supabase.from("ground_event_reports")
    .update({ status, admin_note: note }).eq("id", reportId);
}

// ============================================================
// SUPABASE REALTIME
// ============================================================

export function subscribeToEvent(eventId, onUpdate) {
  return supabase
    .channel(`gi-event-${eventId}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "ground_events", filter: `id=eq.${eventId}` }, (p) => onUpdate(p.new))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "ground_event_witnesses", filter: `event_id=eq.${eventId}` }, () => onUpdate(null))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "ground_event_evidence", filter: `event_id=eq.${eventId}` }, () => onUpdate(null))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "ground_event_timeline", filter: `event_id=eq.${eventId}` }, () => onUpdate(null))
    .subscribe();
}

export function subscribeToFeed(onNew) {
  return supabase
    .channel("gi-feed")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "ground_events" }, (p) => onNew(p.new))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "ground_events" }, (p) => onNew(p.new))
    .subscribe();
}
