import { useEffect, useState } from "react";
import { api } from "../api/http.js";

export function CharitySelectionPage() {
  const [charities, setCharities] = useState([]);
  const [selected, setSelected] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [charityRes, myRes] = await Promise.all([api.get("/charities"), api.get("/charities/me")]);
      setCharities(charityRes.data.charities || []);
      if (myRes.data.selection) {
        setSelected(myRes.data.selection.charity_id);
        setPercentage(myRes.data.selection.percentage);
      }
    }
    load().catch(() => setMessage("Could not load charities"));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.put("/charities/me", {
        charity_id: selected,
        percentage: Number(percentage)
      });
      setMessage("Charity selection saved.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to save");
    }
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">Charity Selection</h1>
      <form onSubmit={onSubmit} className="max-w-lg rounded-xl border bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm text-slate-600">Choose Charity</label>
        <select
          className="mb-3 w-full rounded-lg border p-2"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          required
        >
          <option value="">Select...</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm text-slate-600">Contribution Percentage (min 10%)</label>
        <input
          className="mb-3 w-full rounded-lg border p-2"
          type="number"
          min={10}
          max={100}
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-white">Save Selection</button>
        {message ? <p className="mt-2 text-sm">{message}</p> : null}
      </form>
    </section>
  );
}

