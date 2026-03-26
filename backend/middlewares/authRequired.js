import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

// Verifies Supabase JWT and attaches req.user = { id, email, role }
export async function authRequired(req, _res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return next(httpError(401, "Missing Bearer token"));

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return next(httpError(401, "Invalid token", error));
    if (!data?.user) return next(httpError(401, "Invalid token"));

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

