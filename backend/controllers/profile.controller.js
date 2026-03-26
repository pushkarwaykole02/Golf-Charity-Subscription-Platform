import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).nullable().optional(),
  avatar_url: z.string().url().nullable().optional()
});

export async function getMyProfile(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) throw httpError(400, error.message, error);
    res.json({ profile: data });
  } catch (err) {
    return next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const patch = UpdateProfileSchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", req.user.id)
      .select("*")
      .single();

    if (error) throw httpError(400, error.message, error);
    res.json({ profile: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

