/**
 * Reaction service — like / dislike deduplication.
 * Stores one Reaction record per actor per target.
 * Toggling: if actor sends same reaction, remove it (toggle off).
 * Switching: if actor had opposite reaction, update it.
 */
import { supabase } from "@/api/supabaseClient";

/**
 * Get the existing reaction of an actor for a target.
 * Returns the reaction record or null.
 */
export async function getMyReaction(targetId, targetType, actorId) {
  try {
    const { data, error } = await supabase
      .from("reaction")
      .select("*")
      .eq("target_id", targetId)
      .eq("target_type", targetType)
      .eq("actor_id", actorId)
      .order("created_date", { ascending: false })
      .limit(1);
    if (error) return null;
    return data[0] || null;
  } catch {
    return null;
  }
}

/**
 * Toggle a reaction (like or dislike).
 * Returns { action: "added" | "removed" | "switched", reactionType }
 */
export async function toggleReaction(targetId, targetType, reactionType, actorId, isAuthenticated, post) {
  const existing = await getMyReaction(targetId, targetType, actorId);

  let upvotesDelta = 0;
  let downvotesDelta = 0;
  let action;

  if (!existing) {
    // New reaction
    const { error } = await supabase
      .from("reaction")
      .insert({
        target_id: targetId,
        target_type: targetType,
        reaction_type: reactionType,
        actor_id: actorId,
        is_authenticated: isAuthenticated,
      });
    if (error) throw error;
    if (reactionType === "like") upvotesDelta = 1;
    else downvotesDelta = 1;
    action = "added";
  } else if (existing.reaction_type === reactionType) {
    // Toggle off
    const { error } = await supabase
      .from("reaction")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    if (reactionType === "like") upvotesDelta = -1;
    else downvotesDelta = -1;
    action = "removed";
  } else {
    // Switch reaction
    const { error } = await supabase
      .from("reaction")
      .update({ reaction_type: reactionType })
      .eq("id", existing.id);
    if (error) throw error;
    if (reactionType === "like") { upvotesDelta = 1; downvotesDelta = -1; }
    else { upvotesDelta = -1; downvotesDelta = 1; }
    action = "switched";
  }

  // Update post counts safely (floor at 0)
  const newUpvotes = Math.max(0, (post.upvotes || 0) + upvotesDelta);
  const newDownvotes = Math.max(0, (post.downvotes || 0) + downvotesDelta);
  
  const { error: postError } = await supabase
    .from("post")
    .update({ upvotes: newUpvotes, downvotes: newDownvotes })
    .eq("id", targetId);
  if (postError) throw postError;

  return { action, reactionType: action === "removed" ? null : reactionType, newUpvotes, newDownvotes };
}