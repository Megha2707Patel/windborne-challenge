// Robustly fetch 00..23.json (last 24h), tolerate undocumented/corrupted shapes,
// build per-balloon tracks + a constellation list (latest position + history)

const BASE = "https://a.windbornesystems.com/treasure";

/** Safe JSON fetch (skip malformed / HTTP errors) */
async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return null; // malformed JSON
    }
  } catch {
    return null; // network/HTTP error
  }
}

/**
 * Normalize likely shapes into:
 * { id, lat, lon, ts, _hourIndex }
 *
 * Handles both:
 *  - WindBorne array format: [lat, lon, alt, (optional ts...)]
 *  - Object shapes: { lat, lon, ts, id, ... }
 */
function normalizeRecord(raw, hourIndex) {
  if (!raw) return null;

  let lat = null;
  let lon = null;
  let ts = null;
  let id = null;

  // Case 1: WindBorne array shape: [lat, lon, alt, maybeTs?]
  if (Array.isArray(raw)) {
    if (typeof raw[0] === "number" && typeof raw[1] === "number") {
      lat = raw[0];
      lon = raw[1];

      // If there is a 4th element, treat it as a possible timestamp
      if (
        raw.length > 3 &&
        (typeof raw[3] === "number" || typeof raw[3] === "string")
      ) {
        ts = raw[3];
      }
    } else {
      return null;
    }
  }
  // Case 2: Object shapes (fallbacks)
  else if (typeof raw === "object") {
    lat = raw.lat ?? raw.latitude ?? raw.Latitude ?? raw.y ?? null;
    lon = raw.lon ?? raw.lng ?? raw.longitude ?? raw.Longitude ?? raw.x ?? null;
    ts = raw.ts ?? raw.timestamp ?? raw.time ?? raw.observed_at ?? null;
    id =
      raw.id ??
      raw.track_id ??
      raw.balloon_id ??
      raw.name ??
      raw.uuid ??
      null;
  } else {
    return null;
  }

  if (typeof lat !== "number" || typeof lon !== "number") return null;

  return {
    id: id ?? `u_${hourIndex}_${lat.toFixed(4)}_${lon.toFixed(4)}_${ts ?? "na"}`,
    lat,
    lon,
    ts: typeof ts === "number" || typeof ts === "string" ? ts : null,
    _hourIndex: hourIndex,
  };
}

/** Build last-24h constellation and tracks */
export async function fetchWindborneHistory() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const urls = hours.map((h) => `${BASE}/${String(h).padStart(2, "0")}.json`);
  const snaps = await Promise.all(urls.map(safeFetchJson));

  const normalizedByHour = snaps.map((snap, hourIndex) => {
    if (!snap) return [];

    // If the snapshot is already an array, normalize each entry
    if (Array.isArray(snap)) {
      return snap.map((r) => normalizeRecord(r, hourIndex)).filter(Boolean);
    }

    // If it's an object, flatten nested arrays/objects if present
    if (snap && typeof snap === "object") {
      const candidates = [];
      for (const v of Object.values(snap)) {
        if (Array.isArray(v)) candidates.push(...v);
        else if (v && typeof v === "object") candidates.push(v);
      }
      return candidates.map((r) => normalizeRecord(r, hourIndex)).filter(Boolean);
    }

    return [];
  });

  /** group by id */
  const tracks = {};
  normalizedByHour.forEach((records) => {
    records.forEach((rec) => {
      const key = rec.id;
      if (!tracks[key]) tracks[key] = { id: key, points: [] };
      tracks[key].points.push({
        lat: rec.lat,
        lon: rec.lon,
        ts: rec.ts,
        h: rec._hourIndex,
      });
    });
  });

  /** sort each track oldest(23) -> newest(0) */
  for (const t of Object.values(tracks)) {
    t.points.sort((a, b) => b.h - a.h);
  }

  /** constellation with latest position + full history */
  const constellation = Object.values(tracks).map((t) => {
    const latest = t.points[t.points.length - 1] ?? null;
    return {
      id: t.id,
      latestLat: latest?.lat ?? null,
      latestLon: latest?.lon ?? null,
      history: t.points,
    };
  });

  return { constellation, tracks, rawHours: normalizedByHour };
}
