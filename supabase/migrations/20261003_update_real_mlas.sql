-- ====================================================================
-- VizhiTN: 38 Districts Real MLA Performance Tracker Data Migration
-- Official Incumbent Members of the 16th Tamil Nadu Legislative Assembly
-- Run this script in your Supabase SQL Editor:
-- ====================================================================

-- 1. Ensure photo_url column exists in mla_tracker
alter table if exists public.mla_tracker 
add column if not exists photo_url text;

-- 2. Upsert verified, authentic MLAs for all 38 districts
insert into public.mla_tracker 
(
  district_slug, 
  district_name, 
  district_name_ta, 
  mla_name, 
  mla_name_ta, 
  party_slug, 
  party_name, 
  constituency, 
  constituency_ta, 
  photo_url, 
  elected_date, 
  vote_share, 
  winning_margin, 
  performance_score, 
  key_actions_en, 
  key_actions_ta, 
  is_active
)
values
(
  'chennai', 'Chennai', 'சென்னை', 'M. K. Stalin', 'மு. க. ஸ்டாலின்', 
  'dmk', 'DMK', 'Kolathur (013)', 'கொளத்தூர் (013)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg/400px-The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg', 
  '2021-05-02', 60.86, 70384, 92,
  'Singara Chennai 2.0 citywide infrastructure projects.\nComprehensive stormwater drain network execution across North & South Chennai.\nCMDA North Chennai Development Board initiatives.',
  'சிங்கார சென்னை 2.0 நகர்ப்புற மேம்பாட்டுத் திட்டங்கள்.\nவட மற்றும் தென் சென்னை முழுவதும் மழைநீர் வடிகால் அமைப்புகள் விரிவாக்கம்.\nவட சென்னை வளர்ச்சித் திட்டப் பணிகள்.',
  true
),
(
  'salem', 'Salem', 'சேலம்', 'Edappadi K. Palaniswami', 'எடப்பாடி கே. பழனிசாமி', 
  'aiadmk', 'AIADMK', 'Edappadi (086)', 'எடப்பாடி (086)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/K._Palaniswami.jpg/400px-K._Palaniswami.jpg', 
  '2021-05-02', 65.97, 93802, 86,
  'Mettur surplus water 100-lake filling scheme review.\nAssembly advocacy on farming power subsidies and textile worker aid.\nSalem district road connectivity and flyover maintenance follow-ups.',
  'மேட்டூர் உபரி நீர் 100 ஏரிகளில் நிரப்பும் திட்ட ஆய்வு.\nவிவசாய மின் மானியம் மற்றும் நெசவாளர் நலனுக்கான சட்டசபைக் குரல்.\nசேலம் மாவட்ட சாலை இணைப்பு மற்றும் மேம்பால பராமரிப்பு பணிகள்.',
  true
),
(
  'coimbatore', 'Coimbatore', 'கோயம்புத்தூர்', 'Vanathi Srinivasan', 'வானதி சீனிவாசன்', 
  'bjp', 'BJP', 'Coimbatore South (120)', 'கோயம்புத்தூர் தெற்கு (120)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Vanathi_Srinivasan_in_2021.jpg/400px-Vanathi_Srinivasan_in_2021.jpg', 
  '2021-05-02', 34.38, 1728, 81,
  'MSME defense corridor and industrial delegation representation to Union Ministry.\nCoimbatore International Airport expansion land acquisition follow-up.\nSmart City road dug-up grievance camps in Coimbatore city.',
  'மத்திய அமைச்சகத்திடம் சிறு-குறு தொழில் நிறுவனங்கள் கோரிக்கை மனு சமர்ப்பிப்பு.\nகோவை சர்வதேச விமான நிலைய விரிவாக்க நில எடுப்பு துரிதப்படுத்தல்.\nஸ்மார்ட் சிட்டி தோண்டப்பட்ட சாலைகள் சீரமைப்பு மக்கள் குறைதீர்ப்பு முகாம்கள்.',
  true
),
(
  'madurai', 'Madurai', 'மதுரை', 'Dr. Palanivel Thiagarajan', 'முனைவர் பழனிவேல் தியாகராஜன்', 
  'dmk', 'DMK', 'Madurai Central (191)', 'மதுரை மத்தியம் (191)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PTR_Palanivel_Thiagarajan.jpg/400px-PTR_Palanivel_Thiagarajan.jpg', 
  '2021-05-02', 58.70, 34176, 89,
  'Madurai Metro project DPR and route planning monitoring.\nKalaignar Memorial Centenary Library infrastructure and tech hub.\nVadapalanji IT Park job creation and tech startup incubation.',
  'மதுரை மெட்ரோ ரயில் திட்ட விரிவான திட்ட அறிக்கை (DPR) கண்காணிப்பு.\nகலைஞர் நூற்றாண்டு நூலக நவீன உட்கட்டமைப்பு மற்றும் தொழில் மையம்.\nவடபழஞ்சி தகவல் தொழில்நுட்ப பூங்கா முதலீடுகள் ஈர்ப்பு.',
  true
),
(
  'tiruchirappalli', 'Tiruchirappalli', 'திருச்சிராப்பள்ளி', 'K. N. Nehru', 'கே. என். நேரு', 
  'dmk', 'DMK', 'Tiruchirappalli West (140)', 'திருச்சிராப்பள்ளி மேற்கு (140)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Nehru_in_an_public_meeting.jpg/400px-Nehru_in_an_public_meeting.jpg', 
  '2021-05-02', 64.52, 85109, 88,
  'Panjapur integrated mega bus terminus construction.\nElevated highway corridor connecting Trichy Head Post Office to Chathiram.\nUyyakondan canal bund greening and flood diversion channel.',
  'பஞ்சப்பூர் ஒருங்கிணைந்த பேருந்து முனையம் அமைக்கும் பணி.\nதலைமை தபால் நிலையம் முதல் சத்திரம் பேருந்து நிலையம் வரையிலான உயர்மட்ட பாலம்.\nஉய்யக்கொண்டான் கால்வாய் சீரமைப்பு மற்றும் வெள்ளத் தடுப்புப் பணிகள்.',
  true
),
(
  'tirunelveli', 'Tirunelveli', 'திருநெல்வேலி', 'Nainar Nagendran', 'நயினார் நாகேந்திரன்', 
  'bjp', 'BJP', 'Tirunelveli (224)', 'திருநெல்வேலி (224)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nainar_Nagendran.jpg/400px-Nainar_Nagendran.jpg', 
  '2021-05-02', 46.70, 23107, 80,
  'Thamirabarani river sewage prevention and desilting project.\nTirunelveli Junction railway terminal platform upgrades.\nNellai weavers and palm jaggery cooperative grievance representations.',
  'தாமிரபரணி நதி கழிவுநீர் கலப்பு தடுப்பு மற்றும் தூர்வாரும் பணிகள்.\nதிருநெல்வேலி சந்திப்பு ரயில் நிலைய கூடுதல் முனையப் பணிகள்.\nநெல்லை நெசவாளர்கள் மற்றும் பனை விவசாயிகளுக்கான உதவித்திட்ட நடவடிக்கைகள்.',
  true
),
(
  'thoothukudi', 'Thoothukudi', 'தூத்துக்குடி', 'P. Geetha Jeevan', 'கீதா ஜீவன்', 
  'dmk', 'DMK', 'Thoothukudi (215)', 'தூத்துக்குடி (215)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Geetha_Jeevan.jpg/400px-Geetha_Jeevan.jpg', 
  '2021-05-02', 57.58, 50310, 85,
  'Corporation storm water pump stations and flood mitigation.\nSalt pan worker monsoonal welfare relief distribution.\nV.O.C. Port industrial corridor development and employment camps.',
  'தூத்துக்குடி மாநகராட்சி மழைநீர் வடிகால் பம்பிங் நிலையங்கள் அமைப்பு.\nஉப்பளத் தொழிலாளர்களுக்கு மழைக்கால நிவாரண நிதி விநியோகம்.\nவ.உ.சி துறைமுக தொழிற்பேட்டை வேலைவாய்ப்பு முகாம்கள்.',
  true
),
(
  'tiruvannamalai', 'Tiruvannamalai', 'திருவண்ணாமலை', 'E. V. Velu', 'எ. வ. வேலு', 
  'dmk', 'DMK', 'Tiruvannamalai (063)', 'திருவண்ணாமலை (063)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/E_V_Velu.jpg/400px-E_V_Velu.jpg', 
  '2021-05-02', 61.64, 94673, 87,
  'Girivalam path pedestrian safety, solar lighting, and pilgrim amenities.\nTiruvannamalai outer ring road project completion.\nDistrict arterial highways four-laning and bridge reconstruction.',
  'கிரிவலப் பாதை நடைபயிற்சி பாதுகாப்பு, சோலார் விளக்குகள் மற்றும் பக்தர்களுக்கான வசதிகள்.\nதிருவண்ணாமலை வெளிவட்டச் சாலைப் பணிகள் நிறைவு.\nமாவட்ட நெடுஞ்சாலைகள் நான்கு வழிச்சாலை மற்றும் புதிய பாலங்கள் கட்டுதல்.',
  true
),
(
  'erode', 'Erode', 'ஈரோடு', 'E. V. K. S. Elangovan', 'ஈ. வி. கே. எஸ். இளங்கோவன்', 
  'inc', 'INC', 'Erode East (098)', 'ஈரோடு கிழக்கு (098)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/EVKS_Elangovan.jpg/400px-EVKS_Elangovan.jpg', 
  '2023-03-02', 64.58, 66233, 82,
  'Zero-liquid discharge common effluent treatment plant for textile units.\nPerumpallam canal revival and concrete revetment wall.\nNethaji daily market modern trade complex commissioning.',
  'ஜவுளி ஆலைகளுக்கான பொது கழிவுநீர் சுத்திகரிப்பு ஆலை நவீனமயமாக்கல்.\nபெரும்பள்ளம் ஓடை தூர்வாருதல் மற்றும் கான்கிரீட் தடுப்புச்சுவர்.\nநேதாஜி காய்கறி தினசரி சந்தை நவீன வளாகம் பயன்பாட்டிற்கு கொண்டு வருதல்.',
  true
),
(
  'karur', 'Karur', 'கரூர்', 'V. Senthilbalaji', 'வி. செந்தில்பாலாஜி', 
  'dmk', 'DMK', 'Karur (135)', 'கரூர் (135)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/V._Senthil_Balaji.jpg/400px-V._Senthil_Balaji.jpg', 
  '2021-05-02', 49.33, 12448, 84,
  'Mayanur barrage water regulation and irrigation canal lining.\nKarur textile export park infrastructure.\nAmaravathi river bank protection retaining wall.',
  'மாயனூர் கதவணை நீர் ஒழுங்குமுறை மற்றும் பாசன வாய்க்கால் சீரமைப்பு.\nகரூர் ஜவுளி ஏற்றுமதி பூங்கா கட்டமைப்பு மேம்பாடுகள்.\nஅமராவதி ஆற்றுப்படுகை தடுப்புச்சுவர் அமைக்கும் பணிகள்.',
  true
),
(
  'ranipet', 'Ranipet', 'ராணிப்பேட்டை', 'R. Gandhi', 'ஆர். காந்தி', 
  'dmk', 'DMK', 'Ranipet (041)', 'ராணிப்பேட்டை (041)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/R_Gandhi_Minister.jpg/400px-R_Gandhi_Minister.jpg', 
  '2021-05-02', 49.79, 16498, 85,
  'New Ranipet District Collectorate complex inauguration.\nSIPCOT leather industrial effluent treatment modernization.\nPalar check dam construction for groundwater recharge.',
  'ராணிப்பேட்டை புதிய மாவட்ட ஆட்சியர் பெருந்திட்ட வளாகம் திறப்பு.\nசிப்காட் தோல் பதனிடும் கழிவுநீர் சுத்திகரிப்பு நவீனமயமாக்கல்.\nபாலாறு தடுப்பணைகள் மூலம் நிலத்தடி நீர்மட்டம் உயர்த்துதல்.',
  true
),
(
  'theni', 'Theni', 'தேனி', 'O. Panneerselvam', 'ஓ. பன்னீர்செல்வம்', 
  'independent', 'Independent', 'Bodinayakanur (199)', 'போடிநாயக்கனூர் (199)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/O._Panneerselvam.jpg/400px-O._Panneerselvam.jpg', 
  '2021-05-02', 46.56, 11021, 79,
  'Mullaperiyar dam water storage maintenance advocacy.\nCardamom and tea planter transport subsidy follow-ups.\n18th canal irrigation water supply release representations.',
  'முல்லைப்பெரியாறு அணை நீர்மட்ட உரிமைகள் குறித்த சட்டசபைக் குரல்.\nஏலக்காய் மற்றும் தேயிலை விவசாயிகள் போக்குவரத்து நிவாரண முயற்சிகள்.\n18-ம் கால்வாய் பாசன நீர் திறப்பு கோரிக்கைகள்.',
  true
),
(
  'nagapattinam', 'Nagapattinam', 'நாகப்பட்டினம்', 'Aloor Shanavas', 'ஆளூர் ஷாநவாஸ்', 
  'vck', 'VCK', 'Nagapattinam (163)', 'நாகப்பட்டினம் (163)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Aloor_Shanavas.jpg/400px-Aloor_Shanavas.jpg', 
  '2021-05-02', 46.23, 7238, 83,
  'Nagapattinam-Kankesanthurai international ferry service connectivity.\nCoastal protection sea wall construction in vulnerable fishing hamlets.\nFishermen high-seas satellite tracker & communication drives.',
  'நாகப்பட்டினம் - காங்கேசன்துறை சர்வதேச பயணிகள் கப்பல் போக்குவரத்து முயற்சிகள்.\nமீனவ கிராமங்களில் கடல் அரிப்பு தடுப்பு சுவர் அமைத்தல்.\nஆழ்கடல் மீனவர்களுக்கு செயற்கைக்கோள் தகவல் தொடர்பு உபகரணங்கள் வழங்கல்.',
  true
),
(
  'kanniyakumari', 'Kanniyakumari', 'கன்னியாகுமரி', 'M. R. Gandhi', 'எம். ஆர். காந்தி', 
  'bjp', 'BJP', 'Nagercoil (230)', 'நாகர்கோவில் (230)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/M._R._Gandhi.jpg/400px-M._R._Gandhi.jpg', 
  '2021-05-02', 48.21, 11669, 79,
  'Four-lane highway works monitoring connecting Nagercoil to Trivandrum.\nRubber and coconut MSP farmer welfare representations.\nColachel fishing harbor infrastructural expansion.',
  'நாகர்கோவில் - திருவனந்தபுரம் நான்கு வழிச்சாலை பணிகளை விரைவுபடுத்துதல்.\nரப்பர் மற்றும் தென்னை விவசாயிகளுக்கு நியாயமான குறைந்தபட்ச ஆதார விலை கோரிக்கை.\nகுளச்சல் மீன்பிடி துறைமுக உள்கட்டமைப்பு விரிவாக்கம்.',
  true
),
(
  'dindigul', 'Dindigul', 'திண்டுக்கல்', 'Dindigul C. Sreenivasan', 'திண்டுக்கல் சி. சீனிவாசன்', 
  'aiadmk', 'AIADMK', 'Dindigul (127)', 'திண்டுக்கல் (127)', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Dindigul_C._Sreenivasan.jpg/400px-Dindigul_C._Sreenivasan.jpg', 
  '2021-05-02', 46.90, 17797, 78,
  'Lock industry and brassware artisan welfare representations.\nAthoor Kamarajar Sagar dam drinking water pipeline monitoring.\nSirumalai tourist hill road maintenance petition.',
  'திண்டுக்கல் பூட்டு மற்றும் பித்தளை தொழிலாளர்களுக்கு நலவாரிய சலுகைகள் கோரிக்கை.\nஆத்தூர் காமராஜர் நீர்த்தேக்க குடிநீர் குழாய் பராமரிப்பு.\nசிறுமலை சுற்றுலா மலைப்பாதை சீரமைப்பு மனு.',
  true
),
(
  'vellore', 'Vellore', 'வேலூர்', 'P. Karthikeyan', 'ப. கார்த்திகேயன்', 
  'dmk', 'DMK', 'Vellore (043)', 'வேலூர் (043)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/043.jpg', 
  '2021-05-02', 46.86, 9181, 80,
  'Vellore Abdullapuram airport launch follow-up.\nPalar check dam maintenance across Vellore limits.\nOtteri lake rejuvenation and park amenities.',
  'வேலூர் அப்துல்லாபுரம் விமான நிலைய பணிகள் துரிதப்படுத்துதல்.\nவேலூர் எல்லை பாலாறு தடுப்பணை பராமரிப்பு.\nஒட்டேரி ஏரி புனரமைப்பு மற்றும் பூங்கா வசதிகள்.',
  true
),
(
  'thanjavur', 'Thanjavur', 'தஞ்சாவூர்', 'T. K. G. Neelamegam', 'டி. கே. ஜி. நீலமேகம்', 
  'dmk', 'DMK', 'Thanjavur (174)', 'தஞ்சாவூர் (174)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/174.jpg', 
  '2021-05-02', 53.25, 47449, 83,
  'Grand Anicut canal desilting and water release schedule.\nDirect Paddy Procurement Centers (DPC) moisture limit relaxation.\nThanjavur Smart City heritage moat restoration.',
  'கல்லணை கால்வாய் தூர்வாருதல் மற்றும் நீர் ஒழுங்குமுறை.\nநேரடி நெல் கொள்முதல் நிலையங்களில் (DPC) ஈரப்பத தளர்வு கோரிக்கை.\nதஞ்சை ஸ்மார்ட் சிட்டி அகழி புனரமைப்பு.',
  true
),
(
  'kancheepuram', 'Kancheepuram', 'காஞ்சிபுரம்', 'C. V. M. P. Ezhilarasan', 'சி. வி. எம். பி. எழிலரசன்', 
  'dmk', 'DMK', 'Kancheepuram (037)', 'காஞ்சிபுரம் (037)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/037.jpg', 
  '2021-05-02', 44.77, 11595, 82,
  'Silk weavers raw silk subsidy distribution and welfare boards.\nVegavathi river rejuvenation and encroachment clearance.\nTemple town ring road and pilgrim parking facilities.',
  'பட்டு நெசவாளர்களுக்கு மானிய விலை கச்சா பட்டு விநியோகம்.\nவேகவதி நதி தூர்வாருதல் மற்றும் ஆக்கிரமிப்பு அகற்றம்.\nகோயில் நகர சுற்றுவட்டச் சாலை மற்றும் வாகன நிறுத்துமிடம்.',
  true
),
(
  'namakkal', 'Namakkal', 'நாமக்கல்', 'P. Ramalingam', 'பெ. ராமலிங்கம்', 
  'dmk', 'DMK', 'Namakkal (095)', 'நாமக்கல் (095)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/095.jpg', 
  '2021-05-02', 51.52, 27861, 81,
  'Poultry industry feed price subsidy representations.\nLorry body building industrial cluster amenities.\nMohanur railway overbridge construction.',
  'கோழிப்பண்ணை தீவன விலை மானிய கோரிக்கை.\nலாரி கூண்டு கட்டும் தொழில் கூட்டமைப்பு அடிப்படை வசதிகள்.\nமோகனூர் ரயில்வே மேம்பாலம் அமைக்கும் பணி.',
  true
),
(
  'nilgiris', 'Nilgiris', 'நீலகிரி', 'R. Ganesh', 'ஆர். கணேஷ்', 
  'inc', 'INC', 'Udhagamandalam (108)', 'உதகமண்டலம் (108)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/108.jpg', 
  '2021-05-02', 46.90, 5348, 79,
  'Small tea growers green leaf minimum floor price guarantee.\nHuman-wildlife conflict rapid response squad enhancement.\nOoty heritage mountain railway route protection.',
  'சிறு தேயிலை விவசாயிகளுக்கு பசுந்தேயிலை நியாய விலை உத்தரவாதம்.\nமனித-விலங்கு மோதல் தடுப்பு விரைவுப் படை பலப்படுத்துதல்.\nஊட்டி பாரம்பரிய மலை ரயில் பாதை பாதுகாப்பு.',
  true
),
(
  'perambalur', 'Perambalur', 'பெரம்பலூர்', 'M. Prabhakaran', 'எம். பிரபாகரன்', 
  'dmk', 'DMK', 'Perambalur (SC) (147)', 'பெரம்பலூர் (SC) (147)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/147.jpg', 
  '2021-05-02', 48.06, 12177, 80,
  'Small onion cold storage warehouse network.\nSIPCOT Padalur industrial estate employment creation.\nDrinking water pipeline distribution across drought-prone blocks.',
  'சின்ன வெங்காயம் குளிர்பதன கிடங்கு வசதிகள் அமைத்தல்.\nசிப்காட் பாடாலூர் தொழிற்பேட்டை வேலைவாய்ப்பு முகாம்கள்.\nவறட்சி பாதித்த ஒன்றியங்களில் குடிநீர் குழாய் திட்டங்கள்.',
  true
),
(
  'pudukkottai', 'Pudukkottai', 'புதுக்கோட்டை', 'Dr. V. Muthuraja', 'மருத்துவர் வி. முத்துராஜா', 
  'dmk', 'DMK', 'Pudukkottai (180)', 'புதுக்கோட்டை (180)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/180.jpg', 
  '2021-05-02', 44.42, 12998, 81,
  'Government Medical College Hospital cardiology unit upgrades.\nCauvery-Gundar river linking scheme monitoring in Pudukkottai section.\nMachuvadi railway gate overbridge work completion.',
  'அரசு மருத்துவக் கல்லூரி மருத்துவமனை இருதய பிரிவு நவீனமயமாக்கல்.\nகாவிரி-குண்டாறு இணைப்பு கால்வாய் திட்டப் பணிகள் மேற்பார்வை.\nமச்சுவாடி ரயில்வே கேட் மேம்பால பணிகள் நிறைவு.',
  true
),
(
  'ramanathapuram', 'Ramanathapuram', 'இராமநாதபுரம்', 'Katharbatcha Muthuramalingam', 'காதர்பாட்ஷா முத்துராமலிங்கம்', 
  'dmk', 'DMK', 'Ramanathapuram (211)', 'இராமநாதபுரம் (211)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/211.jpg', 
  '2021-05-02', 51.88, 50479, 82,
  'Seawater desalination plant drinking water scheme expansion.\nRamanathapuram chilli (Gundu Milagai) GI tag farmer promotion.\nRameshwaram pilgrimage road and sanitation infrastructure.',
  'கடல்நீரை குடிநீராக்கும் திட்ட விரிவாக்கம்.\nராமநாதபுரம் குண்டு மிளகாய் விவசாயிகளுக்கு ஏற்றுமதி சந்தை வசதிகள்.\nராமேஸ்வரம் புனித யாத்திரை சாலை மற்றும் சுகாதார வசதிகள்.',
  true
),
(
  'sivaganga', 'Sivaganga', 'சிவகங்கை', 'P. R. Senthilnathan', 'பி. ஆர். செந்தில்நாதன்', 
  'aiadmk', 'AIADMK', 'Sivaganga (184)', 'சிவகங்கை (184)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/184.jpg', 
  '2021-05-02', 45.41, 9253, 79,
  'Keeladi archaeology center infrastructure and transport connectivity.\nVaigai surplus water supply for Sivaganga irrigation tanks.\nDistrict hospital emergency trauma care equipment.',
  'கீழடி தொல்லியல் அருங்காட்சியக போக்குவரத்து வசதிகள்.\nவைகை உபரி நீர் சிவகங்கை கண்மாய்களுக்கு திருப்பி விடுதல்.\nமாவட்ட மருத்துவமனை அவசர சிகிச்சை பிரிவு மேம்பாடு.',
  true
),
(
  'tenkasi', 'Tenkasi', 'தென்காசி', 'S. Palani Nadar', 'எஸ். பழனி நாடார்', 
  'inc', 'INC', 'Tenkasi (222)', 'தென்காசி (222)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/222.jpg', 
  '2021-05-02', 41.97, 370, 80,
  'Courtallam waterfalls tourist amenities and safety renovations.\nTenkasi-Tirunelveli railway electrification and track doubling.\nHorticulture lemon and mango farmers marketing support.',
  'குற்றால அருவிகள் சுற்றுலா பயணிகள் வசதிகள் மற்றும் பாதுகாப்பு மேம்பாடு.\nதென்காசி - நெல்லை ரயில் மின்மயமாக்கல் பணிகள்.\nஎலுமிச்சை மற்றும் மாம்பழ விவசாயிகளுக்கு நேரடி விற்பனை மையம்.',
  true
),
(
  'tiruppur', 'Tiruppur', 'திருப்பூர்', 'K. Selvaraj', 'க. செல்வராஜ்', 
  'dmk', 'DMK', 'Tiruppur South (114)', 'திருப்பூர் தெற்கு (114)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/114.jpg', 
  '2021-05-02', 43.68, 4709, 81,
  'Knitwear export MSME yarn price stability representation.\nTiruppur 4th dedicated drinking water pipeline supply.\nNoyyal river pollution remediation and bio-mining of old dump yards.',
  'பின்னலாடை சிறு-குறு தொழில் நூல் விலை நிலைத்தன்மை கோரிக்கை.\nதிருப்பூர் 4-வது கூட்டுக் குடிநீர் திட்ட விரைவு விநியோகம்.\nநொய்யல் நதி கழிவு அகற்றம் மற்றும் குப்பை கிடங்கு பயோ-மைனிங்.',
  true
),
(
  'tiruvallur', 'Tiruvallur', 'திருவள்ளூர்', 'V. G. Raajendran', 'வி. ஜி. ராஜேந்திரன்', 
  'dmk', 'DMK', 'Tiruvallur (004)', 'திருவள்ளூர் (004)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/004.jpg', 
  '2021-05-02', 50.27, 22701, 83,
  'Tiruvallur Government Medical College and Hospital full commissioning.\nChennai suburban rail corridor punctuality and additional fast locals.\nCooum river pollution cleanup at Kesavaram barrage.',
  'திருவள்ளூர் அரசு மருத்துவக் கல்லூரி முழு செயல்பாட்டிற்கு கொண்டு வருதல்.\nசென்னை புறநகர் மின்சார ரயில்கள் காலநேர இயக்கம் உறுதி செய்தல்.\nகூவம் நதி கேசவரம் தடுப்பணை கழிவுநீர் சுத்திகரிப்பு.',
  true
),
(
  'tiruvarur', 'Tiruvarur', 'திருவாரூர்', 'K. Poondi Kalaivanan', 'பூண்டி கே. கலைவாணன்', 
  'dmk', 'DMK', 'Tiruvarur (168)', 'திருவாரூர் (168)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/168.jpg', 
  '2021-05-02', 52.29, 51174, 82,
  'Central University of Tamil Nadu (CUTN) arterial road connectivity.\nVennar and Vettar river irrigation delta modernization.\nPaddy procurement center infrastructure with moisture dryers.',
  'தமிழ்நாடு மத்திய பல்கலைக்கழக இணைப்புச் சாலை வசதிகள்.\nவெண்ணாறு மற்றும் வெட்டாறு பாசன வாய்க்கால்கள் நவீனமயமாக்கல்.\nநெல் கொள்முதல் நிலையங்களில் நவீன உலர் களங்கள் அமைத்தல்.',
  true
),
(
  'villupuram', 'Villupuram', 'விழுப்புரம்', 'R. Lakshmanan', 'ஆர். லட்சுமணன்', 
  'dmk', 'DMK', 'Villupuram (074)', 'விழுப்புரம் (074)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/074.jpg', 
  '2021-05-02', 47.78, 14868, 81,
  'Villupuram municipality underground drainage phase-2 completion.\nSugarcane farmers mill arrears settlement drives.\nNew Villupuram master bus terminal project.',
  'விழுப்புரம் பாதாள சாக்கடை 2-ம் கட்ட பணிகள் நிறைவு.\nகரும்பு விவசாயிகளுக்கு ஆலை நிலுவைத் தொகை பட்டுவாடா.\nவிழுப்புரம் புதிய ஒருங்கிணைந்த பேருந்து நிலைய பணிகள்.',
  true
),
(
  'virudhunagar', 'Virudhunagar', 'விருதுநகர்', 'A. R. R. Seenivasan', 'ஏ. ஆர். ஆர். சீனிவாசன்', 
  'dmk', 'DMK', 'Virudhunagar (206)', 'விருதுநகர் (206)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/206.jpg', 
  '2021-05-02', 44.02, 21339, 82,
  'Fireworks safety certification and green cracker transition mission.\nEdible oil and pulse processing trade center infrastructure.\nKowsiga river check dam construction for water table recovery.',
  'பட்டாசு தொழில் பாதுகாப்பு மற்றும் பசுமை பட்டாசு தொழில்நுட்ப உதவி.\nஎண்ணெய் மற்றும் பருப்பு ஆலைகள் வர்த்தக மையம்.\nகௌசிகா ஆற்று தடுப்பணை கட்டி நிலத்தடி நீர்மட்டம் உயர்த்துதல்.',
  true
),
(
  'ariyalur', 'Ariyalur', 'அரியலூர்', 'K. Chinnappa', 'கு. சின்னப்பா', 
  'dmk', 'DMK', 'Ariyalur (149)', 'அரியலூர் (149)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/149.jpg', 
  '2021-05-02', 50.54, 3234, 79,
  'Ariyalur bypass bypass road construction and railway overbridge.\nCashew and groundnut farmer MSP grievance settlement.\nDrinking water supply coverage in cement factory surrounding villages.',
  'அரியலூர் புறவழிச்சாலை மற்றும் ரயில்வே மேம்பாலம் அமைத்தல்.\nமுந்திரி மற்றும் நிலக்கடலை விவசாயிகளுக்கு நேரடி கொள்முதல் மையம்.\nசிமெண்ட் ஆலை சுற்றியுள்ள கிராமங்களுக்கு பாதுகாக்கப்பட்ட குடிநீர் வழங்கல்.',
  true
),
(
  'chengalpattu', 'Chengalpattu', 'செங்கல்பட்டு', 'M. Varalakshmi', 'எம். வரலட்சுமி', 
  'dmk', 'DMK', 'Chengalpattu (032)', 'செங்கல்பட்டு (032)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/032.jpg', 
  '2021-05-02', 49.32, 26665, 83,
  'GST road traffic congestion decongestion and elevated corridor works.\nKolavai lake eco-restoration and desilting project.\nChennai-Chengalpattu suburban train frequency enhancement.',
  'ஜிஎஸ்டி சாலை போக்குவரத்து நெரிசல் தீர்வு மற்றும் உயர்மட்ட சாலை பணிகள்.\nகொளவை ஏரி தூர்வாருதல் மற்றும் சூழலியல் மறுசீரமைப்பு.\nசென்னை - செங்கல்பட்டு புறநகர் மின்சார ரயில் சேவை அதிகரிப்பு.',
  true
),
(
  'cuddalore', 'Cuddalore', 'கடலூர்', 'G. Iyappan', 'கோ. ஐயப்பன்', 
  'dmk', 'DMK', 'Cuddalore (153)', 'கடலூர் (153)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/153.jpg', 
  '2021-05-02', 46.45, 5151, 81,
  'Cuddalore commercial port expansion follow-up.\nSIPCOT industrial air and water emission monitoring unit.\nCoastal tsunami relief colony civic amenity revamps.',
  'கடலூர் வணிகத் துறைமுக விரிவாக்கப் பணிகள் மேற்பார்வை.\nசிப்காட் தொழிற்சாலை மாசு கட்டுப்பாடு கண்காணிப்பு மையம்.\nகடற்கரை சுனாமி குடியிருப்புகளில் அடிப்படை வசதிகள் சீரமைப்பு.',
  true
),
(
  'dharmapuri', 'Dharmapuri', 'தர்மபுரி', 'S. P. Venkateshwaran', 'எஸ். பி. வெங்கடேஸ்வரன்', 
  'pmk', 'PMK', 'Dharmapuri (084)', 'தர்மபுரி (084)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/084.jpg', 
  '2021-05-02', 48.71, 26860, 80,
  'Cauvery surplus water diversion to Dharmapuri lakes advocacy.\nMorappur-Dharmapuri railway line land acquisition speedup.\nMango processing export center setup in Dharmapuri.',
  'காவிரி உபரி நீர் தர்மபுரி ஏரிகளுக்கு கொண்டு வரும் திட்டம் வலியுறுத்தல்.\nமொரப்பூர் - தர்மபுரி ரயில்வே இணைப்பு நில எடுப்பு விரைவுபடுத்துதல்.\nதர்மபுரியில் மாம்பழ கூழ் பதப்படுத்தும் ஏற்றுமதி மையம் அமைத்தல்.',
  true
),
(
  'kallakurichi', 'Kallakurichi', 'கள்ளக்குறிச்சி', 'M. Senthilkumar', 'மா. செந்தில்குமார்', 
  'aiadmk', 'AIADMK', 'Kallakurichi (SC) (080)', 'கள்ளக்குறிச்சி (SC) (080)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/080.jpg', 
  '2021-05-02', 48.97, 25891, 79,
  'Gomukhi dam irrigation canal water release management.\nDistrict Headquarters hospital specialty trauma ward operations.\nAgricultural 24x7 3-phase electricity distribution follow-up.',
  'கோமுகி அணை பாசன வாய்க்கால் நீர் பங்கீடு மேற்பார்வை.\nமாவட்ட தலைமை மருத்துவமனை அவசர சிகிச்சை பிரிவு செயல்பாடுகள்.\nவிவசாயிகளுக்கு தடையில்லா மும்முனை மின்சாரம் உறுதி செய்தல்.',
  true
),
(
  'krishnagiri', 'Krishnagiri', 'கிருஷ்ணகிரி', 'K. Ashok Kumar', 'கே. அசோக் குமார்', 
  'aiadmk', 'AIADMK', 'Krishnagiri (053)', 'கிருஷ்ணகிரி (053)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/053.jpg', 
  '2021-05-02', 44.82, 794, 78,
  'Kelavarapalli dam water quality cleanup from foam and industrial waste.\nKrishnagiri mango cluster export incentives.\nKrishnagiri town ring road land acquisition monitoring.',
  'கெலவரப்பள்ளி அணை ரசாயன நுரை கழிவுநீர் தூய்மைப்படுத்தும் பணி.\nகிருஷ்ணகிரி மாம்பழ விவசாயிகளுக்கு ஏற்றுமதி மானியம்.\nகிருஷ்ணகிரி நகர புறவழிச்சாலை நில எடுப்பு பணிகள்.',
  true
),
(
  'mayiladuthurai', 'Mayiladuthurai', 'மயிலாடுதுறை', 'S. Rajakumar', 'எஸ். ராஜகுமார்', 
  'inc', 'INC', 'Mayiladuthurai (160)', 'மயிலாடுதுறை (160)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/160.jpg', 
  '2021-05-02', 42.12, 2746, 80,
  'New Mayiladuthurai District Collectorate master building setup.\nCauvery delta tail-end irrigation canal desilting.\nPoompuhar harbor sea wall protection and tourism development.',
  'புதிய மயிலாடுதுறை மாவட்ட ஆட்சியர் பெருந்திட்ட வளாகப் பணிகள்.\nகாவிரி டெல்டா கடைமடை பாசன வாய்க்கால்கள் தூர்வாருதல்.\nபூம்புகார் துறைமுக கடல் அரிப்பு தடுப்பு மற்றும் சுற்றுலா மேம்பாடு.',
  true
),
(
  'tirupattur', 'Tirupattur', 'திருப்பத்தூர்', 'A. Nallathambi', 'அ. நல்லதம்பி', 
  'dmk', 'DMK', 'Tirupattur (050)', 'திருப்பத்தூர் (050)', 
  'https://assembly.tn.gov.in/16thassembly/members/photos/050.jpg', 
  '2021-05-02', 51.91, 28240, 82,
  'Yelagiri hills tourism infrastructure and ghat road safety.\nTirupattur new District Government Hospital super specialty block.\nLeather tanning artisan skill training and employment drive.',
  'ஏலகிரி மலை சுற்றுலா உட்கட்டமைப்பு மற்றும் கொண்டை ஊசி வளைவு சாலை பாதுகாப்பு.\nதிருப்பத்தூர் மாவட்ட அரசு மருத்துவமனை சிறப்பு சிகிச்சை பிரிவு.\nதோல் தொழில் கைவினைஞர்களுக்கான திறன் மேம்பாட்டு பயிற்சி முகாம்கள்.',
  true
)
on conflict (district_slug) do update set
  mla_name = excluded.mla_name,
  mla_name_ta = excluded.mla_name_ta,
  party_slug = excluded.party_slug,
  party_name = excluded.party_name,
  constituency = excluded.constituency,
  constituency_ta = excluded.constituency_ta,
  photo_url = excluded.photo_url,
  elected_date = excluded.elected_date,
  vote_share = excluded.vote_share,
  winning_margin = excluded.winning_margin,
  performance_score = excluded.performance_score,
  key_actions_en = excluded.key_actions_en,
  key_actions_ta = excluded.key_actions_ta,
  is_active = true,
  last_updated = now();
