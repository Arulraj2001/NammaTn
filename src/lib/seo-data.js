// src/lib/seo-data.js
// Single source of truth for all programmatic SEO metadata.
// Used by: generateMetadata(), schema components, internal linking components.

export const SITE_URL = 'https://www.vizhitn.in';
export const SITE_NAME = 'VizhiTN';

// ── District data ─────────────────────────────────────────────────────────────
// slug    → used in URL (/district/[slug])
// name    → display name for page titles and text
// nearby  → slugs of adjacent districts for "nearby districts" internal links
export const DISTRICTS = [
  { slug: 'chennai',        name: 'Chennai',        nearby: ['chengalpattu', 'tiruvallur', 'kancheepuram'],   neighborhoods: ['Anna Nagar', 'Velachery', 'Adyar', 'Perambur', 'Ambattur', 'Avadi', 'Tambaram'] },
  { slug: 'coimbatore',     name: 'Coimbatore',     nearby: ['tiruppur', 'erode', 'nilgiris', 'karur'],       neighborhoods: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Singanallur', 'Saibaba Colony', 'Ukkadam', 'Vadavalli'] },
  { slug: 'madurai',        name: 'Madurai',        nearby: ['dindigul', 'sivaganga', 'theni', 'virudhunagar'], neighborhoods: ['Anna Nagar', 'KK Nagar', 'Thirunagar', 'Palanganatham', 'Arappalayam', 'Goripalayam', 'Tallakulam'] },
  { slug: 'tiruchirappalli',name: 'Tiruchirappalli',nearby: ['karur', 'perambalur', 'pudukkottai', 'thanjavur', 'ariyalur'], neighborhoods: ['Srirangam', 'Ariyamangalam', 'Thiruverumbur', 'Woraiyur', 'Palakkarai', 'KK Nagar', 'Thillai Nagar'] },
  { slug: 'salem',          name: 'Salem',          nearby: ['namakkal', 'erode', 'dharmapuri', 'krishnagiri'], neighborhoods: ['Shevapet', 'Suramangalam', 'Fairlands', 'Alagapuram', 'Hasthampatti', 'Ammapet', 'Kondalampatti'] },
  { slug: 'tirunelveli',    name: 'Tirunelveli',    nearby: ['tenkasi', 'virudhunagar', 'thoothukudi'],        neighborhoods: ['Palayamkottai', 'Melapalayam', 'Nanguneri', 'Ambasamudram', 'Cheranmahadevi', 'Valliyur', 'Radhapuram'] },
  { slug: 'erode',          name: 'Erode',          nearby: ['coimbatore', 'tiruppur', 'salem', 'karur', 'nilgiris'], neighborhoods: ['Perundurai', 'Gobichettipalayam', 'Bhavani', 'Sathyamangalam', 'Thindal', 'Chithode', 'Kavindapadi'] },
  { slug: 'vellore',        name: 'Vellore',        nearby: ['ranipet', 'tirupattur', 'kancheepuram', 'tiruvallur'], neighborhoods: ['Katpadi', 'Sathuvachari', 'Kosapet', 'Gandhinagar', 'VIT Area', 'Ariyur', 'Virupatchipuram'] },
  { slug: 'thoothukudi',    name: 'Thoothukudi',    nearby: ['tirunelveli', 'virudhunagar', 'ramanathapuram'], neighborhoods: ['Millerpuram', 'Kovilpatti', 'Ottapidaram', 'Sathankulam', 'Vilathikulam', 'Kayalpattinam', 'Eral'] },
  { slug: 'tiruppur',       name: 'Tiruppur',       nearby: ['coimbatore', 'erode', 'karur', 'dindigul'],      neighborhoods: ['Palladam', 'Udumalaipettai', 'Kangeyam', 'Dharapuram', 'Avinashi', 'Uthukuli', 'Annur'] },
  { slug: 'thanjavur',      name: 'Thanjavur',      nearby: ['tiruchirappalli', 'tiruvarur', 'nagapattinam', 'pudukkottai'], neighborhoods: ['Papanasam', 'Kumbakonam', 'Pattukottai', 'Orathanadu', 'Thiruvaiyaru', 'Budalur', 'Seerkazhi'] },
  { slug: 'dindigul',       name: 'Dindigul',       nearby: ['madurai', 'theni', 'karur', 'tiruppur'],         neighborhoods: ['Palani', 'Kodaikanal', 'Natham', 'Vedasandur', 'Athoor', 'Batlagundu', 'Nilakkottai'] },
  { slug: 'cuddalore',      name: 'Cuddalore',      nearby: ['villupuram', 'ariyalur', 'nagapattinam'],        neighborhoods: ['Chidambaram', 'Panruti', 'Srimushnam', 'Kurinjipadi', 'Virudhachalam', 'Mangalore', 'Tittagudi'] },
  { slug: 'namakkal',       name: 'Namakkal',       nearby: ['salem', 'erode', 'karur', 'tiruchirappalli'],    neighborhoods: ['Rasipuram', 'Tiruchengode', 'Paramathi-Velur', 'Mohanur', 'Senthamangalam', 'Kollihills', 'Pallipalayam'] },
  { slug: 'kancheepuram',   name: 'Kancheepuram',   nearby: ['chennai', 'chengalpattu', 'vellore', 'tiruvallur'], neighborhoods: ['Sriperumbudur', 'Walajabad', 'Madurantakam', 'Uthiramerur', 'Cheyyar', 'Kancheepuram Town', 'Vellavedu'] },
  { slug: 'krishnagiri',    name: 'Krishnagiri',    nearby: ['dharmapuri', 'salem', 'vellore'],                neighborhoods: ['Hosur', 'Denkanikottai', 'Bargur', 'Pochampalli', 'Shoolagiri', 'Kelamangalam', 'Mathur'] },
  { slug: 'dharmapuri',     name: 'Dharmapuri',     nearby: ['krishnagiri', 'salem', 'namakkal'],              neighborhoods: ['Palacode', 'Pennagaram', 'Harur', 'Karimangalam', 'Marandahalli', 'Nallampalli', 'Papireddipatti'] },
  { slug: 'nagapattinam',   name: 'Nagapattinam',   nearby: ['tiruvarur', 'thanjavur', 'mayiladuthurai'],      neighborhoods: ['Vedaranyam', 'Sirkazhi', 'Sirkali', 'Tharangambadi', 'Kilvelur', 'Kollidam', 'Nagapattinam Town'] },
  { slug: 'villupuram',     name: 'Villupuram',     nearby: ['cuddalore', 'kallakurichi', 'chengalpattu'],     neighborhoods: ['Tindivanam', 'Gingee', 'Rishivandiyam', 'Vikravandi', 'Vanur', 'Ulundurpet', 'Thirukoilur'] },
  { slug: 'ramanathapuram', name: 'Ramanathapuram', nearby: ['sivaganga', 'virudhunagar', 'thoothukudi'],      neighborhoods: ['Rameswaram', 'Mandapam', 'Paramakudi', 'Mudukulathur', 'Thiruvadanai', 'Kamuthi', 'Keelakkarai'] },
  { slug: 'sivaganga',      name: 'Sivaganga',      nearby: ['madurai', 'ramanathapuram', 'pudukkottai'],      neighborhoods: ['Karaikudi', 'Devakottai', 'Manamadurai', 'Tiruppattur', 'Ilayangudi', 'Kalaiyarkoil', 'Singampunari'] },
  { slug: 'virudhunagar',   name: 'Virudhunagar',   nearby: ['madurai', 'tirunelveli', 'ramanathapuram', 'thoothukudi'], neighborhoods: ['Sivakasi', 'Sattur', 'Aruppukottai', 'Rajapalayam', 'Thiruvengadam', 'Kariapatti', 'Srivilliputhur'] },
  { slug: 'theni',          name: 'Theni',          nearby: ['madurai', 'dindigul', 'tenkasi'],                neighborhoods: ['Periyakulam', 'Bodinayakkanur', 'Andipatti', 'Uthamapalayam', 'Cumbum', 'Chinnamanur', 'Gudalur'] },
  { slug: 'karur',          name: 'Karur',          nearby: ['tiruchirappalli', 'namakkal', 'erode', 'dindigul', 'tiruppur'], neighborhoods: ['Kulithalai', 'Aravakurichi', 'Krishnarayapuram', 'Thanthoni', 'Kadavur', 'Pugalur', 'Manmangalam'] },
  { slug: 'ariyalur',       name: 'Ariyalur',       nearby: ['perambalur', 'tiruchirappalli', 'cuddalore'],    neighborhoods: ['Sendurai', 'Andimadam', 'Udayarpalayam', 'Jayankondam', 'T.Palur', 'Ariyalur Town', 'Kiliyur'] },
  { slug: 'perambalur',     name: 'Perambalur',     nearby: ['ariyalur', 'tiruchirappalli', 'namakkal'],       neighborhoods: ['Alathur', 'Kunnam', 'Veppur', 'Esanai', 'Veppanthattai', 'Perambalur Town', 'Arumbavur'] },
  { slug: 'pudukkottai',    name: 'Pudukkottai',    nearby: ['tiruchirappalli', 'sivaganga', 'thanjavur'],     neighborhoods: ['Arantangi', 'Gandarvakottai', 'Tirumayam', 'Alangudi', 'Viralimalai', 'Ponnamaravathi', 'Iluppur'] },
  { slug: 'tiruvarur',      name: 'Tiruvarur',      nearby: ['thanjavur', 'nagapattinam', 'tiruvarur'],        neighborhoods: ['Mannargudi', 'Thiruthuraipoondi', 'Kodavasal', 'Nannilam', 'Papanasam', 'Needamangalam', 'Valangaiman'] },
  { slug: 'mayiladuthurai', name: 'Mayiladuthurai',  nearby: ['nagapattinam', 'tiruvarur', 'cuddalore'],       neighborhoods: ['Sirkazhi', 'Poompuhar', 'Kollidam', 'Tharangambadi', 'Thalainayar', 'Sembanarkoil', 'Mayiladuthurai Town'] },
  { slug: 'tiruvallur',     name: 'Tiruvallur',     nearby: ['chennai', 'vellore', 'ranipet', 'kancheepuram'], neighborhoods: ['Ponneri', 'Gummidipoondi', 'Tiruttani', 'Uthukottai', 'Pallipat', 'Poonamallee', 'Avadi'] },
  { slug: 'chengalpattu',   name: 'Chengalpattu',   nearby: ['chennai', 'kancheepuram', 'villupuram'],         neighborhoods: ['Mahabalipuram', 'Cheyyur', 'Maduranthakam', 'Vandalur', 'Thiruporur', 'Chengalpattu Town', 'Siruseri'] },
  { slug: 'ranipet',        name: 'Ranipet',        nearby: ['vellore', 'tiruvallur', 'tiruvannamalai'],       neighborhoods: ['Arcot', 'Sholinghur', 'Arakkonam', 'Nemili', 'Walajapet', 'Ranipet Town', 'Kaveripakkam'] },
  { slug: 'tirupattur',     name: 'Tirupattur',     nearby: ['vellore', 'krishnagiri', 'dharmapuri'],          neighborhoods: ['Ambur', 'Vaniyambadi', 'Jolarpet', 'Natrampalli', 'Alangayam', 'Tirupattur Town', 'Kandili'] },
  { slug: 'tiruvannamalai', name: 'Tiruvannamalai', nearby: ['vellore', 'villupuram', 'dharmapuri', 'ranipet'], neighborhoods: ['Polur', 'Cheyyar', 'Arani', 'Vandavasi', 'Chetpet', 'Tiruvannamalai Town', 'Thandrampet'] },
  { slug: 'tenkasi',        name: 'Tenkasi',        nearby: ['tirunelveli', 'virudhunagar', 'theni'],          neighborhoods: ['Sankarankovil', 'Kadayanallur', 'Alangulam', 'Courtallam', 'Sivagiri', 'Tenkasi Town', 'Veerakeralampudur'] },
  { slug: 'kallakurichi',   name: 'Kallakurichi',   nearby: ['villupuram', 'cuddalore', 'salem'],              neighborhoods: ['Sankarapuram', 'Rishivandiyam', 'Tirukoilur', 'Ulundurpet', 'Chinnasalem', 'Kallakurichi Town', 'Vriddhachalam'] },
  { slug: 'nilgiris',       name: 'The Nilgiris',   nearby: ['coimbatore', 'erode'],                           neighborhoods: ['Ooty', 'Coonoor', 'Gudalur', 'Kotagiri', 'Udhagamandalam', 'Kundah', 'Kothagiri'] },
];

export const DISTRICT_MAP = Object.fromEntries(DISTRICTS.map(d => [d.slug, d]));

// ── Category / Issue data ─────────────────────────────────────────────────────
// These slugs must match exactly what is stored in the `category_slug` DB column.
export const CATEGORIES = [
  {
    slug: 'power-cut',
    name: 'Power Cut',
    plural: 'Power Cuts',
    // Used in meta description — what Google's snippet will show
    descriptionFragment: 'electricity outages and TANGEDCO power disruptions',
    // Used in "How to complain" section  
    authority: 'TANGEDCO (Tamil Nadu Generation and Distribution Corporation)',
    helpline: '1912',
  },
  {
    slug: 'water-issue',
    name: 'Water Issue',
    plural: 'Water Issues',
    descriptionFragment: 'water supply failures, pipeline leaks, and TWAD complaints',
    authority: 'TWAD Board / Municipal Corporation Water Department',
    helpline: '1800 425 3555',
  },
  {
    slug: 'road-problem',
    name: 'Road Problem',
    plural: 'Road Problems',
    descriptionFragment: 'road damage, potholes, and NHAI highway complaints',
    authority: 'Tamil Nadu Highways Department / Municipal Corporation',
    helpline: '1800 425 0110',
  },
  {
    slug: 'scam',
    name: 'Scam Alert',
    plural: 'Scam Alerts',
    descriptionFragment: 'online fraud, cyber scam warnings, and public safety alerts',
    authority: 'Tamil Nadu Cyber Crime Police',
    helpline: '1930',
  },
  {
    slug: 'jobs',
    name: 'Job',
    plural: 'Jobs',
    descriptionFragment: 'government and private job listings posted by the community',
    authority: 'Tamil Nadu Employment Exchange',
    helpline: '1800 425 1545',
  },
  {
    slug: 'stay',
    name: 'Room / Stay',
    plural: 'Rooms & Stays',
    descriptionFragment: 'rooms for rent, PG accommodations, and housing listings',
    authority: null,
    helpline: null,
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]));
