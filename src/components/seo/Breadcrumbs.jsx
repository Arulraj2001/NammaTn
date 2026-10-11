import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const SITE_URL = 'https://www.vizhitn.in';

function normalizeItems(items) {
  const crumbs = [{ name: 'Home', href: '/' }, ...(items || [])];
  return crumbs.map(crumb => ({
    ...crumb,
    url: crumb.href?.startsWith('http') ? crumb.href : `${SITE_URL}${crumb.href || '/'}`,
  }));
}

export function BreadcrumbJsonLd({ items }) {
  const crumbs = normalizeItems(items);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function Breadcrumbs({ items }) {
  const crumbs = normalizeItems(items);

  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto w-full max-w-7xl px-4 pt-3 pb-1 text-xs sm:px-6 lg:px-8"
      >
        <ol className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {crumbs.map((crumb, index) => {
            const isCurrent = index === crumbs.length - 1;
            const isHome = index === 0;

            return (
              <li key={`${crumb.url}-${index}`} className="flex items-center gap-1.5 flex-shrink-0">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-civic-400 dark:text-civic-600 stroke-[2] flex-shrink-0" aria-hidden="true" />
                )}
                {isCurrent ? (
                  <span
                    aria-current="page"
                    className="font-bold text-civic-900 dark:text-white truncate max-w-[240px] sm:max-w-md"
                    title={crumb.name}
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-civic-600 dark:text-slate-400 dark:hover:text-civic-300 font-medium transition-colors"
                  >
                    {isHome && <Home className="w-3.5 h-3.5 text-civic-500 flex-shrink-0" />}
                    <span>{crumb.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
