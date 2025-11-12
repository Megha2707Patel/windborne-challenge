export default function Controls({ refreshing, onRefresh, filter, setFilter }) {
  return (
    <div className="card">
      <div className="row">
        <button className="button" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh 24h Data"}
        </button>

        <input
          className="input"
          placeholder="Filter by Balloon ID…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ minWidth: 280 }}
        />

        <span className="small">
          Source: <code className="mono">https://a.windbornesystems.com/treasure/00..23.json</code>
        </span>
      </div>
    </div>
  );
}
