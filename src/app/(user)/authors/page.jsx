import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Authors and Editors',
  description: 'Meet the disclosed authors and editorial teams responsible for VizhiTN public-interest content.',
  alternates: { canonical: '/authors' },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Authors and Editors', href: '/authors' }]} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Authors and Editors</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          VizhiTN identifies the person or organizational team responsible for editorial articles. Citizen reports remain attributed according to the contributor&apos;s chosen public or anonymous identity.
        </p>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Organizational author</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">VizhiTN Editorial Team</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The default organizational byline for civic-news summaries and public-interest explainers. No individual editor biography has yet been verified for publication.
          </p>
          <Link href="/authors/vizhitn-editorial-team" className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:underline">
            View editorial profile →
          </Link>
        </section>
      </main>
    </>
  );
}
