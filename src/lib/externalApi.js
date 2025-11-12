/**
 * External dataset adapter — uses Open-Meteo (public, no API key).
 * For each balloon, we query current conditions at the latest lat/lon.
 *
 * Include this in your POST notes:
 * "I chose Open-Meteo because it’s public, no-key, and updates in real time for any coordinates."
 */

function withTimeout(promise, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return promise.finally(() => clearTimeout(id));
}

async function safeJson(url) {
  try {
    const res = await withTimeout(fetch(url, { cache: "no-store" }), 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchExternalForPoints(points) {
  try {
    const latest = points?.at(-1);
    const lat = latest?.lat;
    const lon = latest?.lon;

    if (!isFinite(lat) || !isFinite(lon)) {
      return { source: "Open-Meteo", note: "No valid coordinates for this balloon." };
    }

    // Prefer "current" block; fallback to legacy "current_weather"
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lon)}` +
      `&current=temperature_2m,wind_speed_10m,wind_direction_10m`;

    const data = await safeJson(url);
    if (!data) return { source: "Open-Meteo", note: "External dataset temporarily unavailable." };

    let temperatureC, windSpeed, windDirectionDeg, units = {};

    if (data.current && data.current?.temperature_2m != null) {
      temperatureC = data.current.temperature_2m;
      windSpeed = data.current.wind_speed_10m;
      windDirectionDeg = data.current.wind_direction_10m;
      units = data.current_units || { temperature_2m: "°C", wind_speed_10m: "", wind_direction_10m: "°" };
    } else if (data.current_weather && data.current_weather?.temperature != null) {
      temperatureC = data.current_weather.temperature;
      windSpeed = data.current_weather.windspeed;          // km/h
      windDirectionDeg = data.current_weather.winddirection;
      units = { temperature_2m: "°C", wind_speed_10m: "km/h", wind_direction_10m: "°" };
    }

    const metrics = {};
    if (Number.isFinite(temperatureC))      metrics.temperatureC = Number(temperatureC);
    if (Number.isFinite(windSpeed))         metrics.windSpeed = Number(windSpeed);
    if (Number.isFinite(windDirectionDeg))  metrics.windDirectionDeg = Number(windDirectionDeg);

    return {
      source: "Open-Meteo",
      note: "I chose Open-Meteo because it’s public, no-key, and updates in real time for any coordinates.",
      coords: { lat, lon },
      units,
      metrics
    };
  } catch {
    return { source: "Open-Meteo", note: "Failed to fetch external data." };
  }
}
