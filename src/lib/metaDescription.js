export function toMetaDescription(value, fallback = '', maxLength = 160) {
  const source = typeof value === 'string' && value.trim() ? value : fallback;
  const description = String(source || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (description.length <= maxLength) return description;

  const candidate = description.slice(0, maxLength - 1);
  const lastSpace = candidate.lastIndexOf(' ');
  const trimmed = (lastSpace >= Math.floor(maxLength * 0.7)
    ? candidate.slice(0, lastSpace)
    : candidate
  ).replace(/[,:;.!?\s-]+$/g, '');

  return `${trimmed}…`;
}

export function getDistrictMetaDescription(districtName) {
  return toMetaDescription(
    `Track civic complaints, resolutions and local alerts in ${districtName}, Tamil Nadu. Explore resident reports on power, water, roads, scams and community needs.`,
  );
}

export function getCityIssueMetaDescription(cityName, issueName) {
  return toMetaDescription(
    `Track ${issueName.toLowerCase()} reports in ${cityName}, Tamil Nadu. See citizen updates, local hotspots, helplines and responsible authorities on VizhiTN.`,
  );
}
