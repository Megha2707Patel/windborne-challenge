import { totalTrackDistance } from "../lib/dataUtils";

export default function BalloonList({ constellation, extSummaries }) {
  const rows = (constellation ?? []).map(b => {
    const drift = totalTrackDistance(b.history);
    const ext = extSummaries?.[b.id] ?? null;
    return { ...b, drift, ext };
  });

  if (!rows.length) {
    return <div className="card warn">No balloons found in the last 24h.</div>;
  }

  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Balloon ID</th>
            <th>Latest Position</th>
            <th>Total Drift (24h)</th>
            <th>External Dataset</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="mono">{r.id}</td>
              <td>
                {isFinite(r.latestLat) && isFinite(r.latestLon)
                  ? `${r.latestLat.toFixed(4)}, ${r.latestLon.toFixed(4)}`
                  : <span className="warn">unknown</span>}
              </td>
              <td>{(r.drift / 1000).toFixed(2)} km</td>
              <td className="small">
                {r.ext ? (
                  <>
                    <div className="kv">
                      <span><strong>source:</strong> {r.ext.source}</span>
                      {r.ext.coords && (
                        <span>
                          <strong>coords:</strong> {r.ext.coords.lat?.toFixed?.(2)}, {r.ext.coords.lon?.toFixed?.(2)}
                        </span>
                      )}
                      {r.ext.metrics?.temperatureC != null && (
                        <span><strong>T:</strong> {r.ext.metrics.temperatureC}{r.ext.units?.temperature_2m || "°C"}</span>
                      )}
                      {r.ext.metrics?.windSpeed != null && (
                        <span><strong>Wind:</strong> {r.ext.metrics.windSpeed} {r.ext.units?.wind_speed_10m || ""}</span>
                      )}
                      {r.ext.metrics?.windDirectionDeg != null && (
                        <span><strong>Dir:</strong> {r.ext.metrics.windDirectionDeg}°</span>
                      )}
                    </div>
                    <div>{r.ext.note}</div>
                  </>
                ) : (
                  <span className="warn">External data unavailable</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="small" style={{ marginTop: 8 }}>
        External dataset implemented in <code className="mono">src/lib/externalApi.js</code>.
      </div>
    </div>
  );
}
