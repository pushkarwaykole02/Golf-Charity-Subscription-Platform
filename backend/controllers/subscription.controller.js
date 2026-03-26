import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

// Mock Stripe logic for now: we store plan/status/renewal_date in DB.
const UpsertSubscriptionSchema = z.object({
  plan: z.enum(["basic", "pro", "vip"]).default("basic"),
  status: z.enum(["active", "past_due", "canceled"]).default("active"),
  renewal_date: z.string().datetime().optional()
});

export async function getMySubscription(req, res, next) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .maybeSingle();
    if (error) throw httpError(400, error.message, error);
    res.json({ subscription: data ?? null });
  } catch (err) {
    return next(err);
  }
}

export async function upsertMySubscription(req, res, next) {
  try {
    const body = UpsertSubscriptionSchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();
    const renewal_date =
      body.renewal_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: req.user.id,
          plan: body.plan,
          status: body.status,
          renewal_date
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();
    if (error) throw httpError(400, error.message, error);

    res.json({ subscription: data });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

