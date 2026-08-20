// src/lib/seo/authorityEngine.js
// Authority Injection System — E-E-A-T signal builder for /[city]/[issue]/ pages.
// Selects the correct civic authority, contact details, and escalation path per
// city × issue combination. Pure computation, no DB calls, ISR-safe.

import { DISTRICT_MAP, CATEGORY_MAP } from '@/lib/seo-data';

// ── Authority entity registry ─────────────────────────────────────────────────
// Maps issue slugs to structured civic authority data.
// Each entry: primary authority + escalation chain + structured entity.
const AUTHORITY_REGISTRY = {
  'power-cut': {
    entity:         'TANGEDCO',
    fullName:       'Tamil Nadu Generation and Distribution Corporation Limited',
    department:     'TANGEDCO Distribution Circle',
    primaryHelpline:'1912',
    secondaryHelpline: '044-28521022',
    onlinePortal:   'https://www.tangedco.gov.in',
    complaintPortal:'https://www.tangedco.gov.in/grievance.html',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Sub-Division Assistant Engineer (AE)',
      'Junior Engineer (JE) of concerned feeder',
      'Distribution Circle (DC) office',
      'TANGEDCO Regional Chief Engineer',
      'Tamil Nadu Electricity Regulatory Commission (TNERC)',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'TANGEDCO',
      description:   'Tamil Nadu power distribution authority responsible for electricity supply and outage restoration.',
      telephone:     '1912',
      url:           'https://www.tangedco.gov.in',
    },
  },

  'water-issue': {
    entity:         'TWAD Board',
    fullName:       'Tamil Nadu Water Supply and Drainage Board',
    department:     'Water Supply Division',
    primaryHelpline:'1800 425 3555',
    secondaryHelpline: '044-28521023',
    onlinePortal:   'https://www.twadboard.gov.in',
    complaintPortal:'https://www.twadboard.gov.in/complaints',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Municipal Corporation Water Division (for urban areas)',
      'TWAD Board Division Engineer',
      'TWAD Board Superintending Engineer',
      'Commissioner, Municipal Administration',
      'District Collector Water Supply Cell',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'TWAD Board',
      description:   'Tamil Nadu Water Supply and Drainage Board — responsible for urban water supply, maintenance, and grievance resolution.',
      telephone:     '1800 425 3555',
      url:           'https://www.twadboard.gov.in',
    },
  },

  'road-problem': {
    entity:         'Tamil Nadu Highways Department',
    fullName:       'Tamil Nadu Highways and Minor Ports Department',
    department:     'Roads & Buildings Division',
    primaryHelpline:'1800 425 0110',
    secondaryHelpline: '044-28521024',
    onlinePortal:   'https://www.tnhighways.gov.in',
    complaintPortal:'https://www.tnhighways.gov.in/road-complaints',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Municipal Corporation Roads Division (urban)',
      'NHAI Project Director (national highways)',
      'District Collector Roads Cell',
      'Executive Engineer, Tamil Nadu Highways',
      'Commissioner, Municipal Administration',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu Highways Department',
      description:   'State authority for road construction, maintenance, and public safety on Tamil Nadu roads.',
      telephone:     '1800 425 0110',
      url:           'https://www.tnhighways.gov.in',
    },
  },

  'scam': {
    entity:         'Tamil Nadu Cyber Crime Police',
    fullName:       'Tamil Nadu Police Cyber Crime Wing',
    department:     'Cyber Crime Police Station',
    primaryHelpline:'1930',
    secondaryHelpline: '044-22300062',
    onlinePortal:   'https://cybercrime.gov.in',
    complaintPortal:'https://cybercrime.gov.in/Webform/Accept.aspx',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Local Cyber Crime Police Station (file FIR)',
      'National Cyber Crime Reporting Portal (cybercrime.gov.in)',
      'I4C — Indian Cyber Crime Coordination Centre',
      'RBI Banking Ombudsman (for UPI/banking fraud)',
    ],
    schemaCivicEntity: {
      '@type':      'PoliceStation',
      name:          'Tamil Nadu Cyber Crime Police',
      description:   'Tamil Nadu police unit handling online fraud, financial scams, and cyber crime investigations.',
      telephone:     '1930',
      url:           'https://cybercrime.gov.in',
    },
  },

  'jobs': {
    entity:         'Tamil Nadu Employment Exchange',
    fullName:       'Tamil Nadu Department of Employment and Training',
    department:     'District Employment Office',
    primaryHelpline:'1800 425 1545',
    secondaryHelpline: '044-28521100',
    onlinePortal:   'https://www.tnvelaivaaippu.gov.in',
    complaintPortal:'https://www.tnvelaivaaippu.gov.in/grievance',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'District Employment Officer',
      'Joint Director, Employment Exchange',
      'Commissioner, Employment and Training',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu Employment Exchange',
      description:   'Tamil Nadu department managing employment registration, job placements, and career guidance.',
      telephone:     '1800 425 1545',
      url:           'https://www.tnvelaivaaippu.gov.in',
    },
  },

  'stay': {
    entity:         'Municipal Corporation Housing Division',
    fullName:       'Tamil Nadu Housing Board / Municipal Corporation',
    department:     'Housing and Rental Registrations',
    primaryHelpline:'1800 425 2145',
    secondaryHelpline: null,
    onlinePortal:   'https://www.tn.gov.in',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Local Municipal Corporation Office',
      'Tamil Nadu Housing Board',
      'District Collector Housing Cell',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu Housing Board',
      description:   'Authority for housing registration, rental dispute resolution, and accommodation guidelines in Tamil Nadu.',
      telephone:     '1800 425 2145',
      url:           'https://www.tn.gov.in',
    },
  },

  'education': {
    entity:         'School Education Department',
    fullName:       'Department of School Education, Govt of Tamil Nadu',
    department:     'Chief Educational Office (CEO)',
    primaryHelpline:'14417',
    secondaryHelpline: '044-28278796',
    onlinePortal:   'https://tnschools.gov.in',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'District Educational Officer (DEO)',
      'Chief Educational Officer (CEO)',
      'Director of School Education',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu School Education Department',
      description:   'Department responsible for school education and student welfare in Tamil Nadu.',
      telephone:     '14417',
      url:           'https://tnschools.gov.in',
    },
  },

  'government-schemes': {
    entity:         'Government of Tamil Nadu Welfare Cell',
    fullName:       'Social Welfare and Women Empowerment Department',
    department:     'District Social Welfare Office',
    primaryHelpline:'1100',
    secondaryHelpline: '044-25670900',
    onlinePortal:   'https://www.tn.gov.in/schemes',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Block Development Officer (BDO)',
      'District Social Welfare Officer (DSWO)',
      'District Collector Welfare Cell',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Government of Tamil Nadu Social Welfare',
      description:   'Department facilitating state welfare schemes and public beneficiary services in Tamil Nadu.',
      telephone:     '1100',
      url:           'https://www.tn.gov.in',
    },
  },

  'general': {
    entity:         'District Public Grievances Cell',
    fullName:       'District Administration & Municipal Administration',
    department:     'Public Grievances Department',
    primaryHelpline:'1100',
    secondaryHelpline: '044-25303600',
    onlinePortal:   'https://grievance.tn.gov.in',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Tahsildar / Zonal Officer',
      'Revenue Divisional Officer (RDO)',
      'District Collector Office',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu Public Grievances Cell',
      description:   'Public grievance redressal system for Tamil Nadu residents.',
      telephone:     '1100',
      url:           'https://grievance.tn.gov.in',
    },
  },

  'healthcare': {
    entity:         'Health & Family Welfare Department',
    fullName:       'Health & Family Welfare Department, Govt of Tamil Nadu',
    department:     'District Medical Officer Office',
    primaryHelpline:'104',
    secondaryHelpline: '108',
    onlinePortal:   'https://www.tnhealth.tn.gov.in',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Primary Health Centre Medical Officer',
      'Deputy Director of Health Services (DDHS)',
      'District Medical Officer',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Health & Family Welfare Department',
      description:   'Department overseeing public healthcare facilities and emergency health services in Tamil Nadu.',
      telephone:     '104',
      url:           'https://www.tnhealth.tn.gov.in',
    },
  },

  'environment': {
    entity:         'Tamil Nadu Pollution Control Board (TNPCB)',
    fullName:       'Tamil Nadu Pollution Control Board',
    department:     'Environmental Standards & Pollution Control',
    primaryHelpline:'044-22200909',
    secondaryHelpline: '044-22200900',
    onlinePortal:   'https://tnpcb.gov.in',
    complaintPortal:'https://tnpcb.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'District Environmental Engineer (DEE)',
      'Joint Chief Environmental Engineer',
      'Chairman, TNPCB',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu Pollution Control Board',
      description:   'State agency regulating environmental protection and pollution control in Tamil Nadu.',
      telephone:     '044-22200909',
      url:           'https://tnpcb.gov.in',
    },
  },

  'public-safety': {
    entity:         'Tamil Nadu Police Department',
    fullName:       'Tamil Nadu Police Department',
    department:     'Law & Order Division',
    primaryHelpline:'100',
    secondaryHelpline: '112',
    onlinePortal:   'https://eservices.tnpolice.gov.in',
    complaintPortal:'https://eservices.tnpolice.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Inspector of Police (Local Station)',
      'Deputy Superintendent of Police (DSP)',
      'Superintendent of Police (SP) / City Commissioner',
    ],
    schemaCivicEntity: {
      '@type':      'PoliceStation',
      name:          'Tamil Nadu Police Department',
      description:   'State law enforcement agency ensuring public safety and order across Tamil Nadu.',
      telephone:     '100',
      url:           'https://eservices.tnpolice.gov.in',
    },
  },

  'local-development': {
    entity:         'Directorate of Town and Country Planning',
    fullName:       'Directorate of Town and Country Planning (DTCP)',
    department:     'Local Planning Authority',
    primaryHelpline:'044-28414844',
    secondaryHelpline: null,
    onlinePortal:   'https://www.tn.gov.in/tcp',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Member Secretary, Local Planning Authority',
      'District Collector Planning Cell',
      'Director of Town and Country Planning',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Directorate of Town and Country Planning',
      description:   'Authority overseeing urban planning, development permits, and civic infrastructure in Tamil Nadu.',
      telephone:     '044-28414844',
      url:           'https://www.tn.gov.in/tcp',
    },
  },

  'transport': {
    entity:         'Tamil Nadu State Transport Corporation',
    fullName:       'Tamil Nadu State Transport Department',
    department:     'Regional Transport Office (RTO)',
    primaryHelpline:'1800 425 6151',
    secondaryHelpline: '044-24794700',
    onlinePortal:   'https://tnsta.gov.in',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Regional Transport Officer (RTO)',
      'Deputy Transport Commissioner',
      'Transport Commissioner, Tamil Nadu',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Tamil Nadu State Transport Department',
      description:   'Department regulating public transport, licensing, and vehicle registrations in Tamil Nadu.',
      telephone:     '1800 425 6151',
      url:           'https://tnsta.gov.in',
    },
  },

  'agriculture': {
    entity:         'Agriculture and Farmers Welfare Department',
    fullName:       'Agriculture and Farmers Welfare Department, Tamil Nadu',
    department:     'Assistant Director of Agriculture Office',
    primaryHelpline:'1800 180 1551',
    secondaryHelpline: '044-28524896',
    onlinePortal:   'https://www.tnagrisnet.tn.gov.in',
    complaintPortal:'https://grievance.tn.gov.in',
    tnEgrievance:   'https://grievance.tn.gov.in',
    escalation: [
      'Assistant Director of Agriculture (Block level)',
      'Joint Director of Agriculture (JDA)',
      'Director of Agriculture, Tamil Nadu',
    ],
    schemaCivicEntity: {
      '@type':      'GovernmentOrganization',
      name:          'Agriculture and Farmers Welfare Department',
      description:   'Department supporting farmers, agricultural welfare schemes, and crop services in Tamil Nadu.',
      telephone:     '1800 180 1551',
      url:           'https://www.tnagrisnet.tn.gov.in',
    },
  },
};

// Per-city municipal body overrides for large corporations
const CITY_MUNICIPAL_BODIES = {
  'chennai':         { name: 'Greater Chennai Corporation (GCC)', helpline: '1913', url: 'https://www.chennaicorporation.gov.in' },
  'coimbatore':      { name: 'Coimbatore City Municipal Corporation (CCMC)', helpline: '0422-2399434', url: 'https://www.ccmc.gov.in' },
  'madurai':         { name: 'Madurai City Municipal Corporation (MCMC)', helpline: '0452-2345678', url: 'https://www.mcmc.tn.gov.in' },
  'tiruchirappalli': { name: 'Tiruchirappalli City Municipal Corporation (TCMC)', helpline: '0431-2414151', url: 'https://www.trichy.tn.gov.in' },
  'salem':           { name: 'Salem City Municipal Corporation (SCMC)', helpline: '0427-2233744', url: 'https://www.salem.tn.gov.in' },
  'tirunelveli':     { name: 'Tirunelveli City Municipal Corporation', helpline: '0462-2335070', url: 'https://www.tirunelveli.tn.gov.in' },
  'erode':           { name: 'Erode City Municipal Corporation', helpline: '0424-2257980', url: 'https://www.erode.tn.gov.in' },
  'vellore':         { name: 'Vellore City Municipal Corporation', helpline: '0416-2282344', url: 'https://www.vellore.tn.gov.in' },
  'thoothukudi':     { name: 'Thoothukudi City Municipal Corporation', helpline: '0461-2331012', url: 'https://www.tuticorin.tn.gov.in' },
};

// Issues where local municipal body is the primary authority (overrides generic authority)
const MUNICIPAL_PRIMARY_ISSUES = new Set(['road-problem', 'water-issue', 'stay']);

// ── Main API ───────────────────────────────────────────────────────────────────
/**
 * Returns structured authority data for a city × issue page.
 *
 * @param {string} citySlug
 * @param {string} issueSlug
 * @param {number} authorityBoostFactor  – from rankingFeedback (1.0 | 1.2 | 1.5)
 * @returns {{
 *   primaryEntity:     object,
 *   municipalBody:     object|null,
 *   escalationPath:    string[],
 *   schemaCivicEntity: object,
 *   authorityStatement:string,   // Rendered sentence for content injection
 *   contactBlock:      object,   // Title + content for content modules
 *   isBoosted:         boolean,
 * }}
 */
export function resolveAuthority(citySlug, issueSlug, authorityBoostFactor = 1.0) {
  const cityData  = DISTRICT_MAP[citySlug];
  const issueData = CATEGORY_MAP[issueSlug];
  const authority = AUTHORITY_REGISTRY[issueSlug];

  if (!authority || !cityData) {
    return {
      primaryEntity:      null,
      municipalBody:      null,
      escalationPath:     [],
      schemaCivicEntity:  null,
      authorityStatement: '',
      contactBlock:       null,
      isBoosted:          false,
    };
  }

  const cityName    = cityData.name;
  const municipal   = CITY_MUNICIPAL_BODIES[citySlug] || null;
  const useMunicipal = municipal && MUNICIPAL_PRIMARY_ISSUES.has(issueSlug);

  // Resolve which body is primary
  const primaryEntity = useMunicipal
    ? { name: municipal.name, helpline: municipal.helpline, url: municipal.url, fullName: municipal.name }
    : { name: authority.entity, helpline: authority.primaryHelpline, url: authority.onlinePortal, fullName: authority.fullName };

  const isBoosted = authorityBoostFactor >= 1.2;

  // Authority statement (injected into content)
  const authorityStatement = useMunicipal
    ? `${issueData.name} complaints in ${cityName} are handled by the ${municipal.name}. Contact: ${municipal.helpline}. Escalate unresolved issues at ${authority.tnEgrievance}.`
    : `${issueData.name} complaints in ${cityName} fall under the jurisdiction of ${authority.fullName} (${authority.entity}). Helpline: ${authority.primaryHelpline}. File online grievances at ${authority.complaintPortal}.`;

  // Content block for rendering in the page
  const contactBlock = {
    title:   `Official ${issueData.name} Complaint Channels in ${cityName}`,
    content: authorityStatement,
    helpline: primaryEntity.helpline,
    portal:   authority.complaintPortal,
    escalation: authority.escalation.slice(0, isBoosted ? 4 : 2),
  };

  // Clone schema entity and inject local city context
  const schemaCivicEntity = {
    ...authority.schemaCivicEntity,
    areaServed: {
      '@type':  'State',
      name:      'Tamil Nadu',
      addressRegion: cityData.name,
    },
  };

  return {
    primaryEntity,
    municipalBody:      municipal,
    escalationPath:     authority.escalation,
    schemaCivicEntity,
    authorityStatement,
    contactBlock,
    isBoosted,
  };
}

// ── All known authority entities for a given city (cross-issue) ───────────────
export function getAllCityAuthorities(citySlug) {
  return Object.keys(AUTHORITY_REGISTRY).map(issueSlug =>
    resolveAuthority(citySlug, issueSlug)
  );
}
