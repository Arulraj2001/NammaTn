# Website Features & Actual Functionality Audit

> **Document Type:** System Functionality Specification & Live Audit  
> **Repository:** Namma TN (VizhiTN / Vizhi TN 234)  
> **Last Verified Date:** August 20, 2026  
> **Verification Basis:** Full Codebase & Live Database Inspection  

---

## 1. Site Overview

**Namma TN** (also branded as **VizhiTN / Vizhi TN 234**) is a hyper-local civic engagement, public accountability, and community intelligence web application designed for residents across all 38 districts of Tamil Nadu. The platform enables citizens to document local infrastructure defects (potholes, streetlights, garbage accumulation, water supply disruptions), generate trackable **Civic Receipts**, calculate issue credibility scores, and report government corruption/bribe requests. In addition to civic issue tracking, Namma TN functions as a regional news and community hub featuring daily Tamil Nadu headline articles (**TN Today**), emergency broadcasts, scam alerts, hyper-local Q&A ("Ask Local"), citizen awareness resources (rights, government schemes, portal links), and community listings for jobs, stays, and Resident Welfare Associations (RWAs).

---

## 2. Core Features

| Feature / Module Name | What It Does | Who Can Use It | Current Status |
| :--- | :--- | :--- | :--- |
| **Civic Issue Submission & Civic Receipts** | Allows citizens to report local infrastructure issues with title, Tamil/English description, district, area, photos, GPS coordinates, and urgency level. Auto-generates a unique alphanumeric Civic Receipt ID (e.g. `TN-CH-ST-2026-0042`) and computes a Receipt Credibility Score. | Public (View) / Logged-in or Session-based (Submit) | **Live** |
| **Department Routing & Official Complaint Templates** | Automatically maps issue categories (streetlight, road, garbage, drainage, electricity, water) to responsible TN departments (TANGEDCO, TWAD, ULB/GCC, PWD). Generates copyable official complaint text templates, displays helpline numbers (1912, 1913, 1916, 14400), and provides official portal links. | Public | **Live** |
| **Community Verification & Fix Dispute** | Enables citizens to verify issue existence ("Confirm Issue"), report duplicates, or vote on claimed resolutions ("Confirm Fixed" vs "Still Not Fixed"). Calculates a citizen-driven Fix Confidence percentage. | Public (Session-tracked) & Logged-in | **Live** |
| **Official Complaint Resolution Tracker** | Allows users to attach official government complaint reference numbers, filing dates, and official portal screenshots to a Civic Receipt to track resolution progress through a 9-step status lifecycle. | Public (View) / Logged-in (Update) | **Live** (Manual entry; no auto-sync with govt APIs) |
| **TN Today (Regional News & Headline CMS)** | CMS and publishing module for daily Tamil Nadu news. Supports categories (infrastructure, governance, economy, healthcare, etc.), rich HTML content, "Why It Matters" callouts, key facts, timelines, official source links, and downloadable news poster graphics. | Public (Read) / Admin (Publish & Edit) | **Live** (71 articles in DB) |
| **Bribe Reporting & Corruption Tracker** | Anonymous or public reporting of government bribe requests, capturing department, officer designation, specific location, bribe amount, bribe status (requested / paid / refused), and optional audio proof. Features a district-wise corruption analytics dashboard. | Public (View & Submit) / Admin (Moderate) | **Live** |
| **Emergency Alerts & Community Help** | Real-time broadcast board for local emergencies (floods, medical emergencies, rescue help). Supports urgency indicators (low, medium, high, critical), GPS mapping, contact info visibility toggles, and community confirmation counters. | Public (View & Submit) / Admin (Moderate) | **Live** (5 items in DB) |
| **Scam Alerts Board** | Public warning system for local financial, job, digital, or real-estate scams. Displays scam classification, warning severity, location, and community confirmation counts. | Public (View & Submit) / Admin (Moderate) | **Live** (5 items in DB) |
| **Live Situation Updates** | Hyper-local real-time condition reports for traffic jams, power outages, rain/flooding, and office closures. | Public (View & Submit) / Admin (Moderate) | **Live** (10 items in DB) |
| **Ask Local (Q&A Board)** | Community Q&A forum where residents ask questions regarding local procedures, services, or areas and receive answers. Supports helpful voting and accepted answer tagging. | Public (View & Submit) / Admin (Moderate) | **Live** (6 questions, 6 answers in DB) |
| **Citizen Awareness Hub** | Structured directory containing guidebooks, FAQs, legal citizen rights under TN laws & RTI, government scheme eligibility details, emergency contacts, and official web portal links. | Public (Read) / Admin (Manage) | **Live** |
| **Local Job Alerts** | Community noticeboard for local hiring and job opportunities with salary information, contact details, duration, and dedicated SEO pages. | Public (View) / Logged-in (Submit) / Admin (Moderate) | **Live** (5 listings in DB) |
| **Stays & Accommodations Directory** | Directory for local rooms, PGs, hostels, and temporary stays with contact info, pricing, amenities, and reporting options. | Public (View) / Logged-in (Submit) / Admin (Moderate) | **Live** (5 listings in DB) |
| **Government Office Reports & Ratings** | User-submitted reviews and wait-time reports for local government offices (RTO, Taluk, Sub-Registrar, Municipal offices). Tracks service speed, waiting time, staff behavior, cleanliness, and open status. | Public (View & Submit) / Admin (Moderate) | **Live** (5 reports in DB) |
| **RWA (Resident Welfare Association) Directory** | Registry for local RWAs to list member counts, active area issues, and neighborhood coverage. | Public (View) / Admin (Manage) | **Live** (1 group in DB) |
| **Civic Leaderboard & User Trust Scores** | Scoreboards tracking top citizen contributors per district, awarding badges (e.g. Helpful Community Member), and maintaining dynamic user trust scores (0–100 scale). | Public (View) / System & Admin (Grant) | **Live** |
| **CSR & Civic Sponsoring** | Dashboard for businesses/companies to sponsor civic repairs and display before/after photos and community impact metrics. | Public (View) / Admin (Manage) | **Partial** (UI and schema exist; 0 active campaigns in DB) |
| **Local Business Listings** | Directory for local small businesses and service providers. | Public (View) / Admin (Manage) | **Partial** (UI and schema exist; 0 listings in DB) |
| **User Authentication & Profiles** | Supabase Authentication (Email/Password, Google OAuth), user profile management, trust score tracking, and personal user dashboard (submitted posts, bookmarks, activity history). | Logged-in Users | **Live** (10 registered profiles) |
| **Ad Management & Monetization System** | Banner/feed ad management with placement targeting, start/end dates, impression counters (`increment_ad_impression`), and click counters (`increment_ad_click`). | Public (Render) / Admin (Manage) | **Live** (RPCs functional; 0 active ads in DB) |
| **Admin Moderation & Control Panel** | Dashboard for post moderation, user management, category editing, SEO meta management, ad management, report reviews, media management, content safety rules, and phase 8 controls. | Admin Only (`app_metadata.role = 'admin'`) | **Live** |

---

## 3. Content Types & High-Level Schemas

### 1. Post (`post`)
* **Purpose:** Represents civic issues, complaints, discussions, and bribe reports.
* **Key Fields:** `id`, `title_en`, `title_ta`, `content_en`, `content_ta`, `post_type` (`discussion` \| `complaint` \| `bribe_report`), `district_slug`, `area_slug`, `category_slug`, `is_anonymous`, `author_name`, `media_urls` (JSON array), `upvotes`, `downvotes`, `civic_receipt_id`, `location_text`, `urgency_level`, `civic_status` (`reported` \| `community_verified` \| `complaint_needed` \| `complaint_filed` \| `under_followup` \| `claimed_fixed` \| `citizen_verified_fixed` \| `unresolved_escalated` \| `community_solved` \| `duplicate_invalid`), `verification_count`, `citizen_fixed_count`, `still_not_fixed_count`, `official_complaint_id`, `complaint_filed_date`, `assigned_department`, `bribe_requested`, `bribe_amount`, `bribe_department`, `bribe_officer_designation`, `slug`, `seo_title`, `seo_description`, `is_publicly_visible`, `moderation_status`.

### 2. TN Today Article (`tn_today`)
* **Purpose:** Curated news articles and daily headlines for Tamil Nadu.
* **Key Fields:** `id`, `title`, `slug`, `subtitle`, `featured_image`, `category` (`infrastructure` \| `education` \| `healthcare` \| `environment` \| `economy` \| `governance` \| `transport` \| `agriculture` \| `technology` \| `social` \| `india` \| `world` \| `general`), `author_name`, `publish_date`, `status` (`draft` \| `scheduled` \| `published` \| `archived`), `reading_time`, `content` (HTML), `summary`, `why_it_matters`, `key_facts` (JSON), `timeline` (JSON), `official_sources` (JSON), `is_featured`, `view_count`.

### 3. Emergency Post (`emergency_post`)
* **Purpose:** Real-time emergency broadcasts and requests for community aid.
* **Key Fields:** `id`, `title`, `description`, `emergency_type` (`community_help` \| `medical` \| `disaster` \| `other`), `urgency` (`low` \| `medium` \| `high` \| `critical`), `district_slug`, `area_slug`, `contact_info`, `contact_visible`, `is_resolved`, `confirm_count`, `latitude`, `longitude`, `status`, `is_verified`.

### 4. Scam Alert (`scam_alert`)
* **Purpose:** Public warnings regarding localized fraud and scam operations.
* **Key Fields:** `id`, `title`, `description`, `scam_type` (`financial` \| `job` \| `digital` \| `real_estate` \| `other`), `district_slug`, `area_slug`, `warning_level`, `is_verified`, `confirm_count`, `latitude`, `longitude`, `status`, `is_anonymous`.

### 5. Situation Update (`situation_update`)
* **Purpose:** Real-time hyper-local updates on traffic, weather, or power conditions.
* **Key Fields:** `id`, `title`, `details`, `situation_type` (`traffic` \| `weather` \| `power` \| `water` \| `event` \| `other`), `district_slug`, `area_slug`, `confirm_count`, `status`.

### 6. Question & Answer (`question`, `answer`)
* **Purpose:** Hyper-local Q&A content.
* **Key Fields:**
  * **Question:** `id`, `title`, `content`, `district_slug`, `category_slug`, `is_anonymous`, `author_name`, `status`, `answer_count`, `view_count`.
  * **Answer:** `id`, `question_id`, `content`, `is_anonymous`, `author_name`, `helpful_count`, `is_accepted`, `status`.

### 7. Government Office Report (`office_report`)
* **Purpose:** Citizen evaluations of government office visits.
* **Key Fields:** `id`, `office_slug`, `office_name`, `district_slug`, `visit_date`, `waiting_time`, `service_speed`, `office_status`, `staff_behavior`, `cleanliness`, `notes`, `purpose_of_visit`, `is_anonymous`, `helpful_count`, `status`.

### 8. Citizen Awareness Resources (`awareness_*`)
* **Purpose:** Reference content for citizen rights, schemes, portals, FAQs, and guides.
* **Key Fields:** English/Tamil title & description fields, category references, bullet list JSON arrays, action button URLs, icon identifiers, sort order, and active flags across 7 specialized tables (`awareness_category`, `awareness_resource`, `awareness_scheme`, `awareness_portal`, `awareness_right`, `awareness_faq`, `awareness_guide`).

### 9. Job Alert (`job_alert`)
* **Purpose:** Local job postings and hiring notifications.
* **Key Fields:** `id`, `title`, `description`, `job_type`, `district_slug`, `area_slug`, `contact_info`, `salary_info`, `duration`, `status`, `expires_at`, `safety_status`, `moderation_status`, `slug`.

### 10. Stay Listing (`stay_listing`)
* **Purpose:** Directory entries for local rental rooms, PGs, and hostels.
* **Key Fields:** `id`, `title`, `description`, `stay_type`, `district_slug`, `area_slug`, `address`, `price_range`, `contact_info`, `amenities` (JSON), `status`.

### 11. User Profile (`profile`)
* **Purpose:** Registered user data linked to Supabase Auth.
* **Key Fields:** `id` (UUID references `auth.users`), `email`, `full_name`, `avatar_url`, `trust_score` (0–100), `approved_verifications_count`, `resolved_issues_count`, `spam_deletions_count`.

---

## 4. User Flows

### Flow 1: Submitting & Tracking a Civic Issue (End-to-End)
1. **Submission:** User navigates to `/create` or selects "Report Issue". User inputs title, English/Tamil description, district, area, category, location text, photos, and urgency level.
2. **Receipt Creation:** Upon saving to Supabase `post`, the application generates a unique `civic_receipt_id` (e.g. `TN-CH-ST-2026-0042`) and computes a Receipt Credibility Score based on photo presence, GPS coordinates, text completeness, and user trust score.
3. **Department Routing:** The Department Routing module maps the issue category to the responsible government department (e.g., TANGEDCO for streetlights, Municipal Corporation for garbage) and renders a formatted official complaint template alongside helpline numbers (1912, 1913, 14400) and official portal links.
4. **Community Verification:** Visitors to the issue page (`/post/[slug]`) can click "Confirm Issue Exists", incrementing the verification counter.
5. **Official Filing Update:** When a user manually files a complaint on an official government portal (e.g., CM Cell or ULB portal), they can return to Namma TN to submit their official complaint reference number and portal screenshot. The receipt status updates to `complaint_filed`.
6. **Resolution & Dispute:** Once repair work is claimed, citizens submit photos and vote ("Confirm Fixed" vs "Still Not Fixed"). The system updates the Fix Confidence score until marked `citizen_verified_fixed`.

### Flow 2: Reporting Corruption / Bribe Requests
1. User opens `/bribes` or selects "Report Bribe".
2. User provides department name, officer designation, location, bribe amount requested, bribe status (requested / paid / refused), and optional audio recording link.
3. Post is published to the public Bribe Dashboard and aggregated into district corruption metrics.

### Flow 3: News Consumption & Poster Generation (TN Today)
1. User browses news articles at `/tn-today` filtered by category.
2. On reading an article (`/tn-today/[slug]`), the user can generate and download a news poster image rendered on HTML Canvas (`tntodayPosterGenerator`) for social media sharing.

### UI-Present Flows That Are Not Fully Automated Backend Integrations
* **Government Portal Auto-Filing:** The application does **not** directly interface via API with government servers (such as TANGEDCO or GCC backend databases). It generates copyable complaint text for manual submission by citizens on official state portals.
* **Automated Payment Gateway Verification:** The payment workflows on `/support` and `/csr` display UPI QR codes and accept manual transaction reference numbers and screenshot uploads. Direct automated payment webhooks (e.g. Stripe/Razorpay) are not active.

---

## 5. Data & Verification Mechanics

### Moderation & Automated Content Safety
* **Regex Content Safety Engine (`contentSafety.js`):** Intercepts content submissions to detect abusive language, hate speech, scam/fraud keywords, telephone numbers, email addresses, external links, and political slurs. Hard-block keywords halt submission; soft-flagged content is routed with `is_pending_review = true` or `moderation_status = 'pending_review'`.
* **Flood Guard (`spamGuard.js`):** Enforces rate limiting per session (maximum 5 messages within a 30-second window; 60-second automatic mute on violation).
* **Row-Level Security (RLS):** Supabase database policies restrict public write access and enforce authenticated admin access for status updates and table modifications.
* **Admin Review Panel (`/admin/moderation`):** Admins review flagged reports, override content safety flags, hide comments, or delete posts.

### Credibility & Trust Score Algorithms (`computeReceiptCredibility.js`)
* **Base User Trust Score:** Each registered user starts with a trust score of 10 (`profile.trust_score`, scale 0–100).
* **Receipt Credibility Weighting (0–100%):** Calculated dynamically using four signals:
  * **35%** Community Verification Count (capped at 5 confirmations)
  * **25%** Evidence Quality (Photos: 25%, GPS: 25%, Detailed Description: 25%, Location Text: 25%)
  * **15%** Author Platform Trust Score
  * **25%** Official Complaint Proof (Complaint filing count + screenshot proof)
* **Fix Confidence Calculation:** Ratio of `citizen_fixed_count` to total resolution votes (`citizen_fixed_count` + `still_not_fixed_count`).

### Complaint-Resolution Tracking Reliability
* Complaint tracking is **strictly crowdsourced and citizen-verified**.
* Verification relies on community consensus, photo evidence, and manual submission of official government reference numbers rather than automated government database synchronization.

---

## 6. External Integrations & Technical Dependencies

* **Database & Authentication:** Supabase (`@supabase/supabase-js`) providing Postgres DB, Auth (Email/Password, Google OAuth), and Storage (`media` bucket for image uploads).
* **Maps & Geolocation:** `react-leaflet` and OpenStreetMap for interactive map controls and geographic coordinate plotting.
* **Client Graphics & PDF Rendering:** `html2canvas`, `jspdf`, and `canvas-confetti` for generating downloadable Civic Receipts, certificates, and news poster images.
* **Analytics:** Microsoft Clarity analytics snippet (`clarityScript.js`) embedded via project ID (`NEXT_PUBLIC_CLARITY_PROJECT_ID`).
* **SEO & Instant Indexing:** Custom sitemap generator and search engine notification utility (`notifySearchEngines`) for automated URL pings.
* **Payment Packages:** `@stripe/stripe-js` and `@stripe/react-stripe-js` are present in `package.json`, but current active user payment flows utilize manual UPI transaction reference submission and screenshot uploads.

---

## 7. What's NOT Built / Mocked / Planned Features

1. **Direct Government API Synchronization:** Complaints are not automatically submitted into Tamil Nadu state government backend databases via official API endpoints.
2. **Live WebRTC Audio Streaming:** While the `live_room` table schema exists in the database, real-time WebRTC audio streaming is not built; rooms operate as real-time text chat feeds.
3. **Automated Payment Gateway Webhooks:** Stripe/Razorpay automated card processing and instant webhook verification are not active; payment submissions require manual admin review.
4. **External LLM AI Auto-Moderation:** The `content_analysis` schema supports toxicity and trust scores, but runtime checking relies on local regex rules (`contentSafety.js`) rather than external LLM API endpoints.
5. **Empty / Minimal Data Modules:** The following database tables currently contain 0 records:
   * Local Business Listings (`local_listing`)
   * Community Discussions (`community_discussion`)
   * Corporate CSR Campaigns (`civic_sponsor`)
   * Direct Site Comments (`comment`)
   * Banner Advertisements (`ad`)
   * Payment Submissions (`payment_submission`)

---

## 8. Traffic & Usage (Factually Tracked Numbers)

* **Verification Source:** Live database query executed on active Supabase instance (`NEXT_PUBLIC_VITE_SUPABASE_URL`).
* **Monthly Visits / Web Traffic Analytics:** Not tracked via backend database logs (frontend Microsoft Clarity script attached).

### Exact Live Database Row Counts

| Content Entity / Table | Active Record Count in Database |
| :--- | :--- |
| **Registered User Profiles (`profile`)** | **10** |
| **Civic Posts & Issue Reports (`post`)** | **166** |
| **TN Today News Articles (`tn_today`)** | **71** |
| **Emergency Posts (`emergency_post`)** | **5** |
| **Scam Alerts (`scam_alert`)** | **5** |
| **Situation Updates (`situation_update`)** | **10** |
| **Questions & Answers (`question` / `answer`)** | **6 Questions / 6 Answers** |
| **Local Job Alerts (`job_alert`)** | **5** |
| **Stay Listings (`stay_listing`)** | **5** |
| **Government Office Reports (`office_report`)** | **5** |
| **Active RWA Groups (`rwa_group`)** | **1** |
| **Local Business Listings (`local_listing`)** | **0** |
| **Community Discussions (`community_discussion`)** | **0** |
| **Submitted Comments (`comment`)** | **0** |
| **Official Complaint Trackers (`complaint_tracker`)** | **0** |
| **Submitted Payment Records (`payment_submission`)** | **0** |
| **Banner Advertisements (`ad`)** | **0** |
