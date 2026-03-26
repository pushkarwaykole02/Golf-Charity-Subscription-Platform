import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-6 text-slate-500">Loading session...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

