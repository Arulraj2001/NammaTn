export function shouldIndexCityIssuePage({ dataAvailable, reportCount }) {
  // An outage is not evidence that a page has no reports. Preserve the current
  // indexing state until the data source can make a reliable decision.
  if (!dataAvailable) return true;

  return Number.isFinite(reportCount) && reportCount > 0;
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
