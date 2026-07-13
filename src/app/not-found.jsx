import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          The page may have moved, or the district, category, or article does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Return to VizhiTN
        </Link>
      </div>
    </main>
  );
}
