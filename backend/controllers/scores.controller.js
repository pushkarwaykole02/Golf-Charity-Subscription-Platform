import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

const AddScoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  date: z.string().datetime().optional()
});

export async function listMyScores(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("scores")
      .select("*")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false })
      .limit(5);
    if (error) throw httpError(400, error.message, error);
    res.json({ scores: data });
  } catch (err) {
    return next(err);
  }
}

// Store only last 5 scores: insert new score, then delete extras (oldest).
export async function addMyScore(req, res, next) {
  try {
    const body = AddScoreSchema.parse(req.body);
    const date = body.date ?? new Date().toISOString();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("scores")
      .insert({ user_id: req.user.id, score: body.score, date })
      .select("*")
      .single();
    if (insErr) throw httpError(400, insErr.message, insErr);

    // Fetch scores ordered newest->oldest; delete beyond 5.
    const { data: allScores, error: listErr } = await supabaseAdmin
      .from("scores")
      .select("id,date")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false });
    if (listErr) throw httpError(400, listErr.message, listErr);

    const toDelete = (allScores ?? []).slice(5).map((s) => s.id);
    if (toDelete.length > 0) {
      const { error: delErr } = await supabaseAdmin.from("scores").delete().in("id", toDelete);
      if (delErr) throw httpError(400, delErr.message, delErr);
    }

    res.status(201).json({ score: inserted });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

