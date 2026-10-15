-- ============================================================
-- CIVIC RECEIPT V2 — DATABASE MIGRATION
-- All changes are ADDITIVE. No existing columns dropped.
-- Run inside a transaction for atomicity.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ADDITIVE COLUMNS
-- ============================================================

-- complaint_tracker: Allow storing department response notes
ALTER TABLE complaint_tracker
  ADD COLUMN IF NOT EXISTS response_notes TEXT DEFAULT NULL;

ALTER TABLE complaint_tracker
  ADD COLUMN IF NOT EXISTS response_date TIMESTAMPTZ DEFAULT NULL;

-- post: Store resolution quality rating average
ALTER TABLE post
  ADD COLUMN IF NOT EXISTS resolution_quality_avg REAL DEFAULT NULL;

ALTER TABLE post
  ADD COLUMN IF NOT EXISTS resolution_quality_count INTEGER DEFAULT 0;

-- post: Store follow-up count for quick display
ALTER TABLE post
  ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0;

-- post: Store evidence update count
ALTER TABLE post
  ADD COLUMN IF NOT EXISTS evidence_update_count INTEGER DEFAULT 0;


-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================

-- Faster lookup of civic receipts by status
CREATE INDEX IF NOT EXISTS idx_post_civic_status
  ON post (civic_status) WHERE post_type IN ('complaint', 'alert');

-- Faster complaint tracker queries by post_id
CREATE INDEX IF NOT EXISTS idx_complaint_tracker_post
  ON complaint_tracker (post_id);

-- Faster civic_action lookups for deduplication
CREATE INDEX IF NOT EXISTS idx_civic_action_post_actor
  ON civic_action (post_id, actor_id, action_type);

-- Faster civic receipt ID lookups
CREATE INDEX IF NOT EXISTS idx_post_civic_receipt_id
  ON post (civic_receipt_id) WHERE civic_receipt_id IS NOT NULL;


-- ============================================================
-- 3. NOTIFICATION TRIGGERS
-- ============================================================

-- Trigger 1: Notify post author on new civic verification
CREATE OR REPLACE FUNCTION notify_on_civic_verification()
RETURNS TRIGGER AS $$
DECLARE
  v_post RECORD;
BEGIN
  IF NEW.action_type = 'verify' THEN
    SELECT id, civic_receipt_id, created_by_id, verification_count
    INTO v_post FROM post WHERE id = NEW.post_id;

    IF v_post.created_by_id IS NOT NULL AND v_post.created_by_id != NEW.actor_id THEN
      INSERT INTO notification (user_id, type, title, message, target_type, target_id, priority, is_read)
      VALUES (
        v_post.created_by_id,
        'civic_verification',
        'New Community Verification',
        format('Your issue %s received a community verification (%s total)',
               COALESCE(v_post.civic_receipt_id, v_post.id::text),
               COALESCE(v_post.verification_count, 0) + 1),
        'post',
        v_post.id,
        'normal',
        false
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_civic_verification_notify ON civic_action;
CREATE TRIGGER trg_civic_verification_notify
  AFTER INSERT ON civic_action
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_civic_verification();


-- Trigger 2: Notify on civic status change
CREATE OR REPLACE FUNCTION notify_on_civic_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_status_label TEXT;
  v_actor RECORD;
BEGIN
  -- Map status key to human-readable label
  v_status_label := CASE NEW.civic_status
    WHEN 'reported' THEN 'Reported'
    WHEN 'community_verified' THEN 'Community Verified'
    WHEN 'complaint_needed' THEN 'Complaint Needed'
    WHEN 'complaint_filed' THEN 'Complaint Filed'
    WHEN 'under_followup' THEN 'Under Follow-up'
    WHEN 'claimed_fixed' THEN 'Claimed Fixed'
    WHEN 'citizen_verified_fixed' THEN 'Citizen Verified Fixed'
    WHEN 'unresolved_escalated' THEN 'Unresolved / Escalated'
    WHEN 'community_solved' THEN 'Community Solved'
    WHEN 'duplicate_invalid' THEN 'Duplicate / Invalid'
    ELSE NEW.civic_status
  END;

  -- Notify the post author
  IF NEW.created_by_id IS NOT NULL THEN
    INSERT INTO notification (user_id, type, title, message, target_type, target_id, priority, is_read)
    VALUES (
      NEW.created_by_id,
      'civic_status_change',
      'Receipt Status Updated',
      format('Receipt %s status changed to: %s',
             COALESCE(NEW.civic_receipt_id, NEW.id::text), v_status_label),
      'post',
      NEW.id,
      'high',
      false
    );
  END IF;

  -- Notify all participants (users who have civic_action on this post, excluding author)
  FOR v_actor IN
    SELECT DISTINCT actor_id FROM civic_action
    WHERE post_id = NEW.id
      AND actor_id IS NOT NULL
      AND actor_id != COALESCE(NEW.created_by_id, '00000000-0000-0000-0000-000000000000')
  LOOP
    INSERT INTO notification (user_id, type, title, message, target_type, target_id, priority, is_read)
    VALUES (
      v_actor.actor_id,
      'civic_status_change',
      'Receipt Status Updated',
      format('Receipt %s you participated in changed to: %s',
             COALESCE(NEW.civic_receipt_id, NEW.id::text), v_status_label),
      'post',
      NEW.id,
      'normal',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_civic_status_notify ON post;
CREATE TRIGGER trg_civic_status_notify
  AFTER UPDATE OF civic_status ON post
  FOR EACH ROW
  WHEN (OLD.civic_status IS DISTINCT FROM NEW.civic_status)
  EXECUTE FUNCTION notify_on_civic_status_change();


-- Trigger 3: Notify post author on complaint filed
CREATE OR REPLACE FUNCTION notify_on_complaint_filed()
RETURNS TRIGGER AS $$
DECLARE
  v_post RECORD;
BEGIN
  SELECT id, civic_receipt_id, created_by_id
  INTO v_post FROM post WHERE id = NEW.post_id;

  IF v_post.created_by_id IS NOT NULL THEN
    INSERT INTO notification (user_id, type, title, message, target_type, target_id, priority, is_read)
    VALUES (
      v_post.created_by_id,
      'civic_complaint_filed',
      'Complaint Filed',
      format('A complaint ID (%s) was filed for your issue %s',
             COALESCE(NEW.official_complaint_id, 'N/A'),
             COALESCE(v_post.civic_receipt_id, v_post.id::text)),
      'post',
      v_post.id,
      'high',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_complaint_filed_notify ON complaint_tracker;
CREATE TRIGGER trg_complaint_filed_notify
  AFTER INSERT ON complaint_tracker
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_complaint_filed();


-- ============================================================
-- 4. FIX NOTIFICATION RLS FOR NON-ADMIN INSERTS
-- Allow triggers (SECURITY DEFINER functions) to insert
-- notifications. The existing RLS policy only allows admin
-- inserts, but our triggers run as SECURITY DEFINER (superuser).
-- No policy change needed — SECURITY DEFINER bypasses RLS.
-- ============================================================

-- Verification: Triggers use SECURITY DEFINER so they bypass RLS.
-- No additional policy changes needed.


COMMIT;

-- ============================================================
-- MIGRATION COMPLETE
-- Verify with:
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'post' AND column_name IN ('follow_up_count', 'evidence_update_count', 'resolution_quality_avg', 'resolution_quality_count');
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'complaint_tracker' AND column_name IN ('response_notes', 'response_date');
--   SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trg_civic_%';
-- ============================================================
