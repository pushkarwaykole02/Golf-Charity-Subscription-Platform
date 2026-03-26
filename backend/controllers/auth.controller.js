import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabase.js";
import { httpError } from "../utils/errors.js";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// NOTE: For production, most apps do auth directly from the frontend with supabase-js.
// Requirement asks for REST APIs for auth; we provide them here.

export async function signup(req, res, next) {
  try {
    const body = SignupSchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true
    });
    if (error) throw httpError(400, error.message, error);

    // Create profile row (id matches auth.user.id)
    const userId = data.user.id;
    const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: body.email,
      full_name: body.full_name ?? null,
      is_admin: false
    });
    if (profileErr) throw httpError(400, profileErr.message, profileErr);

    // We don't return session tokens from admin.createUser.
    res.status(201).json({ user: { id: userId, email: body.email } });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const body = LoginSchema.parse(req.body);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });
    if (error) throw httpError(401, "Invalid credentials", error);

    res.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user
    });
  } catch (err) {
    if (err?.name === "ZodError") return next(httpError(400, "Invalid input", err.issues));
    return next(err);
  }
}

