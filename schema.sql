-- Namma TN Database Schema for Supabase / PostgreSQL
-- Generated on 2026-06-15T18:29:12.340Z

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist
DROP TABLE IF EXISTS "ad" CASCADE;
DROP TABLE IF EXISTS "answer" CASCADE;
DROP TABLE IF EXISTS "area" CASCADE;
DROP TABLE IF EXISTS "civic_action" CASCADE;
DROP TABLE IF EXISTS "civic_sponsor" CASCADE;
DROP TABLE IF EXISTS "comment" CASCADE;
DROP TABLE IF EXISTS "community_confirmation" CASCADE;
DROP TABLE IF EXISTS "community_discussion" CASCADE;
DROP TABLE IF EXISTS "complaint_tracker" CASCADE;
DROP TABLE IF EXISTS "contact_message" CASCADE;
DROP TABLE IF EXISTS "content_analysis" CASCADE;
DROP TABLE IF EXISTS "contributor_activity" CASCADE;
DROP TABLE IF EXISTS "department_route" CASCADE;
DROP TABLE IF EXISTS "discussion_reply" CASCADE;
DROP TABLE IF EXISTS "donation_record" CASCADE;
DROP TABLE IF EXISTS "emergency_post" CASCADE;
DROP TABLE IF EXISTS "job_alert" CASCADE;
DROP TABLE IF EXISTS "listing_review" CASCADE;
DROP TABLE IF EXISTS "live_chat_message" CASCADE;
DROP TABLE IF EXISTS "live_room" CASCADE;
DROP TABLE IF EXISTS "live_room_message" CASCADE;
DROP TABLE IF EXISTS "local_listing" CASCADE;
DROP TABLE IF EXISTS "moderation_log" CASCADE;
DROP TABLE IF EXISTS "notification" CASCADE;
DROP TABLE IF EXISTS "office_report" CASCADE;
DROP TABLE IF EXISTS "payment_settings" CASCADE;
DROP TABLE IF EXISTS "payment_submission" CASCADE;
DROP TABLE IF EXISTS "post" CASCADE;
DROP TABLE IF EXISTS "question" CASCADE;
DROP TABLE IF EXISTS "reaction" CASCADE;
DROP TABLE IF EXISTS "recognition_log" CASCADE;
DROP TABLE IF EXISTS "report" CASCADE;
DROP TABLE IF EXISTS "rwa_group" CASCADE;
DROP TABLE IF EXISTS "scam_alert" CASCADE;
DROP TABLE IF EXISTS "site_settings" CASCADE;
DROP TABLE IF EXISTS "situation_update" CASCADE;
DROP TABLE IF EXISTS "spam_flag" CASCADE;
DROP TABLE IF EXISTS "stay_listing" CASCADE;
DROP TABLE IF EXISTS "stay_report" CASCADE;
DROP TABLE IF EXISTS "supporter_membership" CASCADE;

-- Table: ad (Ad)
CREATE TABLE "ad" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "image_url" TEXT,
  "redirect_url" TEXT NOT NULL,
  "placement" TEXT DEFAULT 'feed' NOT NULL,
  "ad_type" TEXT DEFAULT 'banner',
  "targeting" TEXT DEFAULT 'all',
  "active" BOOLEAN DEFAULT true,
  "start_date" TEXT,
  "end_date" TEXT,
  "click_count" INTEGER DEFAULT 0,
  "impression_count" INTEGER DEFAULT 0
);

-- Table: answer (Answer)
CREATE TABLE "answer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "question_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "is_anonymous" BOOLEAN DEFAULT true,
  "author_name" TEXT,
  "helpful_count" INTEGER DEFAULT 0,
  "is_accepted" BOOLEAN DEFAULT false,
  "status" TEXT DEFAULT 'active'
);

-- Table: area (Area)
CREATE TABLE "area" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "name_en" TEXT NOT NULL,
  "name_ta" TEXT,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "zone" TEXT,
  "post_count" INTEGER DEFAULT 0,
  "active" BOOLEAN DEFAULT true
);

CREATE INDEX idx_area_district_slug ON "area"("district_slug");

-- Table: civic_action (CivicAction)
CREATE TABLE "civic_action" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "post_id" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "is_authenticated" BOOLEAN DEFAULT false,
  "metadata" JSONB DEFAULT '{}'::jsonb
);

-- Table: civic_sponsor (CivicSponsor)
CREATE TABLE "civic_sponsor" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "sponsor_name" TEXT NOT NULL,
  "sponsor_type" TEXT DEFAULT 'business',
  "sponsor_logo_url" TEXT,
  "sponsor_website" TEXT,
  "contact_email" TEXT,
  "contact_phone" TEXT,
  "plan" TEXT DEFAULT 'area_dashboard' NOT NULL,
  "district_slug" TEXT,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "sponsor_note" TEXT,
  "campaign_title" TEXT,
  "campaign_type" TEXT,
  "budget_inr" NUMERIC,
  "before_photo_urls" JSONB DEFAULT '[]'::jsonb,
  "after_photo_urls" JSONB DEFAULT '[]'::jsonb,
  "linked_post_ids" JSONB DEFAULT '[]'::jsonb,
  "issues_supported_count" INTEGER DEFAULT 0,
  "community_reach" NUMERIC DEFAULT 0,
  "is_active" BOOLEAN DEFAULT false,
  "is_verified" BOOLEAN DEFAULT false,
  "start_date" TEXT,
  "end_date" TEXT,
  "status" TEXT DEFAULT 'pending',
  "payment_ref" TEXT,
  "admin_note" TEXT
);

-- Table: comment (Comment)
CREATE TABLE "comment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "post_id" TEXT NOT NULL,
  "parent_comment_id" TEXT,
  "content" TEXT NOT NULL,
  "author_name" TEXT,
  "author_id" TEXT,
  "is_anonymous" BOOLEAN DEFAULT false,
  "upvotes" INTEGER DEFAULT 0,
  "report_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "hidden_by" TEXT,
  "hidden_reason" TEXT,
  "is_pending_review" BOOLEAN DEFAULT false
);

CREATE INDEX idx_comment_post_id ON "comment"("post_id");
CREATE INDEX idx_comment_parent_id ON "comment"("parent_comment_id");

-- Table: community_confirmation (CommunityConfirmation)
CREATE TABLE "community_confirmation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "district_slug" TEXT
);

-- Table: community_discussion (CommunityDiscussion)
CREATE TABLE "community_discussion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "discussion_type" TEXT DEFAULT 'civic' NOT NULL,
  "topic" TEXT DEFAULT 'general',
  "district_slug" TEXT,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "author_session" TEXT,
  "author_label" TEXT DEFAULT 'Community Member',
  "is_anonymous" BOOLEAN DEFAULT true,
  "is_live" BOOLEAN DEFAULT false,
  "is_pinned" BOOLEAN DEFAULT false,
  "is_archived" BOOLEAN DEFAULT false,
  "reply_count" INTEGER DEFAULT 0,
  "confirm_count" INTEGER DEFAULT 0,
  "helpful_count" INTEGER DEFAULT 0,
  "same_issue_count" INTEGER DEFAULT 0,
  "nearby_affected_count" INTEGER DEFAULT 0,
  "resolved_count" INTEGER DEFAULT 0,
  "is_resolved" BOOLEAN DEFAULT false,
  "status" TEXT DEFAULT 'active',
  "linked_emergency_id" TEXT,
  "linked_situation_id" TEXT
);

-- Table: complaint_tracker (ComplaintTracker)
CREATE TABLE "complaint_tracker" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "post_id" TEXT NOT NULL,
  "civic_receipt_id" TEXT NOT NULL,
  "official_complaint_id" TEXT,
  "complaint_filed_date" TEXT,
  "department_name" TEXT,
  "complaint_link" TEXT,
  "screenshot_url" TEXT,
  "notes" TEXT,
  "session_ref" TEXT,
  "follow_up_count" INTEGER DEFAULT 0,
  "last_follow_up" TEXT,
  "response_received" BOOLEAN DEFAULT false,
  "response_notes" TEXT
);

-- Table: contact_message (ContactMessage)
CREATE TABLE "contact_message" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT,
  "topic" TEXT DEFAULT 'general',
  "message" TEXT NOT NULL,
  "status" TEXT DEFAULT 'new',
  "admin_reply" TEXT,
  "admin_note" TEXT
);

-- Table: content_analysis (ContentAnalysis)
CREATE TABLE "content_analysis" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "classification" TEXT DEFAULT 'unknown',
  "classification_confidence" NUMERIC,
  "toxicity_score" NUMERIC,
  "spam_score" NUMERIC,
  "trust_score" NUMERIC,
  "needs_review" BOOLEAN DEFAULT false,
  "issues" JSONB DEFAULT '[]'::jsonb,
  "sensitive_findings" JSONB DEFAULT '[]'::jsonb,
  "analysis_source" TEXT DEFAULT 'local',
  "reviewed_by_admin" BOOLEAN DEFAULT false,
  "admin_override" TEXT
);

-- Table: contributor_activity (ContributorActivity)
CREATE TABLE "contributor_activity" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "session_ref" TEXT NOT NULL,
  "activity_type" TEXT DEFAULT 'useful_update' NOT NULL,
  "target_type" TEXT,
  "target_id" TEXT,
  "district_slug" TEXT,
  "status" TEXT DEFAULT 'positive'
);

-- Table: department_route (DepartmentRoute)
CREATE TABLE "department_route" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "category_slug" TEXT NOT NULL,
  "category_name" TEXT,
  "department" TEXT NOT NULL,
  "office_type" TEXT,
  "reason" TEXT,
  "official_website" TEXT,
  "complaint_portal" TEXT,
  "phone" TEXT,
  "complaint_template" TEXT,
  "instructions" TEXT,
  "escalation_instructions" TEXT,
  "follow_up_days" NUMERIC DEFAULT 14,
  "escalation_days" NUMERIC DEFAULT 30,
  "is_active" BOOLEAN DEFAULT true
);

-- Table: discussion_reply (DiscussionReply)
CREATE TABLE "discussion_reply" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "discussion_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "reply_type" TEXT DEFAULT 'update',
  "author_session" TEXT,
  "author_label" TEXT DEFAULT 'Community Member',
  "is_anonymous" BOOLEAN DEFAULT true,
  "helpful_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active'
);

-- Table: donation_record (DonationRecord)
CREATE TABLE "donation_record" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "session_ref" TEXT NOT NULL,
  "email" TEXT,
  "amount" NUMERIC NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "payment_method" TEXT DEFAULT 'upi' NOT NULL,
  "transaction_ref" TEXT,
  "message" TEXT,
  "is_anonymous" BOOLEAN DEFAULT true,
  "status" TEXT DEFAULT 'pending'
);

-- Table: emergency_post (EmergencyPost)
CREATE TABLE "emergency_post" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "emergency_type" TEXT DEFAULT 'community_help' NOT NULL,
  "urgency" TEXT DEFAULT 'high',
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "contact_info" TEXT,
  "contact_visible" BOOLEAN DEFAULT true,
  "is_resolved" BOOLEAN DEFAULT false,
  "confirm_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "is_verified" BOOLEAN DEFAULT false
);

-- Table: job_alert (JobAlert)
CREATE TABLE "job_alert" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "job_type" TEXT DEFAULT 'local_hiring' NOT NULL,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "contact_visible" BOOLEAN DEFAULT false,
  "contact_info" TEXT,
  "salary_info" TEXT,
  "duration" TEXT,
  "status" TEXT DEFAULT 'pending',
  "expires_at" TEXT,
  "report_count" INTEGER DEFAULT 0
);

-- Table: listing_review (ListingReview)
CREATE TABLE "listing_review" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "listing_id" TEXT NOT NULL,
  "session_ref" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "is_anonymous" BOOLEAN DEFAULT true,
  "status" TEXT DEFAULT 'active'
);

-- Table: live_chat_message (LiveChatMessage)
CREATE TABLE "live_chat_message" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "channel" TEXT DEFAULT 'general' NOT NULL,
  "content" TEXT NOT NULL,
  "message_type" TEXT DEFAULT 'update',
  "district_slug" TEXT,
  "district_name" TEXT,
  "area_slug" TEXT,
  "author_session" TEXT NOT NULL,
  "author_id" TEXT,
  "author_label" TEXT DEFAULT 'Community Member',
  "is_supporter" BOOLEAN DEFAULT false,
  "report_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "hidden_by" TEXT,
  "hidden_reason" TEXT
);

-- Table: live_room (LiveRoom)
CREATE TABLE "live_room" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "room_type" TEXT DEFAULT 'community',
  "district_slug" TEXT,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "status" TEXT DEFAULT 'active',
  "pinned_notice" TEXT,
  "is_emergency" BOOLEAN DEFAULT false,
  "is_resolved" BOOLEAN DEFAULT false,
  "linked_situation_id" TEXT,
  "linked_emergency_id" TEXT,
  "message_count" INTEGER DEFAULT 0,
  "participant_count" INTEGER DEFAULT 0
);

-- Table: live_room_message (LiveRoomMessage)
CREATE TABLE "live_room_message" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "room_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "message_type" TEXT DEFAULT 'update',
  "author_session" TEXT NOT NULL,
  "author_label" TEXT DEFAULT 'Community Member',
  "district_slug" TEXT,
  "district_name" TEXT,
  "is_pinned" BOOLEAN DEFAULT false,
  "is_admin" BOOLEAN DEFAULT false,
  "status" TEXT DEFAULT 'active'
);

-- Table: local_listing (LocalListing)
CREATE TABLE "local_listing" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "business_name" TEXT NOT NULL,
  "category" TEXT DEFAULT 'other' NOT NULL,
  "plan" TEXT DEFAULT 'free',
  "description" TEXT,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "service_areas" JSONB DEFAULT '[]'::jsonb,
  "contact_phone" TEXT,
  "contact_whatsapp" TEXT,
  "contact_email" TEXT,
  "photo_urls" JSONB DEFAULT '[]'::jsonb,
  "is_verified" BOOLEAN DEFAULT false,
  "is_featured" BOOLEAN DEFAULT false,
  "is_community_recommended" BOOLEAN DEFAULT false,
  "is_sponsored" BOOLEAN DEFAULT false,
  "rating_sum" NUMERIC DEFAULT 0,
  "rating_count" INTEGER DEFAULT 0,
  "report_count" INTEGER DEFAULT 0,
  "view_count" INTEGER DEFAULT 0,
  "session_ref" TEXT,
  "status" TEXT DEFAULT 'pending',
  "expires_at" TEXT,
  "admin_note" TEXT,
  "payment_ref" TEXT
);

-- Table: moderation_log (ModerationLog)
CREATE TABLE "moderation_log" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "admin_email" TEXT
);

-- Table: notification (Notification)
CREATE TABLE "notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT,
  "target_type" TEXT,
  "target_id" TEXT,
  "is_read" BOOLEAN DEFAULT false,
  "priority" TEXT DEFAULT 'normal',
  "read_at" TEXT,
  "metadata" JSONB DEFAULT '{}'::jsonb
);

-- Table: office_report (OfficeReport)
CREATE TABLE "office_report" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "office_slug" TEXT NOT NULL,
  "office_name" TEXT,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "visit_date" TEXT,
  "waiting_time" TEXT NOT NULL,
  "service_speed" TEXT NOT NULL,
  "office_status" TEXT DEFAULT 'open_normal',
  "staff_behavior" TEXT,
  "cleanliness" TEXT,
  "notes" TEXT,
  "purpose_of_visit" TEXT,
  "is_anonymous" BOOLEAN DEFAULT true,
  "helpful_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "is_verified" BOOLEAN DEFAULT false
);

-- Table: payment_settings (PaymentSettings)
CREATE TABLE "payment_settings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "label" TEXT,
  "is_enabled" BOOLEAN DEFAULT true,
  "category" TEXT DEFAULT 'general'
);

-- Table: payment_submission (PaymentSubmission)
CREATE TABLE "payment_submission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "submission_type" TEXT DEFAULT 'supporter' NOT NULL,
  "session_ref" TEXT NOT NULL,
  "email" TEXT,
  "amount" NUMERIC NOT NULL,
  "payment_method" TEXT DEFAULT 'upi',
  "transaction_ref" TEXT NOT NULL,
  "screenshot_url" TEXT,
  "message" TEXT,
  "status" TEXT DEFAULT 'pending',
  "admin_note" TEXT
);

-- Table: post (Post)
CREATE TABLE "post" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title_en" TEXT NOT NULL,
  "title_ta" TEXT,
  "content_en" TEXT,
  "content_ta" TEXT,
  "post_type" TEXT DEFAULT 'discussion' NOT NULL,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "category_slug" TEXT NOT NULL,
  "category_name" TEXT,
  "is_anonymous" BOOLEAN DEFAULT false,
  "author_name" TEXT,
  "media_urls" JSONB DEFAULT '[]'::jsonb,
  "upvotes" INTEGER DEFAULT 0,
  "downvotes" INTEGER DEFAULT 0,
  "comment_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "civic_receipt_id" TEXT,
  "location_text" TEXT,
  "urgency_level" TEXT DEFAULT 'medium',
  "civic_status" TEXT DEFAULT 'reported',
  "verification_count" INTEGER DEFAULT 0,
  "duplicate_count" INTEGER DEFAULT 0,
  "citizen_fixed_count" INTEGER DEFAULT 0,
  "still_not_fixed_count" INTEGER DEFAULT 0,
  "official_complaint_id" TEXT,
  "complaint_filed_date" TEXT,
  "complaint_notes" TEXT,
  "complaint_link" TEXT,
  "complaint_screenshot_url" TEXT,
  "assigned_department" TEXT,
  "escalation_level" INTEGER DEFAULT 0,
  "timeline_events" JSONB DEFAULT '[]'::jsonb,
  "before_photos" JSONB DEFAULT '[]'::jsonb,
  "claimed_fixed_photos" JSONB DEFAULT '[]'::jsonb,
  "final_resolution_photos" JSONB DEFAULT '[]'::jsonb,
  "is_community_solved" BOOLEAN DEFAULT false,
  "is_publicly_visible" BOOLEAN DEFAULT true,
  "moderation_status" TEXT DEFAULT 'approved',
  "admin_note" TEXT
);

CREATE INDEX idx_post_status ON "post"("status");
CREATE INDEX idx_post_created_date ON "post"("created_date" DESC);
CREATE INDEX idx_post_district_slug ON "post"("district_slug");
CREATE INDEX idx_post_category_slug ON "post"("category_slug");

-- Table: question (Question)
CREATE TABLE "question" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "category_slug" TEXT,
  "category_name" TEXT,
  "is_anonymous" BOOLEAN DEFAULT true,
  "author_name" TEXT,
  "status" TEXT DEFAULT 'open',
  "answer_count" INTEGER DEFAULT 0,
  "view_count" INTEGER DEFAULT 0,
  "is_trending" BOOLEAN DEFAULT false
);

-- Table: reaction (Reaction)
CREATE TABLE "reaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "target_id" TEXT NOT NULL,
  "target_type" TEXT DEFAULT 'post' NOT NULL,
  "reaction_type" TEXT DEFAULT 'like' NOT NULL,
  "actor_id" TEXT NOT NULL,
  "is_authenticated" BOOLEAN DEFAULT false
);

-- Table: recognition_log (RecognitionLog)
CREATE TABLE "recognition_log" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "session_ref" TEXT NOT NULL,
  "recognition_type" TEXT DEFAULT 'helpful_community_member' NOT NULL,
  "granted_by_admin" TEXT,
  "district_slug" TEXT,
  "notes" TEXT,
  "expires_at" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT true
);

-- Table: report (Report)
CREATE TABLE "report" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "reason" TEXT DEFAULT 'other' NOT NULL,
  "details" TEXT,
  "reporter_session" TEXT,
  "status" TEXT DEFAULT 'pending',
  "reviewed_note" TEXT
);

-- Table: rwa_group (RWAGroup)
CREATE TABLE "rwa_group" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "group_name" TEXT NOT NULL,
  "group_type" TEXT DEFAULT 'rwa' NOT NULL,
  "plan" TEXT DEFAULT 'free_community',
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "admin_session" TEXT,
  "admin_email" TEXT,
  "member_count" INTEGER DEFAULT 0,
  "description" TEXT,
  "logo_url" TEXT,
  "is_verified" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "issue_count" INTEGER DEFAULT 0,
  "resolved_count" INTEGER DEFAULT 0,
  "payment_ref" TEXT,
  "status" TEXT DEFAULT 'pending',
  "expires_at" TEXT
);

-- Table: scam_alert (ScamAlert)
CREATE TABLE "scam_alert" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "scam_type" TEXT DEFAULT 'other' NOT NULL,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "warning_level" TEXT DEFAULT 'medium',
  "is_verified" BOOLEAN DEFAULT false,
  "confirm_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'pending',
  "is_anonymous" BOOLEAN DEFAULT true
);

-- Table: site_settings (SiteSettings)
CREATE TABLE "site_settings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "category" TEXT DEFAULT 'general'
);

-- Table: situation_update (SituationUpdate)
CREATE TABLE "situation_update" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "situation_type" TEXT DEFAULT 'other' NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "urgency" TEXT DEFAULT 'info',
  "is_verified" BOOLEAN DEFAULT false,
  "is_resolved" BOOLEAN DEFAULT false,
  "confirm_count" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "media_urls" JSONB DEFAULT '[]'::jsonb
);

-- Table: spam_flag (SpamFlag)
CREATE TABLE "spam_flag" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "session_ref" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "reason" TEXT DEFAULT 'spam' NOT NULL,
  "auto_flagged" BOOLEAN DEFAULT false,
  "resolved" BOOLEAN DEFAULT false
);

-- Table: stay_listing (StayListing)
CREATE TABLE "stay_listing" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "listing_type" TEXT DEFAULT 'pg_available' NOT NULL,
  "district_slug" TEXT NOT NULL,
  "district_name" TEXT,
  "area_slug" TEXT,
  "area_name" TEXT,
  "landmark" TEXT,
  "rent_amount" NUMERIC,
  "rent_period" TEXT DEFAULT 'monthly',
  "gender_preference" TEXT DEFAULT 'any',
  "occupancy_type" TEXT DEFAULT 'single',
  "available_from" TEXT,
  "amenities" JSONB DEFAULT '[]'::jsonb,
  "image_urls" JSONB DEFAULT '[]'::jsonb,
  "contact_preference" TEXT DEFAULT 'message_only',
  "whatsapp" TEXT,
  "phone" TEXT,
  "telegram" TEXT,
  "author_session" TEXT,
  "is_anonymous" BOOLEAN DEFAULT true,
  "status" TEXT DEFAULT 'pending',
  "is_verified" BOOLEAN DEFAULT false,
  "is_trusted" BOOLEAN DEFAULT false,
  "report_count" INTEGER DEFAULT 0,
  "view_count" INTEGER DEFAULT 0,
  "contact_reveals" NUMERIC DEFAULT 0,
  "expires_at" TEXT,
  "nearby_college" TEXT,
  "nearby_office" TEXT,
  "nearby_metro" TEXT,
  "nearby_railway" TEXT
);

-- Table: stay_report (StayReport)
CREATE TABLE "stay_report" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "listing_id" TEXT NOT NULL,
  "session_ref" TEXT NOT NULL,
  "reason" TEXT DEFAULT 'spam' NOT NULL,
  "details" TEXT,
  "status" TEXT DEFAULT 'pending'
);

-- Table: supporter_membership (SupporterMembership)
CREATE TABLE "supporter_membership" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "created_by" TEXT,
  "is_sample" BOOLEAN DEFAULT false,
  "session_ref" TEXT NOT NULL,
  "email" TEXT,
  "payment_method" TEXT DEFAULT 'upi' NOT NULL,
  "amount" NUMERIC NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "transaction_ref" TEXT,
  "payment_submission_id" TEXT,
  "status" TEXT DEFAULT 'pending',
  "valid_until" TEXT,
  "notes" TEXT
);

-- =========================================================================
-- PRE-BUILT ADMIN USERS FOR SUPABASE AUTH
-- =========================================================================

-- Note: In Supabase, users are managed inside auth.users table.
-- When running on Supabase SQL editor, this will create 2 admin users.


-- Admin User 1: admin@nammatn.in
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, recovery_sent_at, last_sign_in_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'authenticated', 'authenticated',
  'admin@nammatn.in',
  crypt('AdminTN2026!', gen_salt('bf', 10)), -- Password: AdminTN2026!
  NOW(), NULL, NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Namma TN Admin 1", "role": "admin"}'::jsonb,
  NOW(), NOW(), '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'
);

-- Admin User 1 Identity mapping
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
)
SELECT 
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  '{"sub": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", "email": "admin@nammatn.in"}'::jsonb,
  'email', NOW(), NOW(), NOW(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE user_id = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'
);


-- Admin User 2: supervisor@nammatn.in
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, recovery_sent_at, last_sign_in_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', -- Fixed UUID for Admin 2
  'authenticated', 'authenticated',
  'supervisor@nammatn.in',
  crypt('SuperTN2026!', gen_salt('bf', 10)), -- Password: SuperTN2026!
  NOW(), NULL, NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Namma TN Supervisor", "role": "admin"}'::jsonb,
  NOW(), NOW(), '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
);

-- Admin User 2 Identity mapping
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
)
SELECT 
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
  '{"sub": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", "email": "supervisor@nammatn.in"}'::jsonb,
  'email', NOW(), NOW(), NOW(), 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE user_id = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES & STORAGE
-- ==========================================

-- 1. STORAGE BUCKET CONFIGURATION
-- Create the 'media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;



-- Create storage policies
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated Insert Access" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated Owner Access" ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = owner::text);


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


-- 3. CREATE EXPLICIT DECOUPLED CRUD POLICIES FOR ALL TABLES

-- ad
CREATE POLICY ad_select ON "ad" FOR SELECT USING (active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY ad_insert ON "ad" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY ad_update ON "ad" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY ad_delete ON "ad" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- answer
CREATE POLICY answer_select ON "answer" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY answer_insert ON "answer" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY answer_update ON "answer" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY answer_delete ON "answer" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- area
CREATE POLICY area_select ON "area" FOR SELECT USING (true);
CREATE POLICY area_insert ON "area" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY area_update ON "area" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY area_delete ON "area" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- civic_action
CREATE POLICY civic_action_select ON "civic_action" FOR SELECT USING (true);
CREATE POLICY civic_action_insert ON "civic_action" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY civic_action_update ON "civic_action" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));
CREATE POLICY civic_action_delete ON "civic_action" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));

-- civic_sponsor
CREATE POLICY civic_sponsor_select ON "civic_sponsor" FOR SELECT USING (status = 'approved' OR is_active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY civic_sponsor_insert ON "civic_sponsor" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY civic_sponsor_update ON "civic_sponsor" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY civic_sponsor_delete ON "civic_sponsor" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- comment
CREATE POLICY comment_select ON "comment" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY comment_insert ON "comment" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY comment_update ON "comment" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY comment_delete ON "comment" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- community_confirmation
CREATE POLICY community_confirmation_select ON "community_confirmation" FOR SELECT USING (true);
CREATE POLICY community_confirmation_insert ON "community_confirmation" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id = auth.uid()::text));
CREATE POLICY community_confirmation_update ON "community_confirmation" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY community_confirmation_delete ON "community_confirmation" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- community_discussion
CREATE POLICY community_discussion_select ON "community_discussion" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY community_discussion_insert ON "community_discussion" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY community_discussion_update ON "community_discussion" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY community_discussion_delete ON "community_discussion" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- complaint_tracker
CREATE POLICY complaint_tracker_select ON "complaint_tracker" FOR SELECT USING (true);
CREATE POLICY complaint_tracker_insert ON "complaint_tracker" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY complaint_tracker_update ON "complaint_tracker" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY complaint_tracker_delete ON "complaint_tracker" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- contact_message
CREATE POLICY contact_message_select ON "contact_message" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY contact_message_insert ON "contact_message" FOR INSERT WITH CHECK (true);
CREATE POLICY contact_message_update ON "contact_message" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY contact_message_delete ON "contact_message" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- content_analysis
CREATE POLICY content_analysis_select ON "content_analysis" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY content_analysis_insert ON "content_analysis" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY content_analysis_update ON "content_analysis" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY content_analysis_delete ON "content_analysis" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- contributor_activity
CREATE POLICY contributor_activity_select ON "contributor_activity" FOR SELECT USING (true);
CREATE POLICY contributor_activity_insert ON "contributor_activity" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY contributor_activity_update ON "contributor_activity" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY contributor_activity_delete ON "contributor_activity" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- department_route
CREATE POLICY department_route_select ON "department_route" FOR SELECT USING (true);
CREATE POLICY department_route_insert ON "department_route" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY department_route_update ON "department_route" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY department_route_delete ON "department_route" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- discussion_reply
CREATE POLICY discussion_reply_select ON "discussion_reply" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY discussion_reply_insert ON "discussion_reply" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY discussion_reply_update ON "discussion_reply" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY discussion_reply_delete ON "discussion_reply" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- donation_record
CREATE POLICY donation_record_select ON "donation_record" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY donation_record_insert ON "donation_record" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY donation_record_update ON "donation_record" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY donation_record_delete ON "donation_record" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- emergency_post
CREATE POLICY emergency_post_select ON "emergency_post" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY emergency_post_insert ON "emergency_post" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY emergency_post_update ON "emergency_post" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY emergency_post_delete ON "emergency_post" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- job_alert
CREATE POLICY job_alert_select ON "job_alert" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY job_alert_insert ON "job_alert" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY job_alert_update ON "job_alert" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY job_alert_delete ON "job_alert" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- listing_review
CREATE POLICY listing_review_select ON "listing_review" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY listing_review_insert ON "listing_review" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY listing_review_update ON "listing_review" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY listing_review_delete ON "listing_review" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- live_chat_message
CREATE POLICY live_chat_message_select ON "live_chat_message" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY live_chat_message_insert ON "live_chat_message" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY live_chat_message_update ON "live_chat_message" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY live_chat_message_delete ON "live_chat_message" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- live_room
CREATE POLICY live_room_select ON "live_room" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY live_room_insert ON "live_room" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY live_room_update ON "live_room" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY live_room_delete ON "live_room" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- live_room_message
CREATE POLICY live_room_message_select ON "live_room_message" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY live_room_message_insert ON "live_room_message" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY live_room_message_update ON "live_room_message" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY live_room_message_delete ON "live_room_message" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- local_listing
CREATE POLICY local_listing_select ON "local_listing" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY local_listing_insert ON "local_listing" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY local_listing_update ON "local_listing" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY local_listing_delete ON "local_listing" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- moderation_log
CREATE POLICY moderation_log_select ON "moderation_log" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY moderation_log_insert ON "moderation_log" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY moderation_log_update ON "moderation_log" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY moderation_log_delete ON "moderation_log" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- notification
CREATE POLICY notification_select ON "notification" FOR SELECT USING (user_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY notification_insert ON "notification" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY notification_update ON "notification" FOR UPDATE USING (user_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY notification_delete ON "notification" FOR DELETE USING (user_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- office_report
CREATE POLICY office_report_select ON "office_report" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY office_report_insert ON "office_report" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY office_report_update ON "office_report" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY office_report_delete ON "office_report" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- payment_settings
CREATE POLICY payment_settings_select ON "payment_settings" FOR SELECT USING (true);
CREATE POLICY payment_settings_insert ON "payment_settings" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY payment_settings_update ON "payment_settings" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY payment_settings_delete ON "payment_settings" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- payment_submission
CREATE POLICY payment_submission_select ON "payment_submission" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY payment_submission_insert ON "payment_submission" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY payment_submission_update ON "payment_submission" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY payment_submission_delete ON "payment_submission" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- post
CREATE POLICY post_select ON "post" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY post_insert ON "post" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY post_update ON "post" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY post_delete ON "post" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- question
CREATE POLICY question_select ON "question" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY question_insert ON "question" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY question_update ON "question" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY question_delete ON "question" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- reaction
CREATE POLICY reaction_select ON "reaction" FOR SELECT USING (true);
CREATE POLICY reaction_insert ON "reaction" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (actor_id = auth.uid()::text));
CREATE POLICY reaction_update ON "reaction" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));
CREATE POLICY reaction_delete ON "reaction" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (actor_id = auth.uid()::text));

-- recognition_log
CREATE POLICY recognition_log_select ON "recognition_log" FOR SELECT USING (is_active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY recognition_log_insert ON "recognition_log" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY recognition_log_update ON "recognition_log" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY recognition_log_delete ON "recognition_log" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- report
CREATE POLICY report_select ON "report" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY report_insert ON "report" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY report_update ON "report" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY report_delete ON "report" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- rwa_group
CREATE POLICY rwa_group_select ON "rwa_group" FOR SELECT USING (is_active = true OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY rwa_group_insert ON "rwa_group" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY rwa_group_update ON "rwa_group" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY rwa_group_delete ON "rwa_group" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- scam_alert
CREATE POLICY scam_alert_select ON "scam_alert" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY scam_alert_insert ON "scam_alert" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY scam_alert_update ON "scam_alert" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY scam_alert_delete ON "scam_alert" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- site_settings
CREATE POLICY site_settings_select ON "site_settings" FOR SELECT USING (true);
CREATE POLICY site_settings_insert ON "site_settings" FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY site_settings_update ON "site_settings" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY site_settings_delete ON "site_settings" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- situation_update
CREATE POLICY situation_update_select ON "situation_update" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY situation_update_insert ON "situation_update" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY situation_update_update ON "situation_update" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY situation_update_delete ON "situation_update" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- spam_flag
CREATE POLICY spam_flag_select ON "spam_flag" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY spam_flag_insert ON "spam_flag" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY spam_flag_update ON "spam_flag" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY spam_flag_delete ON "spam_flag" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- stay_listing
CREATE POLICY stay_listing_select ON "stay_listing" FOR SELECT USING (status = 'active' OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY stay_listing_insert ON "stay_listing" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY stay_listing_update ON "stay_listing" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY stay_listing_delete ON "stay_listing" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));

-- stay_report
CREATE POLICY stay_report_select ON "stay_report" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY stay_report_insert ON "stay_report" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY stay_report_update ON "stay_report" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
CREATE POLICY stay_report_delete ON "stay_report" FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));

-- supporter_membership
CREATE POLICY supporter_membership_select ON "supporter_membership" FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (created_by_id = auth.uid()::text));
CREATE POLICY supporter_membership_insert ON "supporter_membership" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by_id IS NULL OR created_by_id = auth.uid()::text));
CREATE POLICY supporter_membership_update ON "supporter_membership" FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'));
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



