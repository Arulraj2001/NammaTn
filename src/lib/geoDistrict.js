import { DISTRICTS, DISTRICT_COORDS } from './districts';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest Tamil Nadu district from GPS coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {{ slug: string, name_en: string, name_ta: string, distanceKm: number }}
 */
export function findNearestDistrict(latitude, longitude) {
  if (!latitude || !longitude) return null;

  let closest = null;
  let minDistance = Infinity;

  for (const [slug, coords] of Object.entries(DISTRICT_COORDS)) {
    const [distLat, distLon] = coords;
    const distance = calculateDistance(latitude, longitude, distLat, distLon);

    if (distance < minDistance) {
      minDistance = distance;
      const meta = DISTRICTS.find((d) => d.slug === slug) || {
        slug,
        name_en: slug.charAt(0).toUpperCase() + slug.slice(1),
        name_ta: slug,
      };
      closest = {
        slug,
        name_en: meta.name_en,
        name_ta: meta.name_ta,
        distanceKm: Math.round(distance),
      };
    }
  }

  return closest;
}
