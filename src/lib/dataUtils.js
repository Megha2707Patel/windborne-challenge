const R = 6371e3; // meters
const toRad = (x) => x * Math.PI / 180;

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function totalTrackDistance(points) {
  if (!points || points.length < 2) return 0;
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (isFinite(a?.lat) && isFinite(a?.lon) && isFinite(b?.lat) && isFinite(b?.lon)) {
      d += haversineDistance(a.lat, a.lon, b.lat, b.lon);
    }
  }
  return d;
}
