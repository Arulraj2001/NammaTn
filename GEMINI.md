# VizhiTN — Project Rules & Autonomous Editorial Constitution

> **Project Identity:** VizhiTN (`vizhitn.in`) is Tamil Nadu's civic proof, citizen reporting, and hyperlocal news platform covering all 38 districts in English and Tamil.
> **Core Mission:** Document civic issues, provide verified emergency/utility alerts (power, water, traffic, rain), file and track official complaints, and surface daily community dispatches.

---

## 1. Technical Architecture & Database Schema Standards

### Core Content Tables
1. **`post` (Civic Reports & Utility Alerts):**
   - Public feed and Explore page: Queried by `getActivePosts()` with filter `status = 'active'`.
   - **CRITICAL RULE:** For all imported or generated civic posts, `"status"` MUST ALWAYS be `"active"`. Never use `"published"` (which is reserved for `tn_today`), or the post will be filtered out and hidden from the public feed.
2. **`tn_today` (Editorial News Articles):**
   - In-depth state development, governance, infrastructure, and policy articles. Uses `status = 'published'`.

---

## 2. Category Slugs & Post Types Taxonomy

### Allowed `category_slug` (Strictly 12 Slugs from `src/lib/categories.js`):
1. `road-infrastructure` (Roads, flyovers, potholes, bridges, footpaths)
2. `water-sanitation` (Drinking water, Metrowater, TWAD, pipelines, drainage, sewage)
3. `electricity` (TANGEDCO power cuts, transformer repairs, live wires, Minnalagam)
4. `transport` (CMRL Metro, MTC/SETC buses, Southern Railway, traffic diversions)
5. `government-schemes` (Smart Ration Cards, e-Sevai, Aadhaar camps, Kalaignar Magalir Urimai)
6. `public-safety` (Cyber scams, law & order, fake SMS, police advisories, fire safety)
7. `healthcare` (PHCs, government hospitals, blood donation camps, epidemics)
8. `education` (School/college holidays, exam venues, scholarships, admissions)
9. `agriculture` (Procurement centers, canal water release, farmer subsidies, crop insurance)
10. `environment` (Lake restoration, tree plantation, pollution alerts, canal desilting)
11. `local-development` (Ward council works, parks, local infrastructure upgrades)
12. `general` (General civic notices and community announcements)

### Allowed `post_type`:
* `alert` (Time-sensitive warnings: power cuts, road closures, rain warnings)
* `local_update` (Civic updates: Aadhaar camps, metro progress, local drives)
* `complaint` (Citizen grievance patterns: potholes, garbage, water leaks)
* `appreciation` (Commendation of sanitary workers, police, or civic bodies)
* `discussion` (Community discussions on local civic decisions)
* `bribe` (Reports on bribe demands or department corruption)

### Allowed `urgency_level`:
`low` | `medium` | `high` | `critical`

### Allowed `civic_status`:
`reported` | `community_verified` | `complaint_needed` | `complaint_filed` | `under_followup` | `claimed_fixed` | `citizen_verified_fixed`

---

## 3. Verified Government Helplines Whitelist

Every post that mentions a civic emergency or service must reference its official, working helpline number:
* **TANGEDCO Electricity (Power Cuts & Wire Snaps):** `1912` (Minnalagam 24x7) / `94987 94987`
* **Greater Chennai Corporation (GCC Flood & Municipal Control):** `1913`
* **Metrowater (Chennai Drinking Water & Sewerage - CMWSSB):** `044-45674567`
* **Coimbatore Municipal Corporation Control Room:** `0422-2302323`
* **Civil Supplies & Smart Ration Cards (TNSCS):** `1967`
* **National Cyber Crime Helpline (Fake SMS / Financial Scams):** `1930`
* **Tamil Nadu Chief Minister Helpline:** `1100`
* **Tamil Nadu State Disaster Management Authority (TNDMA):** `1070`
* **District Disaster Management Control:** `1077`
* **Southern Railway Passenger Enquiry & Complaints:** `139`
* **Traffic Control Helpline:** `103`

---

## 4. Production JSON Import Schema (`/admin/import-posts`)

When generating posts for bulk import, output a clean JSON array matching this exact field structure:

```json
{
  "district_slug": "chennai",
  "area_name": "Tambaram",
  "category_slug": "electricity",
  "post_type": "alert",
  "title_en": "Tambaram Power Cut Today (Sep 16): 9 AM to 2 PM for Substation Maintenance",
  "title_ta": "தாம்பரம் பகுதியில் இன்று (செப் 16) மின்தடை: காலை 9 முதல் மதியம் 2 வரை மின்சாரம் நிறுத்தம்",
  "content_en": "TANGEDCO has scheduled power shutdown today from 9:00 AM to 2:00 PM across Kamarajar High Road, Balaji Nagar, New Perungalathur, and Madambakkam for maintenance. Contact Minnalagam at 1912 for power failure assistance.",
  "content_ta": "மின்வாரிய பராமரிப்பு பணி காரணமாக இன்று காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை தாம்பரம், காமராஜர் நெடுஞ்சாலை மற்றும் மாடம்பாக்கம் பகுதிகளில் மின்சாரம் நிறுத்தப்படும். மின்தடை புகார்களுக்கு 1912 உதவி எண்ணை அழைக்கலாம்.",
  "assigned_department": "TANGEDCO (Helpline: 1912)",
  "location_text": "Kamarajar High Road, Perungalathur & Madambakkam",
  "source": "TANGEDCO South Circle Notification",
  "urgency_level": "medium",
  "civic_status": "community_verified",
  "slug": "tambaram-power-cut-chennai-16-sep-2026",
  "seo_title": "Tambaram Power Cut Today Sep 16 | TANGEDCO Timing & Streets",
  "seo_description": "TANGEDCO scheduled power cut in Tambaram and Perungalathur on Sep 16 from 9 AM to 2 PM. Affected streets and helpline details.",
  "seo_keywords": "tambaram power cut today, tangedco chennai, eb shutdown timings",
  "status": "active",
  "is_indexable": true
}
```

---

## 5. Master Editorial Prompts & Daily Triggers

### PROMPT 1: Daily Morning Civic Batch (Monday to Friday, 7:00 AM – 8:15 AM IST)
* **Goal:** 12 fresh posts (5 alert, 4 local_update, 2 complaint, 1 appreciation).
* **Category Mix:** 3 Electricity, 2 Water, 2 Transport, 2 Schemes, 1 Public Safety, 1 Road, 1 Environment.
* **District Rotation:**
  * **Monday:** Chennai, Coimbatore, Madurai, Tiruvallur, Chengalpattu, Kancheepuram, Ranipet
  * **Tuesday:** Tiruchirappalli, Salem, Vellore, Namakkal, Perambalur, Ariyalur, Kallakurichi
  * **Wednesday:** Erode, Tirunelveli, Thoothukudi, Karur, Nilgiris, Coimbatore, Tiruppur
  * **Thursday:** Thanjavur, Dindigul, Kancheepuram, Nagapattinam, Mayiladuthurai, Tiruvarur, Pudukkottai
  * **Friday:** Namakkal, Dharmapuri, Cuddalore, Krishnagiri, Villupuram, Kallakurichi, Salem

### PROMPT 2: Weekend & Line Block Batch (Friday, 5:30 PM – 6:45 PM IST)
* **Goal:** 12 weekend posts (6 alert, 4 local_update, 1 complaint, 1 appreciation).
* **Coverage:** Southern Railway suburban train cancellations (Beach–Tambaram, Central–Arakkonam), SETC special weekend buses, Saturday Taluk Office Ration/Aadhaar grievance camps, and Patta transfer settlement drives.

### PROMPT 3: Heavy Rain & Emergency Batch (On Rain Days, 6:00 AM – 7:15 AM IST)
* **Goal:** 12 emergency alerts (all `post_type: "alert"`, `urgency_level: "high"` or `"critical"`).
* **Coverage:** IMD rainfall alerts (Red/Orange/Yellow), official School/College holiday announcements from District Collectors, closed flooded subways, TANGEDCO waterlogged pillar safety, and Corporation pumping stations. Helplines: `1913`, `1070`, `1077`, `1912`.

### PROMPT 4: Evening Advisory & Advance Batch (Monday to Thursday, 5:30 PM – 6:30 PM IST)
* **Goal:** 12 posts covering evening traffic diversions, advance notices for tomorrow's TANGEDCO power cuts, municipal waste clearance, and daily cyber scam warnings (`1930`).

---

## 6. Strict Verification & Integrity Rules
1. **Zero Hallucination:** Only real, scheduled departmental actions with named official sources.
2. **Exact Hours Required:** Always write exact times (e.g. `9:00 AM to 2:00 PM`). Never use vague terms like `sometime today`.
3. **No Stock Photo Placeholders:** Do not include external stock photos. The system renders authentic, high-contrast civic badge cards with verified departmental helpline buttons automatically.
4. **Instant Revalidation:** Whenever posts are imported, `/api/revalidate` purges the Next.js server cache within 2 seconds for `/explore`, `/`, and `/sitemap-news.xml`.
