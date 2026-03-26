import { useEffect, useState } from "react";
import { api } from "../api/http.js";

export function DrawResultsPage() {
  const [draws, setDraws] = useState([]);
  const [matchInfo, setMatchInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/draws")
      .then((res) => setDraws(res.data.draws || []))
      .catch(() => setMessage("Failed to load draws"));
  }, []);

  async function checkMatch(drawId) {
    setMessage("");
    try {
      const res = await api.get(`/winners/${drawId}/match`);
      setMatchInfo(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to compute match");
    }
  }

  async function claim(drawId) {
    setMessage("");
    try {
      await api.post(`/winners/${drawId}/claim`);
      setMessage("Claim submitted. Upload proof URL next.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not submit claim");
    }
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">Draw Results</h1>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      {matchInfo ? (
        <div className="rounded-xl border bg-white p-4 text-sm shadow-sm">
          Match count: {matchInfo.matches} | Match type: {matchInfo.match_type}
        </div>
      ) : null}
      <div className="grid gap-3">
        {draws.map((d) => (
          <div key={d.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="font-medium">Month: {d.month}</p>
            <p className="text-sm text-slate-600">Numbers: {(d.numbers || []).join(", ")}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded-lg border px-3 py-1.5 text-sm"
                onClick={() => checkMatch(d.id)}
                type="button"
              >
                Check Match
              </button>
              <button
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white"
                onClick={() => claim(d.id)}
                type="button"
              >
                Claim Win
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

