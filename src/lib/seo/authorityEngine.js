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
