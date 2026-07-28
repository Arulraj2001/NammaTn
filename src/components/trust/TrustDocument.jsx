import Breadcrumbs from '@/components/seo/Breadcrumbs';
import Link from 'next/link';

const TRUST_LINKS = [
  ['/editorial-policy', 'Editorial'],
  ['/verification-methodology', 'Verification'],
  ['/corrections', 'Corrections'],
  ['/moderation-policy', 'Moderation'],
  ['/community-guidelines', 'Community'],
  ['/ownership-and-funding', 'Ownership'],
  ['/sources', 'Sources'],
  ['/advertising-policy', 'Advertising'],
  ['/authors', 'Authors'],
];

export default function TrustDocument({ path, title, summary, lastUpdated, sections }) {
  return (
    <>
      <Breadcrumbs items={[
        { name: 'Trust Center', href: '/editorial-policy' },
        { name: title, href: path },
      ]} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <header className="border-b border-slate-200 pb-7 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">VizhiTN Trust Center</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{summary}</p>
          <p className="mt-4 text-xs text-slate-500">Last updated: {lastUpdated}</p>
        </header>

        <nav aria-label="Trust center policies" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200 pb-6 text-sm dark:border-slate-800">
          {TRUST_LINKS.map(([href, label]) => (
            <Link key={href} href={href} aria-current={href === path ? 'page' : undefined} className="font-semibold text-blue-600 hover:underline">
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 space-y-9">
          {sections.map(section => (
            <section key={section.heading} className="scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.heading}</h2>
              {section.paragraphs?.map(paragraph => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {paragraph}
                </p>
              ))}
              {section.items?.length > 0 && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {section.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
