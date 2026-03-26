import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold">Login</h2>
      <input
        className="mb-3 w-full rounded-lg border p-2"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
      />
      <div className="relative mb-3">
        <input
          className="w-full rounded-lg border p-2 pr-12"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          onClick={() => setShowPassword((p) => !p)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary-600 py-2 text-white">
        {busy ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

