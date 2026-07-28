import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { EDITORIAL_TEAM_ID, ORGANIZATION_ID, SITE_URL } from '@/lib/schemaIdentity';

const canonical = `${SITE_URL}/authors/vizhitn-editorial-team`;

export const metadata = {
  title: 'VizhiTN Editorial Team',
  description: 'Editorial role, standards, coverage, and contact path for the VizhiTN Editorial Team.',
  alternates: { canonical: canonical },
};

export default function Page() {
  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${canonical}#profile`,
    url: canonical,
    name: 'VizhiTN Editorial Team',
    mainEntity: {
      '@type': 'Organization',
      '@id': EDITORIAL_TEAM_ID,
      name: 'VizhiTN Editorial Team',
      url: canonical,
      parentOrganization: { '@id': ORGANIZATION_ID },
    },
  };

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Authors and Editors', href: '/authors' },
        { name: 'VizhiTN Editorial Team', href: '/authors/vizhitn-editorial-team' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Organizational author</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">VizhiTN Editorial Team</h1>
        <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
          This byline represents VizhiTN&apos;s editorial function rather than a named individual. It prepares and reviews civic-news summaries, explainers, source links, headlines, and corrections under the published editorial standards.
        </p>
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coverage and standards</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
            <li>Tamil Nadu civic services, local public-interest updates, safety information, and practical official resources.</li>
            <li>Primary-source attribution and clear separation of citizen reports from official confirmation.</li>
            <li>Material corrections handled under the Corrections Policy.</li>
            <li>No claim of government affiliation or subject-matter qualification beyond what is explicitly disclosed.</li>
          </ul>
        </section>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-blue-600">
          <Link href="/editorial-policy" className="hover:underline">Editorial Policy</Link>
          <Link href="/corrections" className="hover:underline">Corrections Policy</Link>
          <Link href="/contact" className="hover:underline">Contact the team</Link>
        </div>
      </main>
    </>
  );
}
