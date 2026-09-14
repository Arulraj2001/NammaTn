export function shouldIndexCityIssuePage({ dataAvailable, reportCount }) {
  // EDITORIAL POLICY:
  // These city/issue pages have substantial standalone editorial content
  // (intro copy, FAQs, official complaint channels, nearby districts, and
  // official contact resources). Index them regardless of live report count
  // or temporary data-source outages.
  //
  // These are public-facing pages and must NOT emit noindex/runtime NOINDEX,
  // even when the DB is briefly unreachable (that previously caused Google to
  // mark these pages as "Excluded by noindex").
  return true;
}

export function getCityIssueRobots(dataState) {
  const index = shouldIndexCityIssuePage(dataState);

  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  };
}
