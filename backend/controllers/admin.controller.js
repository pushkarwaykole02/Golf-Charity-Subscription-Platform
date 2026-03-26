import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

export async function listUsers(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Prefer profiles for app-facing admin. Supabase Auth users require admin listUsers which is paginated.
    const { data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw httpError(400, error.message, error);
    res.json({ users: data });
  } catch (err) {
    return next(err);
  }
}

export async function listWinners(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("winners")
      .select("*, draw:draws(*), profile:profiles(*)")
      .order("created_at", { ascending: false });
    if (error) throw httpError(400, error.message, error);
    res.json({ winners: data });
  } catch (err) {
    return next(err);
  }
}

