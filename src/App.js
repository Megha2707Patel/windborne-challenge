import { useEffect, useMemo, useState } from "react";
import "./App.css";
import ErrorBanner from "./components/ErrorBanner";
import Controls from "./components/Controls";
import BalloonList from "./components/BalloonList";
import { fetchWindborneHistory } from "./lib/windborneApi";
import { fetchExternalForPoints } from "./lib/externalApi";

function App() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [constellation, setConstellation] = useState([]);
  const [tracks, setTracks] = useState({});
  const [filter, setFilter] = useState("");
  const [extSummaries, setExtSummaries] = useState({});

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { constellation, tracks } = await fetchWindborneHistory();
      setConstellation(constellation);
      setTracks(tracks);

      // external dataset summary per balloon
      const entries = await Promise.all(
        Object.values(tracks).map(async (t) => [t.id, await fetchExternalForPoints(t.points)])
      );
      setExtSummaries(Object.fromEntries(entries));
    } catch {
      setErr("Failed to load data robustly. Try Refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!filter) return constellation;
    const f = filter.toLowerCase();
    return constellation.filter(b => b.id.toLowerCase().includes(f));
  }, [filter, constellation]);

  return (
    <div className="app">
      <h1>WindBorne Constellation — Last 24 Hours</h1>
      <div className="small">
        Robustly parses hourly snapshots (00..23) and combines each balloon with an external public dataset (Open-Meteo).
      </div>

      <Controls
        refreshing={loading}
        onRefresh={load}
        filter={filter}
        setFilter={setFilter}
      />

      <ErrorBanner message={err} />

      <BalloonList
        constellation={filtered}
        extSummaries={extSummaries}
      />

      <hr />
      <div className="small">
        Created By - Megha Patel
      </div>
    </div>
  );
}

export default App;
