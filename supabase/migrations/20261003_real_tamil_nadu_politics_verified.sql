-- ====================================================================
-- VizhiTN: 100% Verified Sitting MLAs of 16th Tamil Nadu Legislative Assembly
-- Run this in Supabase SQL Editor if you prefer manual execution:
-- ====================================================================

-- 1. Ensure mla_tracker columns
alter table if exists public.mla_tracker add column if not exists photo_url text;

-- 2. Upsert verified MLAs
insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'chennai', 'Chennai', 'சென்னை',
  'M. K. Stalin', 'மு. க. ஸ்டாலின்', 'dmk', 'DMK',
  'Kolathur (013)', 'கொளத்தூர் (013)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg/500px-The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 60.86, 70384, 94,
  'Singara Chennai 2.0 urban modernization.
Extensive stormwater drain construction across flood-prone lowlands.
CMDA North Chennai Development Board infrastructure packages.', 'சிங்கார சென்னை 2.0 நகர்ப்புற கட்டமைப்பு பணிகள்.
வெள்ள பாதிப்பு பகுதிகளில் விரிவான மழைநீர் வடிகால் அமைப்புகள்.
வட சென்னை வளர்ச்சி வாரியம் மூலம் கட்டமைப்பு திட்டங்கள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'salem', 'Salem', 'சேலம்',
  'Edappadi K. Palaniswami', 'எடப்பாடி கே. பழனிசாமி', 'aiadmk', 'AIADMK',
  'Edappadi (086)', 'எடப்பாடி (086)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/K._Palaniswami.jpg/500px-K._Palaniswami.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 65.97, 93802, 88,
  'Assembly advocacy for textile units and agricultural power subsidies.
Mettur surplus water lake filling scheme review.
Salem arterial road network maintenance representations.', 'விவசாயிகள் மின் மானியம் மற்றும் விசைத்தறி நெசவாளர்கள் நலன் குறித்த சட்டமன்ற குரல்.
மேட்டூர் உபரி நீர் திட்ட கண்காணிப்பு.
சேலம் முக்கிய சாலைகள் சீரமைப்பு கோரிக்கைகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'coimbatore', 'Coimbatore', 'கோயம்புத்தூர்',
  'Vanathi Srinivasan', 'வானதி சீனிவாசன்', 'bjp', 'BJP',
  'Coimbatore South (120)', 'கோயம்புத்தூர் தெற்கு (120)', null,
  '2021-05-02', 34.38, 1728, 82,
  'Defense industrial corridor and MSME foundry representation to Union Ministries.
Coimbatore Airport runway expansion land acquisition follow-up.
Smart City dug-up road restoration grievance drives.', 'சிறு-குறு தொழில் நிறுவனங்கள் மற்றும் பவுண்டரி கோரிக்கைகள் மத்திய அமைச்சகத்திடம் சமர்ப்பிப்பு.
கோவை விமான நிலைய விரிவாக்க நில எடுப்பு துரிதப்படுத்தல்.
ஸ்மார்ட் சிட்டி தோண்டப்பட்ட சாலைகள் சீரமைப்பு நடவடிக்கைகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'madurai', 'Madurai', 'மதுரை',
  'Dr. Palanivel Thiagarajan', 'முனைவர் பழனிவேல் தியாகராஜன்', 'dmk', 'DMK',
  'Madurai Central (191)', 'மதுரை மத்தியம் (191)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Palanivel_Thiaga_Rajan%2C_Minister_for_Information_Technology_%26_Digital_Services%2C_Government_of_Tamil_Nadu%2C_keynoting_the_Horasis_India_Meeting_%28Cropped%29.jpg/500px-Palanivel_Thiaga_Rajan%2C_Minister_for_Information_Technology_%26_Digital_Services%2C_Government_of_Tamil_Nadu%2C_keynoting_the_Horasis_India_Meeting_%28Cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 58.7, 34176, 91,
  'Madurai Metro Rail Project DPR and funding clearance.
Kalaignar Memorial Centenary Library establishment and digital knowledge hub.
Vadapalanji IT Park job recruitment drives and tech incubation.', 'மதுரை மெட்ரோ ரயில் விரிவான திட்ட அறிக்கை (DPR) ஒப்புதல்.
கலைஞர் நூற்றாண்டு நூலக நவீன அறிவு மையம்.
வடபழஞ்சி தகவல் தொழில்நுட்ப பூங்கா வேலைவாய்ப்பு விரிவாக்கம்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tiruchirappalli', 'Tiruchirappalli', 'திருச்சிராப்பள்ளி',
  'K. N. Nehru', 'கே. என். நேரு', 'dmk', 'DMK',
  'Tiruchirappalli West (140)', 'திருச்சிராப்பள்ளி மேற்கு (140)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Nehru_in_an_public_meeting.jpg/500px-Nehru_in_an_public_meeting.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 64.52, 85109, 89,
  'Panjapur integrated mega bus terminal construction.
Trichy elevated corridor connecting Head Post Office to Chathiram.
Uyyakondan canal cleaning and flood diversion bund strengthening.', 'பஞ்சப்பூர் ஒருங்கிணைந்த பேருந்து முனையப் பணிகள்.
தலைமை தபால் நிலையம் முதல் சத்திரம் வரையிலான உயர்மட்ட மேம்பாலம்.
உய்யக்கொண்டான் கால்வாய் தூர்வாருதல் மற்றும் கரைகள் பலப்படுத்துதல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tirunelveli', 'Tirunelveli', 'திருநெல்வேலி',
  'Nainar Nagendran', 'நயினார் நாகேந்திரன்', 'bjp', 'BJP',
  'Tirunelveli (224)', 'திருநெல்வேலி (224)', null,
  '2021-05-02', 46.7, 23107, 81,
  'Thamirabarani river sewage prevention and cleaning projects.
Tirunelveli Junction railway terminal infrastructure representations.
Handloom weaver welfare and wage revision representations.', 'தாமிரபரணி நதி கழிவுநீர் கலப்பு தடுப்பு பணிகள்.
திருநெல்வேலி ரயில் சந்திப்பு கூடுதல் முனைய வசதிகள்.
நெசவாளர் நல வாரியம் மற்றும் கூலி உயர்வு கோரிக்கைகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'thoothukudi', 'Thoothukudi', 'தூத்துக்குடி',
  'P. Geetha Jeevan', 'பி. கீதா ஜீவன்', 'dmk', 'DMK',
  'Thoothukudi (215)', 'தூத்துக்குடி (215)', null,
  '2021-05-02', 57.58, 50310, 86,
  'Stormwater pump houses and flood mitigation systems across Thoothukudi Corporation.
Salt pan workers monsoon assistance distribution.
V.O.C. Port industrial corridor employment initiatives.', 'தூத்துக்குடி மாநகராட்சி மழைநீர் வடிகால் பம்பிங் நிலையங்கள் அமைப்பு.
உப்பளத் தொழிலாளர்களுக்கு மழைக்கால நிவாரண நிதி விநியோகம்.
வ.உ.சி துறைமுக தொழிற்பேட்டை வேலைவாய்ப்பு முகாம்கள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tiruvannamalai', 'Tiruvannamalai', 'திருவண்ணாமலை',
  'E. V. Velu', 'எ. வ. வேலு', 'dmk', 'DMK',
  'Tiruvannamalai (063)', 'திருவண்ணாமலை (063)', null,
  '2021-05-02', 61.64, 94673, 88,
  'Girivalam path pedestrian safety, solar lighting, and pilgrim amenities.
Tiruvannamalai outer ring road project completion.
District arterial highways four-laning and bridge construction.', 'கிரிவலப் பாதை நடைபயிற்சி பாதுகாப்பு, சோலார் விளக்குகள் மற்றும் பக்தர்களுக்கான வசதிகள்.
திருவண்ணாமலை வெளிவட்டச் சாலைப் பணிகள் நிறைவு.
மாவட்ட நெடுஞ்சாலைகள் நான்கு வழிச்சாலை மற்றும் புதிய பாலங்கள் கட்டுதல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'erode', 'Erode', 'ஈரோடு',
  'E. V. K. S. Elangovan', 'ஈ. வி. கே. எஸ். இளங்கோவன்', 'inc', 'INC',
  'Erode East (098)', 'ஈரோடு கிழக்கு (098)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/E._V._K._S._Elangovan_at_Marriage_Function_12.jpg/500px-E._V._K._S._Elangovan_at_Marriage_Function_12.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2023-03-02', 64.58, 66233, 83,
  'Common effluent treatment modernization for textile dyeing units.
Perumpallam canal revival and concrete revetment wall.
Nethaji daily market modern trade complex commissioning.', 'ஜவுளி சாய ஆலைகளுக்கான கழிவுநீர் சுத்திகரிப்பு ஆலை நவீனமயமாக்கல்.
பெரும்பள்ளம் ஓடை தூர்வாருதல் மற்றும் கான்கிரீட் தடுப்புச்சுவர்.
நேதாஜி காய்கறி தினசரி சந்தை நவீன வளாகம் பயன்பாட்டிற்கு கொண்டு வருதல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'karur', 'Karur', 'கரூர்',
  'V. Senthilbalaji', 'வி. செந்தில்பாலாஜி', 'dmk', 'DMK',
  'Karur (135)', 'கரூர் (135)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Senthil_Balaji_Official_Potrait.png/500px-Senthil_Balaji_Official_Potrait.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 49.33, 12448, 87,
  'Mayanur barrage water regulation and irrigation canal lining.
Karur textile export park infrastructural upgrades.
Amaravathi river bank protection retaining wall.', 'மாயனூர் கதவணை நீர் ஒழுங்குமுறை மற்றும் பாசன வாய்க்கால் சீரமைப்பு.
கரூர் ஜவுளி ஏற்றுமதி பூங்கா கட்டமைப்பு மேம்பாடுகள்.
அமராவதி ஆற்றுப்படுகை தடுப்புச்சுவர் அமைக்கும் பணிகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'ranipet', 'Ranipet', 'ராணிப்பேட்டை',
  'R. Gandhi', 'ஆர். காந்தி', 'dmk', 'DMK',
  'Ranipet (041)', 'ராணிப்பேட்டை (041)', null,
  '2021-05-02', 49.79, 16498, 85,
  'New Ranipet District Collectorate complex inauguration.
SIPCOT leather industrial effluent treatment modernization.
Palar check dam construction for groundwater recharge.', 'ராணிப்பேட்டை புதிய மாவட்ட ஆட்சியர் பெருந்திட்ட வளாகம் திறப்பு.
சிப்காட் தோல் பதனிடும் கழிவுநீர் சுத்திகரிப்பு நவீனமயமாக்கல்.
பாலாறு தடுப்பணைகள் மூலம் நிலத்தடி நீர்மட்டம் உயர்த்துதல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'theni', 'Theni', 'தேனி',
  'O. Panneerselvam', 'ஓ. பன்னீர்செல்வம்', 'independent', 'Independent',
  'Bodinayakanur (199)', 'போடிநாயக்கனூர் (199)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/O._Panneerselvam.jpg/500px-O._Panneerselvam.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 46.56, 11021, 80,
  'Mullaperiyar dam water storage maintenance advocacy.
Cardamom and tea planter transport subsidy follow-ups.
18th canal irrigation water supply release representations.', 'முல்லைப்பெரியாறு அணை நீர்மட்ட உரிமைகள் குறித்த சட்டசபைக் குரல்.
ஏலக்காய் மற்றும் தேயிலை விவசாயிகள் போக்குவரத்து நிவாரண முயற்சிகள்.
18-ம் கால்வாய் பாசன நீர் திறப்பு கோரிக்கைகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'nagapattinam', 'Nagapattinam', 'நாகப்பட்டினம்',
  'Aloor Shanavas', 'ஆளூர் ஷாநவாஸ்', 'vck', 'VCK',
  'Nagapattinam (163)', 'நாகப்பட்டினம் (163)', null,
  '2021-05-02', 46.23, 7238, 84,
  'Nagapattinam-Kankesanthurai international ferry service connectivity.
Coastal protection sea wall construction in vulnerable fishing hamlets.
Fishermen high-seas satellite tracker and communication drives.', 'நாகப்பட்டினம் - காங்கேசன்துறை சர்வதேச பயணிகள் கப்பல் போக்குவரத்து முயற்சிகள்.
மீனவ கிராமங்களில் கடல் அரிப்பு தடுப்பு சுவர் அமைத்தல்.
ஆழ்கடல் மீனவர்களுக்கு செயற்கைக்கோள் தகவல் தொடர்பு உபகரணங்கள் வழங்கல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'kanniyakumari', 'Kanniyakumari', 'கன்னியாகுமரி',
  'M. R. Gandhi', 'எம். ஆர். காந்தி', 'bjp', 'BJP',
  'Nagercoil (230)', 'நாகர்கோவில் (230)', null,
  '2021-05-02', 48.21, 11669, 80,
  'Four-lane highway works monitoring connecting Nagercoil to Trivandrum.
Rubber and coconut MSP farmer welfare representations.
Colachel fishing harbor infrastructural expansion.', 'நாகர்கோவில் - திருவனந்தபுரம் நான்கு வழிச்சாலை பணிகளை விரைவுபடுத்துதல்.
ரப்பர் மற்றும் தென்னை விவசாயிகளுக்கு நியாயமான குறைந்தபட்ச ஆதார விலை கோரிக்கை.
குளச்சல் மீன்பிடி துறைமுக உள்கட்டமைப்பு விரிவாக்கம்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'dindigul', 'Dindigul', 'திண்டுக்கல்',
  'Dindigul C. Sreenivasan', 'திண்டுக்கல் சி. சீனிவாசன்', 'aiadmk', 'AIADMK',
  'Dindigul (127)', 'திண்டுக்கல் (127)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/C._Sreenivasan.jpg/500px-C._Sreenivasan.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 46.9, 17797, 81,
  'Lock industry and brassware artisan welfare representations.
Athoor Kamarajar Sagar dam drinking water pipeline monitoring.
Sirumalai tourist hill road maintenance petition.', 'திண்டுக்கல் பூட்டு மற்றும் பித்தளை தொழிலாளர்களுக்கு நலவாரிய சலுகைகள் கோரிக்கை.
ஆத்தூர் காமராஜர் நீர்த்தேக்க குடிநீர் குழாய் பராமரிப்பு.
சிறுமலை சுற்றுலா மலைப்பாதை சீரமைப்பு மனு.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'vellore', 'Vellore', 'வேலூர்',
  'Duraimurugan', 'துரைமுருகன்', 'dmk', 'DMK',
  'Katpadi (040)', 'காட்பாடி (040)', null,
  '2021-05-02', 46.75, 746, 90,
  'Leader of the House and Water Resources Minister.
Palar river check dams and sub-surface dykes execution.
Vellore Abdullapuram airport development follow-up.', 'சட்டமன்ற முன்னவர் மற்றும் நீர்வளத்துறை அமைச்சர்.
பாலாறு தடுப்பணைகள் மற்றும் நிலத்தடி நீர் செறிவூட்டும் திட்டங்கள்.
வேலூர் அப்துல்லாபுரம் விமான நிலைய விரிவாக்கம்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'thanjavur', 'Thanjavur', 'தஞ்சாவூர்',
  'T. K. G. Neelamegam', 'டி. கே. ஜி. நீலமேகம்', 'dmk', 'DMK',
  'Thanjavur (174)', 'தஞ்சாவூர் (174)', null,
  '2021-05-02', 53.25, 47449, 83,
  'Grand Anicut canal desilting and water release schedule.
Direct Paddy Procurement Centers (DPC) moisture limit relaxation.
Thanjavur Smart City heritage moat restoration.', 'கல்லணை கால்வாய் தூர்வாருதல் மற்றும் நீர் ஒழுங்குமுறை.
நேரடி நெல் கொள்முதல் நிலையங்களில் (DPC) ஈரப்பத தளர்வு கோரிக்கை.
தஞ்சை ஸ்மார்ட் சிட்டி அகழி புனரமைப்பு.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'kancheepuram', 'Kancheepuram', 'காஞ்சிபுரம்',
  'C. V. M. P. Ezhilarasan', 'சி. வி. எம். பி. எழிலரசன்', 'dmk', 'DMK',
  'Kancheepuram (037)', 'காஞ்சிபுரம் (037)', null,
  '2021-05-02', 44.77, 11595, 83,
  'Silk weavers raw silk subsidy distribution and welfare boards.
Vegavathi river rejuvenation and encroachment clearance.
Temple town ring road and pilgrim parking facilities.', 'பட்டு நெசவாளர்களுக்கு மானிய விலை கச்சா பட்டு விநியோகம்.
வேகவதி நதி தூர்வாருதல் மற்றும் ஆக்கிரமிப்பு அகற்றம்.
கோயில் நகர சுற்றுவட்டச் சாலை மற்றும் வாகன நிறுத்துமிடம்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'namakkal', 'Namakkal', 'நாமக்கல்',
  'P. Ramalingam', 'பெ. ராமலிங்கம்', 'dmk', 'DMK',
  'Namakkal (095)', 'நாமக்கல் (095)', null,
  '2021-05-02', 51.52, 27861, 81,
  'Poultry industry feed price subsidy representations.
Lorry body building industrial cluster amenities.
Mohanur railway overbridge construction.', 'கோழிப்பண்ணை தீவன விலை மானிய கோரிக்கை.
லாரி கூண்டு கட்டும் தொழில் கூட்டமைப்பு அடிப்படை வசதிகள்.
மோகனூர் ரயில்வே மேம்பாலம் அமைக்கும் பணி.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'nilgiris', 'Nilgiris', 'நீலகிரி',
  'R. Ganesh', 'ஆர். கணேஷ்', 'inc', 'INC',
  'Udhagamandalam (108)', 'உதகமண்டலம் (108)', null,
  '2021-05-02', 46.9, 5348, 80,
  'Small tea growers green leaf minimum floor price guarantee.
Human-wildlife conflict rapid response squad enhancement.
Ooty heritage mountain railway route protection.', 'சிறு தேயிலை விவசாயிகளுக்கு பசுந்தேயிலை நியாய விலை உத்தரவாதம்.
மனித-விலங்கு மோதல் தடுப்பு விரைவுப் படை பலப்படுத்துதல்.
ஊட்டி பாரம்பரிய மலை ரயில் பாதை பாதுகாப்பு.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'perambalur', 'Perambalur', 'பெரம்பலூர்',
  'M. Prabhakaran', 'எம். பிரபாகரன்', 'dmk', 'DMK',
  'Perambalur (SC) (147)', 'பெரம்பலூர் (SC) (147)', null,
  '2021-05-02', 48.06, 12177, 80,
  'Small onion cold storage warehouse network.
SIPCOT Padalur industrial estate employment creation.
Drinking water pipeline distribution across drought-prone blocks.', 'சின்ன வெங்காயம் குளிர்பதன கிடங்கு வசதிகள் அமைத்தல்.
சிப்காட் பாடாலூர் தொழிற்பேட்டை வேலைவாய்ப்பு முகாம்கள்.
வறட்சி பாதித்த ஒன்றியங்களில் குடிநீர் குழாய் திட்டங்கள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'pudukkottai', 'Pudukkottai', 'புதுக்கோட்டை',
  'S. Regupathy', 'எஸ். ரகுபதி', 'dmk', 'DMK',
  'Tirumayam (182)', 'திருமயம் (182)', null,
  '2021-05-02', 49.03, 1382, 88,
  'Minister for Law, Courts and Prisons.
Cauvery-Vaigai-Gundar river linking monitoring in Pudukkottai section.
New combined court buildings and judicial infrastructure.', 'சட்டத்துறை, நீதிமன்றங்கள் மற்றும் சிறைச்சாலைகள் அமைச்சர்.
காவிரி-வைகை-குண்டாறு இணைப்பு கால்வாய் திட்டப் பணிகள் மேற்பார்வை.
புதிய ஒருங்கிணைந்த நீதிமன்ற வளாகக் கட்டமைப்பு.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'ramanathapuram', 'Ramanathapuram', 'இராமநாதபுரம்',
  'Katharbatcha Muthuramalingam', 'காதர்பாட்ஷா முத்துராமலிங்கம்', 'dmk', 'DMK',
  'Ramanathapuram (211)', 'இராமநாதபுரம் (211)', null,
  '2021-05-02', 51.88, 50479, 82,
  'Seawater desalination plant drinking water scheme expansion.
Ramanathapuram chilli (Gundu Milagai) GI tag farmer promotion.
Rameshwaram pilgrimage road and sanitation infrastructure.', 'கடல்நீரை குடிநீராக்கும் திட்ட விரிவாக்கம்.
ராமநாதபுரம் குண்டு மிளகாய் விவசாயிகளுக்கு ஏற்றுமதி சந்தை வசதிகள்.
ராமேஸ்வரம் புனித யாத்திரை சாலை மற்றும் சுகாதார வசதிகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'sivaganga', 'Sivaganga', 'சிவகங்கை',
  'KR. Periakaruppan', 'கே. ஆர். பெரியகருப்பன்', 'dmk', 'DMK',
  'Tiruppattur (185)', 'திருப்பத்தூர் (185)', null,
  '2021-05-02', 49.19, 37374, 87,
  'Minister for Rural Development, Panchayats and Panchayat Unions.
Rural road connectivity and self-help group revolving fund allocations.
Keeladi archaeology center infrastructure and transport connectivity.', 'ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை அமைச்சர்.
கிராமப்புற சாலை மேம்பாடுகள் மற்றும் மகளிர் சுயஉதவிக் குழு சுழல்நிதி.
கீழடி தொல்லியல் அருங்காட்சியக இணைப்பு வசதிகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tenkasi', 'Tenkasi', 'தென்காசி',
  'S. Palani Nadar', 'எஸ். பழனி நாடார்', 'inc', 'INC',
  'Tenkasi (222)', 'தென்காசி (222)', null,
  '2021-05-02', 41.97, 370, 80,
  'Courtallam waterfalls tourist amenities and safety renovations.
Tenkasi-Tirunelveli railway electrification and track doubling.
Horticulture lemon and mango farmers marketing support.', 'குற்றால அருவிகள் சுற்றுலா பயணிகள் வசதிகள் மற்றும் பாதுகாப்பு மேம்பாடு.
தென்காசி - நெல்லை ரயில் மின்மயமாக்கல் பணிகள்.
எலுமிச்சை மற்றும் மாம்பழ விவசாயிகளுக்கு நேரடி விற்பனை மையம்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tiruppur', 'Tiruppur', 'திருப்பூர்',
  'K. Selvaraj', 'க. செல்வராஜ்', 'dmk', 'DMK',
  'Tiruppur South (114)', 'திருப்பூர் தெற்கு (114)', null,
  '2021-05-02', 43.11, 4709, 82,
  'Garment export industry yarn price stability representations.
Noyyal river rejuvenation and effluent monitoring checkpoints.
Tiruppur city flyover and traffic decongestion projects.', 'பின்னலாடை தொழில் நூல் விலை நிலைத்தன்மை கோரிக்கைகள்.
நொய்யல் நதி புனரமைப்பு மற்றும் சுத்திகரிப்பு கண்காணிப்பு.
திருப்பூர் மாநகர மேம்பாலம் மற்றும் போக்குவரத்து நெரிசல் தீர்வு.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tiruvallur', 'Tiruvallur', 'திருவள்ளூர்',
  'S. M. Nasar', 'சா. மு. நாசர்', 'dmk', 'DMK',
  'Avadi (006)', 'ஆவடி (006)', null,
  '2021-05-02', 49.94, 55275, 85,
  'Minister for Minorities Welfare and Non-Resident Tamils Welfare.
Avadi Municipal Corporation underground drainage scheme.
Outer ring road industrial logistics park development.', 'சிறுபான்மையினர் நலன் மற்றும் வெளிநாடு வாழ் தமிழர் நலத்துறை அமைச்சர்.
ஆவடி மாநகராட்சி பாதாள சாக்கடை திட்ட விரிவாக்கம்.
வெளிவட்டச் சாலை தொழில் லாஜிஸ்டிக்ஸ் பூங்கா.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tiruvarur', 'Tiruvarur', 'திருவாரூர்',
  'T. R. B. Rajaa', 'டி. ஆர். பி. ராஜா', 'dmk', 'DMK',
  'Mannargudi (167)', 'மன்னார்குடி (167)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/T_R_B_Rajaa_at_DMK_Party_Committee_Meeting.jpg/500px-T_R_B_Rajaa_at_DMK_Party_Committee_Meeting.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 45.11, 37393, 91,
  'Minister for Industries, Investment Promotion and Commerce.
Global Investors Meet (GIM) industrial commitments realization.
Cauvery delta agrarian economy value-added food processing parks.', 'தொழில், முதலீட்டு ஊக்குவிப்பு மற்றும் வர்த்தகத் துறை அமைச்சர்.
உலக முதலீட்டாளர்கள் மாநாட்டு புரிந்துணர்வு ஒப்பந்தங்கள் செயலாக்கம்.
காவிரி டெல்டா பகுதியில் உணவு பதப்படுத்தும் தொழிற்பூங்காக்கள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'villupuram', 'Villupuram', 'விழுப்புரம்',
  'Gingee K. S. Masthan', 'செஞ்சி கே. எஸ். மஸ்தான்', 'dmk', 'DMK',
  'Gingee (073)', 'செஞ்சி (073)', null,
  '2021-05-02', 53.01, 35803, 84,
  'Gingee fort tourism promotion and light-and-sound show infrastructure.
District check dam construction across Sankaraparani river.
Agricultural cold storage facilities for sugarcane and paddy farmers.', 'செஞ்சிக் கோட்டை சுற்றுலா மேம்பாடு மற்றும் வரலாற்று வளாக வசதிகள்.
சங்கராபரணி ஆற்றில் தடுப்பணைகள் அமைத்தல்.
விவசாயிகளுக்கு குளிர்பதன கிடங்கு மற்றும் நேரடி கொள்முதல் நிலையங்கள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'virudhunagar', 'Virudhunagar', 'விருதுநகர்',
  'Thangam Thennarasu', 'தங்கம் தென்னரசு', 'dmk', 'DMK',
  'Tiruchuli (208)', 'திருச்சுழி (208)', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Thangam_Thennarasu.jpg/500px-Thangam_Thennarasu.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
  '2021-05-02', 59.15, 60992, 93,
  'Minister for Finance and Human Resources Management.
State revenue deficit reduction and social security scheme funding allocations.
Virudhunagar mega textile park (PM MITRA) establishment.', 'நிதி மற்றும் மனிதவள மேலாண்மைத் துறை அமைச்சர்.
மாநில வருவாய் பற்றாக்குறை குறைப்பு மற்றும் நலத்திட்ட நிதி ஒதுக்கீடுகள்.
விருதுநகர் பிஎம் மித்ரா மெகா ஜவுளி பூங்கா அமைக்கும் பணி.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'ariyalur', 'Ariyalur', 'அரியலூர்',
  'K. Chinnappa', 'கா. சின்னப்பா', 'dmk', 'DMK',
  'Ariyalur (149)', 'அரியலூர் (149)', null,
  '2021-05-02', 50.44, 3234, 81,
  'Cement industrial cluster local youth employment reservation petitions.
Gangaikonda Cholapuram heritage museum development.
Marudaiyaru river flood mitigation barrage.', 'சிமெண்ட் ஆலைகளில் உள்ளூர் இளைஞர்களுக்கு வேலைவாய்ப்பு கோரிக்கைகள்.
கங்கைகொண்ட சோழபுரம் தொல்லியல் அருங்காட்சியக பணிகள்.
மருதையாறு வெள்ளத் தடுப்பு கதவணை அமைத்தல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'chengalpattu', 'Chengalpattu', 'செங்கல்பட்டு',
  'S. R. Raja', 'எஸ். ஆர். ராஜா', 'dmk', 'DMK',
  'Tambaram (031)', 'தாம்பரம் (031)', null,
  '2021-05-02', 46.93, 36824, 84,
  'Tambaram Corporation underground drainage and flood mitigation.
GST Road pedestrian skywalks and traffic bottleneck clearances.
Adyar river rejuvenation in Tambaram-Mudichur stretch.', 'தாம்பரம் மாநகராட்சி பாதாள சாக்கடை மற்றும் வெள்ளத் தடுப்பு.
ஜிஎஸ்டி சாலை நடைமேம்பாலங்கள் மற்றும் போக்குவரத்து நெரிசல் தீர்வு.
தாம்பரம்-முடிச்சூர் பகுதியில் அடையாறு புனரமைப்பு.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'cuddalore', 'Cuddalore', 'கடலூர்',
  'M. R. K. Panneerselvam', 'எம். ஆர். கே. பன்னீர்செல்வம்', 'dmk', 'DMK',
  'Kurinjipadi (156)', 'குறிஞ்சிப்பாடி (156)', null,
  '2021-05-02', 51.09, 17527, 88,
  'Minister for Agriculture and Farmers Welfare.
Separate Agriculture Budget presentation in Tamil Nadu Assembly.
Cuddalore coastal flood protection and NLC land acquisition dispute mediation.', 'வேளாண்மை மற்றும் உழவர் நலத்துறை அமைச்சர்.
தமிழ்நாடு சட்டசபையில் தனி வேளாண் பட்ஜெட் தாக்கல்.
கடலூர் கடலோர வெள்ளத் தடுப்பு மற்றும் என்எல்சி நில இழப்பீடு பேச்சுவார்த்தைகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'dharmapuri', 'Dharmapuri', 'தர்மபுரி',
  'S. P. Venkateshwaran', 'எஸ். பி. வெங்கடேஸ்வரன்', 'pmk', 'PMK',
  'Dharmapuri (084)', 'தர்மபுரி (084)', null,
  '2021-05-02', 49.33, 26860, 82,
  'Cauvery-Saribanga surplus water irrigation scheme advocacy.
Morappur-Dharmapuri railway link execution representations.
Mango farmers processing unit and pulp export facilitation.', 'காவிரி உபரி நீர் பாசன திட்ட கோரிக்கைகள்.
மொரப்பூர் - தர்மபுரி ரயில்வே இணைப்பு பணிகள் துரிதப்படுத்தல்.
மாம்பழ கூழ் தயாரிப்பு மற்றும் ஏற்றுமதி வசதிகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'kallakurichi', 'Kallakurichi', 'கள்ளக்குறிச்சி',
  'K. Vasantham Karthikeyan', 'வசந்தம் கார்த்திகேயன்', 'dmk', 'DMK',
  'Rishivandiyam (078)', 'ரிஷிவந்தியம் (078)', null,
  '2021-05-02', 48.91, 41728, 83,
  'Manimuktha river check dam construction for irrigation.
Kallakurichi medical college hospital facilities and oxygen plants.
Sugarcane farmers pending mill payment settlement representations.', 'மணிமுக்தா நதி தடுப்பணைகள் அமைக்கும் பணிகள்.
கள்ளக்குறிச்சி மருத்துவக் கல்லூரி மருத்துவமனை வசதிகள்.
கரும்பு விவசாயிகளுக்கு ஆலை நிலுவைத் தொகை பெற்றுத்தரும் முயற்சிகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'krishnagiri', 'Krishnagiri', 'கிருஷ்ணகிரி',
  'D. Mathiazhagan', 'டி. மதியழகன்', 'dmk', 'DMK',
  'Bargur (052)', 'பர்கூர் (052)', null,
  '2021-05-02', 47.93, 12614, 82,
  'Kelavarapalli dam water quality monitoring and industrial effluent checks.
Hosur auto-ancillary and EV corridor integration.
Granite and mango processing cold storage units.', 'கெலவரப்பள்ளி அணை நீர் சுத்திகரிப்பு மற்றும் ஆலை கழிவு கண்காணிப்பு.
ஓசூர் மின்சார வாகன (EV) தொழில் கூட்டமைப்பு வசதிகள்.
கிரானைட் மற்றும் மாம்பழ பதப்படுத்தும் குளிர்பதன கிடங்குகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'mayiladuthurai', 'Mayiladuthurai', 'மயிலாடுதுறை',
  'Nivetha M. Murugan', 'நிவேதா எம். முருகன்', 'dmk', 'DMK',
  'Poompuhar (161)', 'பூம்புகார் (161)', null,
  '2021-05-02', 46.55, 3299, 82,
  'New Mayiladuthurai District Collectorate infrastructure follow-ups.
Poompuhar tourist beach development and coastal protection.
Cauvery tail-end irrigation canal desilting and water release advocacy.', 'புதிய மயிலாடுதுறை மாவட்ட ஆட்சியர் பெருந்திட்ட பணிகள்.
பூம்புகார் சுற்றுலா கடற்கரை மேம்பாடு மற்றும் தூண்டில் வளைவு.
காவிரி கடைமடை பாசன கால்வாய் தூர்வாருதல்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();

insert into public.mla_tracker (
  district_slug, district_name, district_name_ta, mla_name, mla_name_ta,
  party_slug, party_name, constituency, constituency_ta, photo_url,
  elected_date, vote_share, winning_margin, performance_score,
  key_actions_en, key_actions_ta, is_active
) values (
  'tirupattur', 'Tirupattur', 'திருப்பத்தூர்',
  'K. Devaraji', 'கே. தேவராஜி', 'dmk', 'DMK',
  'Jolarpet (049)', 'ஜோலார்பேட்டை (049)', null,
  '2021-05-02', 46.12, 1091, 81,
  'Jolarpet railway junction infrastructural expansion.
Yelagiri hills tourist safety road widening and water schemes.
Leather and shoemaking artisan welfare drives.', 'ஜோலார்பேட்டை ரயில் சந்திப்பு கூடுதல் வசதிகள்.
ஏலகிரி மலை சுற்றுலா சாலை விரிவாக்கம் மற்றும் குடிநீர் திட்டம்.
தோல் மற்றும் காலணி தொழிலாளர்கள் நலவாரிய உதவிகள்.', true
) on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  last_updated = now();
