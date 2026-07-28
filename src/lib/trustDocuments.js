export const TRUST_LAST_UPDATED = '22 July 2026';

export const TRUST_DOCUMENTS = {
  editorial: {
    title: 'Editorial Policy',
    summary: 'How VizhiTN separates citizen reports, official information, editorial reporting, and automated assistance.',
    sections: [
      {
        heading: 'Our role',
        paragraphs: ['VizhiTN is an independent, non-government public-interest platform. Publishing a report on VizhiTN is not the same as filing an official complaint. We link readers to official channels when they are available.'],
      },
      {
        heading: 'Content labels',
        items: [
          'Citizen report: submitted by a user and not treated as an established fact.',
          'Community confirmation: other users have signalled that they observed a similar issue; this is not government or editorial verification.',
          'Official notice: attributed and linked to the issuing authority wherever possible.',
          'Editorial report: researched or summarized by the VizhiTN Editorial Team and subject to this policy.',
          'Automated assistance: machine-supported classification, translation, or summarization that remains subject to human review before editorial publication.',
        ],
      },
      {
        heading: 'Editorial standards',
        items: [
          'Prefer primary official sources and identify the source of material claims.',
          'Distinguish allegations, eyewitness accounts, estimates, and confirmed official information.',
          'Avoid publishing unnecessary personal data or identifying vulnerable people.',
          'Do not allow advertisers, sponsors, political organizations, or public authorities to buy favourable coverage or civic-status changes.',
          'Correct material errors transparently and update the modification date only when content changes.',
        ],
      },
      {
        heading: 'Contact the editorial team',
        paragraphs: ['Send corrections, source concerns, or conflicts-of-interest information through the Contact page. Include the page URL and the exact statement you believe needs review.'],
      },
    ],
  },
  corrections: {
    title: 'Corrections Policy',
    summary: 'How to request a correction and how VizhiTN handles material errors, clarifications, and removals.',
    sections: [
      {
        heading: 'Requesting a correction',
        items: [
          'Use the Contact page and provide the affected URL, disputed text, supporting evidence, and a way to contact you.',
          'For personal-data or immediate-safety concerns, clearly mark the request as urgent.',
          'A correction request does not guarantee removal; public-interest, legal, safety, and evidentiary factors are considered.',
        ],
      },
      {
        heading: 'What happens next',
        items: [
          'The team checks the original source, submitted evidence, publication context, and any relevant official record.',
          'Material factual errors are corrected in the content and the genuine modification date is updated.',
          'Clarifications are labelled when the original wording was technically accurate but could mislead readers.',
          'Content may be restricted or removed when it exposes personal data, creates a safety risk, violates policy, or cannot be responsibly maintained.',
        ],
      },
      {
        heading: 'Correction transparency',
        paragraphs: ['Editorial articles should carry a visible correction or update note when a material change affects the meaning. Minor spelling, formatting, or accessibility changes may be made without a correction note.'],
      },
    ],
  },
  verification: {
    title: 'Verification Methodology',
    summary: 'What VizhiTN status labels mean—and, just as importantly, what they do not mean.',
    sections: [
      {
        heading: 'Status meanings',
        items: [
          'Reported: a submission is visible after automated and/or moderation checks; the underlying claim has not necessarily been independently verified.',
          'Community confirmed: multiple community signals indicate similar observations. It does not mean VizhiTN or a government authority has confirmed the claim.',
          'Official complaint filed: a contributor supplied a complaint reference or evidence of filing. VizhiTN does not guarantee that the reference is valid unless an official source confirms it.',
          'Claimed fixed: a contributor reports that conditions improved; further community evidence may still be requested.',
          'Community confirmed fixed: community evidence supports resolution. This remains distinct from an official authority statement.',
        ],
      },
      {
        heading: 'Evidence considered',
        items: [
          'Time- and location-relevant photographs or documents, with sensitive information removed where possible.',
          'Independent community confirmations and follow-up submissions.',
          'Official complaint references, department notices, and primary-source links.',
          'Consistency with known location, category, timing, and duplicate reports.',
        ],
      },
      {
        heading: 'Limits of verification',
        paragraphs: ['Moderation checks safety and policy compliance; it is not a guarantee that every factual claim is true. Readers should use official emergency and grievance channels for urgent or legally consequential matters.'],
      },
    ],
  },
  community: {
    title: 'Community Guidelines',
    summary: 'Rules for safe, useful, and fair participation on VizhiTN.',
    sections: [
      {
        heading: 'Contribute responsibly',
        items: [
          'Describe what you directly observed and separate facts from assumptions.',
          'Use accurate locations and dates without publishing private home addresses unnecessarily.',
          'Upload only media you created or have permission to share.',
          'Use official emergency services for immediate danger; VizhiTN is not an emergency dispatcher.',
        ],
      },
      {
        heading: 'Not allowed',
        items: [
          'Doxxing, private phone numbers, identity documents, medical records, faces of minors, or other unnecessary sensitive data.',
          'Threats, harassment, hate speech, sexual exploitation, graphic violence, or instructions for wrongdoing.',
          'Unsubstantiated accusations identifying private individuals as criminals or corrupt actors.',
          'Spam, impersonation, coordinated manipulation, fake engagement, or undisclosed commercial promotion.',
          'Copyright infringement or deceptive editing of evidence.',
        ],
      },
      {
        heading: 'Enforcement',
        paragraphs: ['VizhiTN may limit distribution, request edits, remove content, suspend access, preserve evidence, or refer credible threats and illegal material to appropriate services. Appeals can be submitted through the Contact page.'],
      },
    ],
  },
  moderation: {
    title: 'Moderation Policy',
    summary: 'How automated checks and human moderation are used across reports, comments, media, listings, and community features.',
    sections: [
      {
        heading: 'Moderation layers',
        items: [
          'File-type, size, text-safety, and abuse checks may run before or after submission.',
          'Potentially sensitive, high-risk, duplicated, or frequently reported material may be queued for human review.',
          'Approved means allowed under platform policy; it does not mean every factual claim has been independently verified.',
          'Public feeds exclude content marked pending or hidden by moderation controls where the relevant data supports those states.',
        ],
      },
      {
        heading: 'Priority review',
        paragraphs: ['Threats, personal data, child-safety risks, medical emergencies, communal hostility, targeted allegations, and manipulated evidence receive heightened review. Immediate danger should be reported to emergency services first.'],
      },
      {
        heading: 'Appeals and records',
        paragraphs: ['Users may appeal moderation decisions through the Contact page. Administrators can record actions and notes in the moderation log. Records are retained only as needed for safety, accountability, legal compliance, and abuse prevention.'],
      },
    ],
  },
  ownership: {
    title: 'Ownership and Funding',
    summary: 'What is currently public about VizhiTN’s operation, funding, advertising, and editorial independence.',
    sections: [
      {
        heading: 'Publisher identity',
        paragraphs: ['VizhiTN is presented publicly as an independently operated, non-government digital platform serving Tamil Nadu. The repository does not contain a verified legal-entity name, founder biography, or registered-office address, so this page does not invent those details. The operator should add the legally accurate identity here before AdSense or other formal publisher review.'],
      },
      {
        heading: 'Funding and revenue',
        paragraphs: ['VizhiTN may support operating costs through donations, clearly labelled sponsorships, local advertising, or advertising networks. The public ads.txt file currently states that no advertising seller is authorized. This disclosure must be updated when a genuine publisher relationship begins.'],
      },
      {
        heading: 'Independence rules',
        items: [
          'Payment cannot purchase a civic-status change, community confirmation, moderation outcome, or favourable editorial conclusion.',
          'Sponsored placements and paid listings must be visibly labelled.',
          'Sponsors do not receive private user data through their sponsorship.',
          'Material conflicts of interest should be disclosed on the relevant content.',
        ],
      },
    ],
  },
  sources: {
    title: 'Sources and Fact-Checking',
    summary: 'How VizhiTN evaluates official sources, community evidence, editorial summaries, and changing public-service information.',
    sections: [
      {
        heading: 'Source order',
        items: [
          'Primary official sources: department websites, government orders, official notices, helplines, and public records.',
          'Direct evidence: contributor photographs, documents, complaint receipts, and firsthand accounts.',
          'Independent secondary sources: reputable reporting and specialist material that identifies its own evidence.',
          'Automated or aggregated material: used as a discovery aid, never as the sole basis for a consequential factual claim.',
        ],
      },
      {
        heading: 'Changing information',
        paragraphs: ['Helplines, eligibility rules, fees, office procedures, and portal URLs can change. Resource pages should show a genuine reviewed date only after a person checks the listed primary sources. Users should confirm consequential information on the linked official website.'],
      },
      {
        heading: 'Fact-checking standard',
        paragraphs: ['The level of checking should match the risk of the claim. Allegations, scams, medical information, legal procedures, public-safety notices, and claims about named people require stronger evidence and cautious wording.'],
      },
    ],
  },
  advertising: {
    title: 'Advertising and Sponsorship Policy',
    summary: 'How VizhiTN separates commercial support from civic reporting, moderation, and public-interest content.',
    sections: [
      {
        heading: 'Clear labelling',
        items: [
          'Paid content, sponsored listings, and advertisements must be labelled in language visible to users.',
          'Sponsored links use appropriate relationship attributes where technically applicable.',
          'Advertising must not imitate navigation, official notices, report controls, or emergency actions.',
        ],
      },
      {
        heading: 'Restricted placements',
        paragraphs: ['Ads are not intended for account, creation, search, private communication, upload, emergency-request, or administration screens. Sensitive allegations and unreviewed user-generated content should not be monetized.'],
      },
      {
        heading: 'Commercial independence',
        paragraphs: ['Advertisers and sponsors cannot alter community signals, official complaint records, moderation decisions, rankings presented as civic evidence, or editorial conclusions.'],
      },
    ],
  },
};
