import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ScoreEntryPage } from "./pages/ScoreEntryPage.jsx";
import { CharitySelectionPage } from "./pages/CharitySelectionPage.jsx";
import { DrawResultsPage } from "./pages/DrawResultsPage.jsx";
import { AdminPanelPage } from "./pages/AdminPanelPage.jsx";

function NavBar() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-primary-700">
          Golf Charity Platform
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link to="/scores" className="text-slate-600 hover:text-slate-900">
                Scores
              </Link>
              <Link to="/charity" className="text-slate-600 hover:text-slate-900">
                Charity
              </Link>
              <Link to="/draws" className="text-slate-600 hover:text-slate-900">
                Draws
              </Link>
              <Link to="/admin" className="text-slate-600 hover:text-slate-900">
                Admin
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link to="/signup" className="rounded-lg bg-primary-600 px-3 py-1.5 text-white">
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scores"
            element={
              <ProtectedRoute>
                <ScoreEntryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charity"
            element={
              <ProtectedRoute>
                <CharitySelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/draws"
            element={
              <ProtectedRoute>
                <DrawResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
