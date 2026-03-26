import { useEffect, useState } from "react";
import { api } from "../api/http.js";

export function DashboardPage() {
  const [data, setData] = useState({
    subscription: null,
    scores: [],
    charity: null,
    draws: [],
    winners: []
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [subscriptionRes, scoresRes, charityRes, drawRes] = await Promise.all([
          api.get("/subscriptions/me"),
          api.get("/scores/me"),
          api.get("/charities/me"),
          api.get("/draws")
        ]);
        setData({
          subscription: subscriptionRes.data.subscription,
          scores: scoresRes.data.scores || [],
          charity: charityRes.data.selection,
          draws: drawRes.data.draws || [],
          winners: []
        });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load dashboard");
      }
    }
    load();
  }, []);

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Subscription Status">
          <p>{data.subscription?.status || "No subscription found"}</p>
          <p className="text-sm text-slate-500">Plan: {data.subscription?.plan || "-"}</p>
        </Card>
        <Card title="Selected Charity">
          <p>{data.charity?.charity?.name || "Not selected"}</p>
          <p className="text-sm text-slate-500">Percentage: {data.charity?.percentage || 0}%</p>
        </Card>
        <Card title="Last 5 Scores">
          {data.scores.length === 0 ? (
            <p>No scores yet</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {data.scores.map((s) => (
                <li key={s.id}>
                  Score {s.score} on {new Date(s.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Draw Participation">
          <p>Monthly draws available: {data.draws.length}</p>
          <p className="text-sm text-slate-500">Winnings panel is on Draw Results page.</p>
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

