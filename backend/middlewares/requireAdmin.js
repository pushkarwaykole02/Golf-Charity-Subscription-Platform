import { httpError } from "../utils/errors.js";

// Simple admin gate.
// Option A: Set auth user's app_metadata.role = 'admin'
// Option B: Maintain a profiles.is_admin flag (we do both in admin routes).
export function requireAdmin(req, _res, next) {
  if (req.user?.role === "admin") return next();
  return next(httpError(403, "Admin access required"));
}

