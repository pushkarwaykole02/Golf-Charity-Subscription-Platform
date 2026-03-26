import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";
import { generateDrawNumbers } from "../utils/drawLogic.js";

const CreateDrawSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/) // YYYY-MM
});

function currentMonthString() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export async function getCurrentDraw(req, res, next) {
  try {
    const month = req.query.month?.toString() || currentMonthString();
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from("draws").select("*").eq("month", month).single();
    if (error) throw httpError(404, "Draw not found for month");
    res.json({ draw: data });
  } catch (err) {
    return next(err);
  }
}

// Admin creates monthly draw numbers.
export async function createMonthlyDraw(req, res, next) {
  try {
    const body = CreateDrawSchema.parse(req.body);
    const numbers = generateDrawNumbers();
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("draws")
      .insert({ month: body.month, numbers, status: "open" })
      .select("*")
      .single();
    if (error) throw httpError(400, error.message, error);
    res.status(201).json({ draw: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

export async function listDraws(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from("draws").select("*").order("month", { ascending: false });
    if (error) throw httpError(400, error.message, error);
    res.json({ draws: data });
  } catch (err) {
    return next(err);
  }
}

