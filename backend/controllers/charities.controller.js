import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

const CreateCharitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  image: z.string().url().nullable().optional()
});

const UpdateCharitySchema = CreateCharitySchema.partial();

const SelectCharitySchema = z.object({
  charity_id: z.string().uuid(),
  percentage: z.number().int().min(10).max(100)
});

export async function listCharities(_req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from("charities").select("*").order("name");
    if (error) throw httpError(400, error.message, error);
    res.json({ charities: data });
  } catch (err) {
    return next(err);
  }
}

export async function createCharity(req, res, next) {
  try {
    const body = CreateCharitySchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from("charities").insert(body).select("*").single();
    if (error) throw httpError(400, error.message, error);
    res.status(201).json({ charity: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

export async function updateCharity(req, res, next) {
  try {
    const charityId = req.params.id;
    const patch = UpdateCharitySchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("charities")
      .update(patch)
      .eq("id", charityId)
      .select("*")
      .single();
    if (error) throw httpError(400, error.message, error);
    res.json({ charity: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

export async function deleteCharity(req, res, next) {
  try {
    const charityId = req.params.id;
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("charities").delete().eq("id", charityId);
    if (error) throw httpError(400, error.message, error);
    res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function getMyCharitySelection(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("user_charities")
      .select("*, charity:charities(*)")
      .eq("user_id", req.user.id)
      .maybeSingle();
    if (error) throw httpError(400, error.message, error);
    res.json({ selection: data ?? null });
  } catch (err) {
    return next(err);
  }
}

export async function setMyCharitySelection(req, res, next) {
  try {
    const body = SelectCharitySchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("user_charities")
      .upsert(
        { user_id: req.user.id, charity_id: body.charity_id, percentage: body.percentage },
        { onConflict: "user_id" }
      )
      .select("*, charity:charities(*)")
      .single();
    if (error) throw httpError(400, error.message, error);
    res.json({ selection: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

