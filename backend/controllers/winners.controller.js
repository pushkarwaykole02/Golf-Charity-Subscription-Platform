import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";
import { countMatches } from "../utils/drawLogic.js";

const SubmitProofSchema = z.object({
  proof_url: z.string().url()
});

// Computes user's match type for a given draw based on their last 5 scores (values treated as "numbers")
export async function computeMyMatch(req, res, next) {
  try {
    const drawId = req.params.drawId;
    const supabaseAdmin = getSupabaseAdmin();
    const { data: draw, error: drawErr } = await supabaseAdmin.from("draws").select("*").eq("id", drawId).single();
    if (drawErr) throw httpError(404, "Draw not found");

    const { data: scores, error: scoreErr } = await supabaseAdmin
      .from("scores")
      .select("score")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false })
      .limit(5);
    if (scoreErr) throw httpError(400, scoreErr.message, scoreErr);

    const userNumbers = (scores ?? []).map((s) => s.score);
    const matches = countMatches(draw.numbers ?? [], userNumbers);
    const match_type = matches >= 5 ? 5 : matches >= 4 ? 4 : matches >= 3 ? 3 : 0;

    res.json({ draw_id: drawId, matches, match_type });
  } catch (err) {
    return next(err);
  }
}

export async function getMyWinnerRecord(req, res, next) {
  try {
    const drawId = req.params.drawId;
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("draw_id", drawId)
      .eq("user_id", req.user.id)
      .maybeSingle();
    if (error) throw httpError(400, error.message, error);
    res.json({ winner: data ?? null });
  } catch (err) {
    return next(err);
  }
}

// Create/Upsert winner claim for user (based on computeMyMatch result).
export async function claimMyWin(req, res, next) {
  try {
    const drawId = req.params.drawId;
    const supabaseAdmin = getSupabaseAdmin();

    // Load draw + user numbers.
    const { data: draw, error: drawErr } = await supabaseAdmin.from("draws").select("*").eq("id", drawId).single();
    if (drawErr) throw httpError(404, "Draw not found");

    const { data: scores, error: scoreErr } = await supabaseAdmin
      .from("scores")
      .select("score")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false })
      .limit(5);
    if (scoreErr) throw httpError(400, scoreErr.message, scoreErr);

    const userNumbers = (scores ?? []).map((s) => s.score);
    const matches = countMatches(draw.numbers ?? [], userNumbers);
    const match_type = matches >= 5 ? 5 : matches >= 4 ? 4 : matches >= 3 ? 3 : 0;
    if (match_type === 0) throw httpError(400, "Not eligible: need at least 3 matches");

    const { data, error } = await supabaseAdmin
      .from("winners")
      .upsert(
        {
          user_id: req.user.id,
          draw_id: drawId,
          match_type,
          status: "pending",
          proof_url: null
        },
        { onConflict: "user_id,draw_id" }
      )
      .select("*")
      .single();
    if (error) throw httpError(400, error.message, error);

    res.status(201).json({ winner: data });
  } catch (err) {
    return next(err);
  }
}

export async function submitMyProof(req, res, next) {
  try {
    const drawId = req.params.drawId;
    const body = SubmitProofSchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("winners")
      .update({ proof_url: body.proof_url, status: "pending" })
      .eq("user_id", req.user.id)
      .eq("draw_id", drawId)
      .select("*")
      .single();
    if (error) throw httpError(400, error.message, error);

    res.json({ winner: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

// Admin approves/rejects
export async function adminSetWinnerStatus(req, res, next) {
  try {
    const id = req.params.id;
    const body = z
      .object({
        status: z.enum(["approved", "rejected"])
      })
      .parse(req.body);

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("winners")
      .update({ status: body.status })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw httpError(400, error.message, error);
    res.json({ winner: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

