import { useEffect, useState } from "react";
import { api } from "../api/http.js";

export function AdminPanelPage() {
  const [users, setUsers] = useState([]);
  const [winners, setWinners] = useState([]);
  const [newDrawMonth, setNewDrawMonth] = useState("");
  const [charity, setCharity] = useState({ name: "", description: "", image: "" });
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [userRes, winnerRes] = await Promise.all([api.get("/admin/users"), api.get("/admin/winners")]);
      setUsers(userRes.data.users || []);
      setWinners(winnerRes.data.winners || []);
    } catch (err) {
      setMessage(err.response?.data?.error || "Admin data unavailable (requires admin role)");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createDraw(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/draws", { month: newDrawMonth });
      setMessage("Draw created");
    } catch (err) {
      setMessage(err.response?.data?.error || "Draw creation failed");
    }
  }

  async function createCharity(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/charities", charity);
      setMessage("Charity created");
    } catch (err) {
      setMessage(err.response?.data?.error || "Charity create failed");
    }
  }

  async function setWinnerStatus(id, status) {
    setMessage("");
    try {
      await api.patch(`/winners/${id}/status`, { status });
      setMessage(`Winner ${status}`);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.error || "Status update failed");
    }
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={createDraw} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Create Monthly Draw</h2>
          <input
            placeholder="YYYY-MM"
            className="mb-2 w-full rounded-lg border p-2"
            value={newDrawMonth}
            onChange={(e) => setNewDrawMonth(e.target.value)}
          />
          <button className="rounded-lg bg-primary-600 px-3 py-2 text-white">Create Draw</button>
        </form>

        <form onSubmit={createCharity} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Add Charity</h2>
          <input
            placeholder="Name"
            className="mb-2 w-full rounded-lg border p-2"
            value={charity.name}
            onChange={(e) => setCharity((p) => ({ ...p, name: e.target.value }))}
          />
          <textarea
            placeholder="Description"
            className="mb-2 w-full rounded-lg border p-2"
            value={charity.description}
            onChange={(e) => setCharity((p) => ({ ...p, description: e.target.value }))}
          />
          <input
            placeholder="Image URL"
            className="mb-2 w-full rounded-lg border p-2"
            value={charity.image}
            onChange={(e) => setCharity((p) => ({ ...p, image: e.target.value }))}
          />
          <button className="rounded-lg bg-primary-600 px-3 py-2 text-white">Add Charity</button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Users</h2>
        <p className="text-sm text-slate-600">Total: {users.length}</p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Winner Verification</h2>
        <div className="space-y-2">
          {winners.map((w) => (
            <div key={w.id} className="rounded-lg border p-3 text-sm">
              <p>
                User: {w.user_id} | Match: {w.match_type} | Status: {w.status}
              </p>
              <p>Proof URL: {w.proof_url || "-"}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded bg-emerald-600 px-3 py-1 text-white"
                  onClick={() => setWinnerStatus(w.id, "approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded bg-rose-600 px-3 py-1 text-white"
                  onClick={() => setWinnerStatus(w.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

