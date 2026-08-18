export function shouldIndexCityIssuePage({ dataAvailable, reportCount }) {
  // EDITORIAL POLICY:
  // These city/issue pages have substantial standalone editorial content
  // (intro copy, FAQs, official complaint channels, nearby districts, and
  // official contact resources). Index them regardless of live report count.
  //
  // We ONLY use `noindex` when the data source is down and we cannot
  // confirm the page has any valid content at all — this avoids serving
  // an empty shell to search engines.
  if (!dataAvailable) return false; // data outage → don't index empty shell

  return true; // always index editorial city/issue pages, even with 0 reports
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
