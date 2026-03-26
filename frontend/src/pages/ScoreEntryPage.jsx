import { useEffect, useState } from "react";
import { api } from "../api/http.js";

export function ScoreEntryPage() {
  const [score, setScore] = useState(1);
  const [scores, setScores] = useState([]);
  const [message, setMessage] = useState("");

  async function loadScores() {
    const res = await api.get("/scores/me");
    setScores(res.data.scores || []);
  }

  useEffect(() => {
    loadScores();
  }, []);

  async function submitScore(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/scores/me", { score: Number(score) });
      setMessage("Score saved. Last 5 rule applied automatically.");
      await loadScores();
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not save score");
    }
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">Score Entry</h1>
      <form onSubmit={submitScore} className="max-w-md rounded-xl border bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm text-slate-600">Score (1-45)</label>
        <input
          type="number"
          min={1}
          max={45}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="mb-3 w-full rounded-lg border p-2"
        />
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-white">Add Score</button>
        {message ? <p className="mt-2 text-sm">{message}</p> : null}
      </form>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Recent Scores</h2>
        <ul className="space-y-1 text-sm">
          {scores.map((s) => (
            <li key={s.id}>
              {s.score} - {new Date(s.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

