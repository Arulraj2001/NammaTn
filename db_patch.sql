-- =========================================================================
-- NAMMA TN DATABASE SECURITY PATCH
-- Storage bucket initialization, full RLS enablement, and policy decoupling
-- =========================================================================

-- 1. STORAGE BUCKET CONFIGURATION
-- Create the 'media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;



-- Drop old storage policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Owner Access" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated Insert Access" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated Owner Access" ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = owner::text);


-- 1.5 MISSING COLUMNS CORRECTIONS
ALTER TABLE "job_alert" ADD COLUMN IF NOT EXISTS "report_count" INTEGER DEFAULT 0;


-- 2. ENABLE ROW LEVEL SECURITY ON ALL 40 TABLES
ALTER TABLE "ad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "answer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "area" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "civic_action" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "civic_sponsor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "community_confirmation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "community_discussion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaint_tracker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_analysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contributor_activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "department_route" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "discussion_reply" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "donation_record" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "emergency_post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_chat_message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_room_message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "local_listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "moderation_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "office_report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recognition_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rwa_group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scam_alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "situation_update" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "spam_flag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stay_listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stay_report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supporter_membership" ENABLE ROW LEVEL SECURITY;


-- 3. DROP ALL OLD POLICIES
DROP POLICY IF EXISTS post_read_policy ON "post";
DROP POLICY IF EXISTS post_insert_policy ON "post";
DROP POLICY IF EXISTS post_modify_policy ON "post";
DROP POLICY IF EXISTS comment_read_policy ON "comment";
DROP POLICY IF EXISTS comment_insert_policy ON "comment";
DROP POLICY IF EXISTS comment_modify_policy ON "comment";
DROP POLICY IF EXISTS report_insert_policy ON "report";
DROP POLICY IF EXISTS report_admin_policy ON "report";
DROP POLICY IF EXISTS ad_read_policy ON "ad";
DROP POLICY IF EXISTS ad_admin_policy ON "ad";
DROP POLICY IF EXISTS site_settings_read_policy ON "site_settings";
DROP POLICY IF EXISTS site_settings_admin_policy ON "site_settings";
DROP POLICY IF EXISTS civic_sponsor_insert ON "civic_sponsor";
DROP POLICY IF EXISTS civic_sponsor_admin ON "civic_sponsor";
DROP POLICY IF EXISTS contact_message_insert ON "contact_message";
DROP POLICY IF EXISTS contact_message_admin ON "contact_message";
DROP POLICY IF EXISTS area_read ON "area";
DROP POLICY IF EXISTS area_admin ON "area";
DROP POLICY IF EXISTS stay_read ON "stay_listing";
DROP POLICY IF EXISTS stay_insert ON "stay_listing";
DROP POLICY IF EXISTS stay_modify ON "stay_listing";
DROP POLICY IF EXISTS job_read ON "job_alert";
DROP POLICY IF EXISTS job_insert ON "job_alert";
DROP POLICY IF EXISTS job_modify ON "job_alert";
DROP POLICY IF EXISTS scam_read ON "scam_alert";
DROP POLICY IF EXISTS scam_insert ON "scam_alert";
DROP POLICY IF EXISTS scam_modify ON "scam_alert";
DROP POLICY IF EXISTS emergency_read ON "emergency_post";
DROP POLICY IF EXISTS emergency_insert ON "emergency_post";
DROP POLICY IF EXISTS emergency_modify ON "emergency_post";
DROP POLICY IF EXISTS question_read ON "question";
DROP POLICY IF EXISTS question_insert ON "question";
DROP POLICY IF EXISTS question_modify ON "question";
DROP POLICY IF EXISTS answer_read ON "answer";
DROP POLICY IF EXISTS answer_insert ON "answer";
DROP POLICY IF EXISTS answer_modify ON "answer";
DROP POLICY IF EXISTS situation_read ON "situation_update";
DROP POLICY IF EXISTS situation_insert ON "situation_update";
DROP POLICY IF EXISTS situation_modify ON "situation_update";
DROP POLICY IF EXISTS local_listing_read ON "local_listing";
DROP POLICY IF EXISTS local_listing_insert ON "local_listing";
DROP POLICY IF EXISTS local_listing_modify ON "local_listing";
DROP POLICY IF EXISTS reaction_read ON "reaction";
DROP POLICY IF EXISTS reaction_insert ON "reaction";
DROP POLICY IF EXISTS reaction_modify ON "reaction";


-- 4. CREATE EXPLICIT DECOUPLED CRUD POLICIES FOR ALL TABLES

-- ad
DROP POLICY IF EXISTS ad_select ON "ad";
CREATE POLICY ad_select ON "ad" FOR SELECT USING (active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS ad_insert ON "ad";
CREATE POLICY ad_insert ON "ad" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS ad_update ON "ad";
CREATE POLICY ad_update ON "ad" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS ad_delete ON "ad";
CREATE POLICY ad_delete ON "ad" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- answer
DROP POLICY IF EXISTS answer_select ON "answer";
CREATE POLICY answer_select ON "answer" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS answer_insert ON "answer";
CREATE POLICY answer_insert ON "answer" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS answer_update ON "answer";
CREATE POLICY answer_update ON "answer" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS answer_delete ON "answer";
CREATE POLICY answer_delete ON "answer" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- area
DROP POLICY IF EXISTS area_select ON "area";
CREATE POLICY area_select ON "area" FOR SELECT USING (true);
DROP POLICY IF EXISTS area_insert ON "area";
CREATE POLICY area_insert ON "area" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS area_update ON "area";
CREATE POLICY area_update ON "area" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS area_delete ON "area";
CREATE POLICY area_delete ON "area" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- civic_action
DROP POLICY IF EXISTS civic_action_select ON "civic_action";
CREATE POLICY civic_action_select ON "civic_action" FOR SELECT USING (true);
DROP POLICY IF EXISTS civic_action_insert ON "civic_action";
CREATE POLICY civic_action_insert ON "civic_action" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS civic_action_update ON "civic_action";
CREATE POLICY civic_action_update ON "civic_action" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));
DROP POLICY IF EXISTS civic_action_delete ON "civic_action";
CREATE POLICY civic_action_delete ON "civic_action" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));

-- civic_sponsor
DROP POLICY IF EXISTS civic_sponsor_select ON "civic_sponsor";
CREATE POLICY civic_sponsor_select ON "civic_sponsor" FOR SELECT USING (status = 'approved' OR is_active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS civic_sponsor_insert ON "civic_sponsor";
CREATE POLICY civic_sponsor_insert ON "civic_sponsor" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS civic_sponsor_update ON "civic_sponsor";
CREATE POLICY civic_sponsor_update ON "civic_sponsor" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS civic_sponsor_delete ON "civic_sponsor";
CREATE POLICY civic_sponsor_delete ON "civic_sponsor" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- comment
DROP POLICY IF EXISTS comment_select ON "comment";
CREATE POLICY comment_select ON "comment" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS comment_insert ON "comment";
CREATE POLICY comment_insert ON "comment" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS comment_update ON "comment";
CREATE POLICY comment_update ON "comment" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS comment_delete ON "comment";
CREATE POLICY comment_delete ON "comment" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- community_confirmation
DROP POLICY IF EXISTS community_confirmation_select ON "community_confirmation";
CREATE POLICY community_confirmation_select ON "community_confirmation" FOR SELECT USING (true);
DROP POLICY IF EXISTS community_confirmation_insert ON "community_confirmation";
CREATE POLICY community_confirmation_insert ON "community_confirmation" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS community_confirmation_update ON "community_confirmation";
CREATE POLICY community_confirmation_update ON "community_confirmation" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS community_confirmation_delete ON "community_confirmation";
CREATE POLICY community_confirmation_delete ON "community_confirmation" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- community_discussion
DROP POLICY IF EXISTS community_discussion_select ON "community_discussion";
CREATE POLICY community_discussion_select ON "community_discussion" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS community_discussion_insert ON "community_discussion";
CREATE POLICY community_discussion_insert ON "community_discussion" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS community_discussion_update ON "community_discussion";
CREATE POLICY community_discussion_update ON "community_discussion" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS community_discussion_delete ON "community_discussion";
CREATE POLICY community_discussion_delete ON "community_discussion" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- complaint_tracker
DROP POLICY IF EXISTS complaint_tracker_select ON "complaint_tracker";
CREATE POLICY complaint_tracker_select ON "complaint_tracker" FOR SELECT USING (true);
DROP POLICY IF EXISTS complaint_tracker_insert ON "complaint_tracker";
CREATE POLICY complaint_tracker_insert ON "complaint_tracker" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS complaint_tracker_update ON "complaint_tracker";
CREATE POLICY complaint_tracker_update ON "complaint_tracker" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS complaint_tracker_delete ON "complaint_tracker";
CREATE POLICY complaint_tracker_delete ON "complaint_tracker" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- contact_message
DROP POLICY IF EXISTS contact_message_select ON "contact_message";
CREATE POLICY contact_message_select ON "contact_message" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS contact_message_insert ON "contact_message";
CREATE POLICY contact_message_insert ON "contact_message" FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS contact_message_update ON "contact_message";
CREATE POLICY contact_message_update ON "contact_message" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS contact_message_delete ON "contact_message";
CREATE POLICY contact_message_delete ON "contact_message" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- content_analysis
DROP POLICY IF EXISTS content_analysis_select ON "content_analysis";
CREATE POLICY content_analysis_select ON "content_analysis" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS content_analysis_insert ON "content_analysis";
CREATE POLICY content_analysis_insert ON "content_analysis" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS content_analysis_update ON "content_analysis";
CREATE POLICY content_analysis_update ON "content_analysis" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS content_analysis_delete ON "content_analysis";
CREATE POLICY content_analysis_delete ON "content_analysis" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- contributor_activity
DROP POLICY IF EXISTS contributor_activity_select ON "contributor_activity";
CREATE POLICY contributor_activity_select ON "contributor_activity" FOR SELECT USING (true);
DROP POLICY IF EXISTS contributor_activity_insert ON "contributor_activity";
CREATE POLICY contributor_activity_insert ON "contributor_activity" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS contributor_activity_update ON "contributor_activity";
CREATE POLICY contributor_activity_update ON "contributor_activity" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS contributor_activity_delete ON "contributor_activity";
CREATE POLICY contributor_activity_delete ON "contributor_activity" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- department_route
DROP POLICY IF EXISTS department_route_select ON "department_route";
CREATE POLICY department_route_select ON "department_route" FOR SELECT USING (true);
DROP POLICY IF EXISTS department_route_insert ON "department_route";
CREATE POLICY department_route_insert ON "department_route" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS department_route_update ON "department_route";
CREATE POLICY department_route_update ON "department_route" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS department_route_delete ON "department_route";
CREATE POLICY department_route_delete ON "department_route" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- discussion_reply
DROP POLICY IF EXISTS discussion_reply_select ON "discussion_reply";
CREATE POLICY discussion_reply_select ON "discussion_reply" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS discussion_reply_insert ON "discussion_reply";
CREATE POLICY discussion_reply_insert ON "discussion_reply" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS discussion_reply_update ON "discussion_reply";
CREATE POLICY discussion_reply_update ON "discussion_reply" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS discussion_reply_delete ON "discussion_reply";
CREATE POLICY discussion_reply_delete ON "discussion_reply" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- donation_record
DROP POLICY IF EXISTS donation_record_select ON "donation_record";
CREATE POLICY donation_record_select ON "donation_record" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS donation_record_insert ON "donation_record";
CREATE POLICY donation_record_insert ON "donation_record" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS donation_record_update ON "donation_record";
CREATE POLICY donation_record_update ON "donation_record" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS donation_record_delete ON "donation_record";
CREATE POLICY donation_record_delete ON "donation_record" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- emergency_post
DROP POLICY IF EXISTS emergency_post_select ON "emergency_post";
CREATE POLICY emergency_post_select ON "emergency_post" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS emergency_post_insert ON "emergency_post";
CREATE POLICY emergency_post_insert ON "emergency_post" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS emergency_post_update ON "emergency_post";
CREATE POLICY emergency_post_update ON "emergency_post" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS emergency_post_delete ON "emergency_post";
CREATE POLICY emergency_post_delete ON "emergency_post" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- job_alert
DROP POLICY IF EXISTS job_alert_select ON "job_alert";
CREATE POLICY job_alert_select ON "job_alert" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS job_alert_insert ON "job_alert";
CREATE POLICY job_alert_insert ON "job_alert" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS job_alert_update ON "job_alert";
CREATE POLICY job_alert_update ON "job_alert" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS job_alert_delete ON "job_alert";
CREATE POLICY job_alert_delete ON "job_alert" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- listing_review
DROP POLICY IF EXISTS listing_review_select ON "listing_review";
CREATE POLICY listing_review_select ON "listing_review" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS listing_review_insert ON "listing_review";
CREATE POLICY listing_review_insert ON "listing_review" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS listing_review_update ON "listing_review";
CREATE POLICY listing_review_update ON "listing_review" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS listing_review_delete ON "listing_review";
CREATE POLICY listing_review_delete ON "listing_review" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- live_chat_message
DROP POLICY IF EXISTS live_chat_message_select ON "live_chat_message";
CREATE POLICY live_chat_message_select ON "live_chat_message" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_chat_message_insert ON "live_chat_message";
CREATE POLICY live_chat_message_insert ON "live_chat_message" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_chat_message_update ON "live_chat_message";
CREATE POLICY live_chat_message_update ON "live_chat_message" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_chat_message_delete ON "live_chat_message";
CREATE POLICY live_chat_message_delete ON "live_chat_message" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- live_room
DROP POLICY IF EXISTS live_room_select ON "live_room";
CREATE POLICY live_room_select ON "live_room" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_room_insert ON "live_room";
CREATE POLICY live_room_insert ON "live_room" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_room_update ON "live_room";
CREATE POLICY live_room_update ON "live_room" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_room_delete ON "live_room";
CREATE POLICY live_room_delete ON "live_room" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- live_room_message
DROP POLICY IF EXISTS live_room_message_select ON "live_room_message";
CREATE POLICY live_room_message_select ON "live_room_message" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_room_message_insert ON "live_room_message";
CREATE POLICY live_room_message_insert ON "live_room_message" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_room_message_update ON "live_room_message";
CREATE POLICY live_room_message_update ON "live_room_message" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS live_room_message_delete ON "live_room_message";
CREATE POLICY live_room_message_delete ON "live_room_message" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- local_listing
DROP POLICY IF EXISTS local_listing_select ON "local_listing";
CREATE POLICY local_listing_select ON "local_listing" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS local_listing_insert ON "local_listing";
CREATE POLICY local_listing_insert ON "local_listing" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS local_listing_update ON "local_listing";
CREATE POLICY local_listing_update ON "local_listing" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS local_listing_delete ON "local_listing";
CREATE POLICY local_listing_delete ON "local_listing" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- moderation_log
DROP POLICY IF EXISTS moderation_log_select ON "moderation_log";
CREATE POLICY moderation_log_select ON "moderation_log" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS moderation_log_insert ON "moderation_log";
CREATE POLICY moderation_log_insert ON "moderation_log" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS moderation_log_update ON "moderation_log";
CREATE POLICY moderation_log_update ON "moderation_log" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS moderation_log_delete ON "moderation_log";
CREATE POLICY moderation_log_delete ON "moderation_log" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- notification
DROP POLICY IF EXISTS notification_select ON "notification";
CREATE POLICY notification_select ON "notification" FOR SELECT USING (user_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS notification_insert ON "notification";
CREATE POLICY notification_insert ON "notification" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS notification_update ON "notification";
CREATE POLICY notification_update ON "notification" FOR UPDATE USING (user_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS notification_delete ON "notification";
CREATE POLICY notification_delete ON "notification" FOR DELETE USING (user_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- office_report
DROP POLICY IF EXISTS office_report_select ON "office_report";
CREATE POLICY office_report_select ON "office_report" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS office_report_insert ON "office_report";
CREATE POLICY office_report_insert ON "office_report" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS office_report_update ON "office_report";
CREATE POLICY office_report_update ON "office_report" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS office_report_delete ON "office_report";
CREATE POLICY office_report_delete ON "office_report" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- payment_settings
DROP POLICY IF EXISTS payment_settings_select ON "payment_settings";
CREATE POLICY payment_settings_select ON "payment_settings" FOR SELECT USING (true);
DROP POLICY IF EXISTS payment_settings_insert ON "payment_settings";
CREATE POLICY payment_settings_insert ON "payment_settings" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS payment_settings_update ON "payment_settings";
CREATE POLICY payment_settings_update ON "payment_settings" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS payment_settings_delete ON "payment_settings";
CREATE POLICY payment_settings_delete ON "payment_settings" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- payment_submission
DROP POLICY IF EXISTS payment_submission_select ON "payment_submission";
CREATE POLICY payment_submission_select ON "payment_submission" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS payment_submission_insert ON "payment_submission";
CREATE POLICY payment_submission_insert ON "payment_submission" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS payment_submission_update ON "payment_submission";
CREATE POLICY payment_submission_update ON "payment_submission" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS payment_submission_delete ON "payment_submission";
CREATE POLICY payment_submission_delete ON "payment_submission" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- post
DROP POLICY IF EXISTS post_select ON "post";
CREATE POLICY post_select ON "post" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS post_insert ON "post";
CREATE POLICY post_insert ON "post" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS post_update ON "post";
CREATE POLICY post_update ON "post" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS post_delete ON "post";
CREATE POLICY post_delete ON "post" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- question
DROP POLICY IF EXISTS question_select ON "question";
CREATE POLICY question_select ON "question" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS question_insert ON "question";
CREATE POLICY question_insert ON "question" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS question_update ON "question";
CREATE POLICY question_update ON "question" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS question_delete ON "question";
CREATE POLICY question_delete ON "question" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- reaction
DROP POLICY IF EXISTS reaction_select ON "reaction";
CREATE POLICY reaction_select ON "reaction" FOR SELECT USING (true);
DROP POLICY IF EXISTS reaction_insert ON "reaction";
CREATE POLICY reaction_insert ON "reaction" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (actor_id = auth.uid()::text));
DROP POLICY IF EXISTS reaction_update ON "reaction";
CREATE POLICY reaction_update ON "reaction" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));
DROP POLICY IF EXISTS reaction_delete ON "reaction";
CREATE POLICY reaction_delete ON "reaction" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));

-- recognition_log
DROP POLICY IF EXISTS recognition_log_select ON "recognition_log";
CREATE POLICY recognition_log_select ON "recognition_log" FOR SELECT USING (is_active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS recognition_log_insert ON "recognition_log";
CREATE POLICY recognition_log_insert ON "recognition_log" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS recognition_log_update ON "recognition_log";
CREATE POLICY recognition_log_update ON "recognition_log" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS recognition_log_delete ON "recognition_log";
CREATE POLICY recognition_log_delete ON "recognition_log" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- report
DROP POLICY IF EXISTS report_select ON "report";
CREATE POLICY report_select ON "report" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS report_insert ON "report";
CREATE POLICY report_insert ON "report" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS report_update ON "report";
CREATE POLICY report_update ON "report" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS report_delete ON "report";
CREATE POLICY report_delete ON "report" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- rwa_group
DROP POLICY IF EXISTS rwa_group_select ON "rwa_group";
CREATE POLICY rwa_group_select ON "rwa_group" FOR SELECT USING (is_active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS rwa_group_insert ON "rwa_group";
CREATE POLICY rwa_group_insert ON "rwa_group" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS rwa_group_update ON "rwa_group";
CREATE POLICY rwa_group_update ON "rwa_group" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS rwa_group_delete ON "rwa_group";
CREATE POLICY rwa_group_delete ON "rwa_group" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- scam_alert
DROP POLICY IF EXISTS scam_alert_select ON "scam_alert";
CREATE POLICY scam_alert_select ON "scam_alert" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS scam_alert_insert ON "scam_alert";
CREATE POLICY scam_alert_insert ON "scam_alert" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS scam_alert_update ON "scam_alert";
CREATE POLICY scam_alert_update ON "scam_alert" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS scam_alert_delete ON "scam_alert";
CREATE POLICY scam_alert_delete ON "scam_alert" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- site_settings
DROP POLICY IF EXISTS site_settings_select ON "site_settings";
CREATE POLICY site_settings_select ON "site_settings" FOR SELECT USING (true);
DROP POLICY IF EXISTS site_settings_insert ON "site_settings";
CREATE POLICY site_settings_insert ON "site_settings" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS site_settings_update ON "site_settings";
CREATE POLICY site_settings_update ON "site_settings" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS site_settings_delete ON "site_settings";
CREATE POLICY site_settings_delete ON "site_settings" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- situation_update
DROP POLICY IF EXISTS situation_update_select ON "situation_update";
CREATE POLICY situation_update_select ON "situation_update" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS situation_update_insert ON "situation_update";
CREATE POLICY situation_update_insert ON "situation_update" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS situation_update_update ON "situation_update";
CREATE POLICY situation_update_update ON "situation_update" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS situation_update_delete ON "situation_update";
CREATE POLICY situation_update_delete ON "situation_update" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- spam_flag
DROP POLICY IF EXISTS spam_flag_select ON "spam_flag";
CREATE POLICY spam_flag_select ON "spam_flag" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS spam_flag_insert ON "spam_flag";
CREATE POLICY spam_flag_insert ON "spam_flag" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS spam_flag_update ON "spam_flag";
CREATE POLICY spam_flag_update ON "spam_flag" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS spam_flag_delete ON "spam_flag";
CREATE POLICY spam_flag_delete ON "spam_flag" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- stay_listing
DROP POLICY IF EXISTS stay_listing_select ON "stay_listing";
CREATE POLICY stay_listing_select ON "stay_listing" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS stay_listing_insert ON "stay_listing";
CREATE POLICY stay_listing_insert ON "stay_listing" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS stay_listing_update ON "stay_listing";
CREATE POLICY stay_listing_update ON "stay_listing" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS stay_listing_delete ON "stay_listing";
CREATE POLICY stay_listing_delete ON "stay_listing" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- stay_report
DROP POLICY IF EXISTS stay_report_select ON "stay_report";
CREATE POLICY stay_report_select ON "stay_report" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS stay_report_insert ON "stay_report";
CREATE POLICY stay_report_insert ON "stay_report" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS stay_report_update ON "stay_report";
CREATE POLICY stay_report_update ON "stay_report" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS stay_report_delete ON "stay_report";
CREATE POLICY stay_report_delete ON "stay_report" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- supporter_membership
DROP POLICY IF EXISTS supporter_membership_select ON "supporter_membership";
CREATE POLICY supporter_membership_select ON "supporter_membership" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS supporter_membership_insert ON "supporter_membership";
CREATE POLICY supporter_membership_insert ON "supporter_membership" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
DROP POLICY IF EXISTS supporter_membership_update ON "supporter_membership";
CREATE POLICY supporter_membership_update ON "supporter_membership" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
DROP POLICY IF EXISTS supporter_membership_delete ON "supporter_membership";
CREATE POLICY supporter_membership_delete ON "supporter_membership" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));


-- =========================================================================
-- SECURITY DEFINER HELPER FUNCTIONS FOR COUNTER INCREMENTS & USER CONFIRMATIONS
-- Bypasses RLS constraints safely to allow public updates on specific columns.
-- =========================================================================

CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "ad"
  SET "impression_count" = COALESCE("impression_count", 0) + 1
  WHERE "id" = ad_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_ad_click(ad_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "ad"
  SET "click_count" = COALESCE("click_count", 0) + 1
  WHERE "id" = ad_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_local_listing_report(listing_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "local_listing"
  SET "report_count" = COALESCE("report_count", 0) + 1
  WHERE "id" = listing_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_job_alert_report(job_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "job_alert"
  SET "report_count" = COALESCE("report_count", 0) + 1
  WHERE "id" = job_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_emergency_confirm(post_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "emergency_post"
  SET "confirm_count" = COALESCE("confirm_count", 0) + 1
  WHERE "id" = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_scam_confirm(post_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "scam_alert"
  SET "confirm_count" = COALESCE("confirm_count", 0) + 1
  WHERE "id" = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_situation_confirm(post_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE "situation_update"
  SET "confirm_count" = COALESCE("confirm_count", 0) + 1
  WHERE "id" = post_id;
END;
$$;


-- =========================================================================
-- 4. USER MANAGEMENT SUPPORT FOR ADMIN
-- =========================================================================

-- Expose auth.users through a secure view in the public schema
CREATE OR REPLACE VIEW public.user WITH (security_barrier) AS
SELECT 
  id,
  email,
  created_at AS created_date,
  COALESCE(raw_user_meta_data->>'full_name', email) AS full_name,
  COALESCE(raw_user_meta_data->>'role', 'user') AS role
FROM auth.users
WHERE (
  -- Restrict access to admins only
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
);

-- Grant select permission to standard roles so PostgREST can fetch it
GRANT SELECT ON public.user TO authenticated;
GRANT SELECT ON public.user TO anon;

-- RPC function to securely update user roles (promote/demote admin)
CREATE OR REPLACE FUNCTION update_user_role(user_id UUID, new_role TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Verify the calling user is indeed an admin
  IF COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Administrator privileges required';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', new_role)
  WHERE id = user_id;
END;
$$;

