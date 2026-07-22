import Link from 'next/link';

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
        className="mx-auto w-full max-w-7xl px-4 pt-4 text-xs text-slate-500 sm:px-6 lg:px-8"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((crumb, index) => {
            const isCurrent = index === crumbs.length - 1;
            return (
              <li key={`${crumb.url}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">›</span>}
                {isCurrent ? (
                  <span aria-current="page" className="font-medium text-slate-700 dark:text-slate-300">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-blue-600 hover:underline">
                    {crumb.name}
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
