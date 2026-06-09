import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * This bypasses RLS, so it must NEVER be imported into a Client Component.
 * RLS on `applications` has no policies, so the service role is the only access path.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase env vars missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const CV_BUCKET = "cvs";
/** Public bucket for admin-uploaded site media (project photos, company logos,
 *  certificate scans). Public read; writes go through the service-role key in
 *  the auth-guarded upload route. */
export const MEDIA_BUCKET = "site-media";
