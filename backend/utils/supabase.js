import { createClient } from "@supabase/supabase-js";

let cached = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Don't crash the whole server on boot; endpoints will surface a clear error.
    const missing = [
      !supabaseUrl ? "SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null
    ].filter(Boolean);
    const err = new Error(`Supabase not configured. Missing env: ${missing.join(", ")}`);
    err.statusCode = 500;
    throw err;
  }

  // Server-side client: service role for DB access.
  // IMPORTANT: Never expose SERVICE_ROLE key to the frontend.
  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cached;
}

