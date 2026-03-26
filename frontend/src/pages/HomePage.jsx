import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="grid gap-6 py-10">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-wide text-indigo-100">Golf Charity Subscription</p>
        <h1 className="mt-2 text-4xl font-bold">Play. Give. Win.</h1>
        <p className="mt-4 max-w-2xl text-indigo-100">
          A modern platform that blends monthly golf draws, subscriptions, and transparent charity
          contributions.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/signup" className="rounded-lg bg-white px-5 py-2 font-medium text-indigo-700">
            Start Subscription
          </Link>
          <Link to="/login" className="rounded-lg border border-indigo-200 px-5 py-2 text-white">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

