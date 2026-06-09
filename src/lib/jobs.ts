import { supabaseAdmin } from "@/lib/supabase";

// Job content is authored EN + AR; Turkish is optional and falls back to EN.
type L<T> = { en: T; ar: T; tr?: T };

export type Job = {
  slug: string;
  active: boolean;
  posted: string;
  company: L<string>;
  location: L<string>;
  type: L<string>;
  title: L<string>;
  description: L<string[]>;
  requirements: L<string[]>;
};

/** The bilingual content stored in the jsonb `data` column. */
export type JobData = Omit<Job, "slug" | "active" | "posted">;

type JobRow = { slug: string; active: boolean; posted: string; data: JobData };

function rowToJob(row: JobRow): Job {
  return { slug: row.slug, active: row.active, posted: row.posted, ...row.data };
}

/** True once the (Syrian) Supabase project's env vars are configured. Until
 *  then the careers pages render gracefully with no openings instead of 500ing. */
const hasSupabaseEnv = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function getActiveJobs(): Promise<Job[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await supabaseAdmin()
    .from("jobs")
    .select("slug,active,posted,data")
    .eq("active", true)
    .order("posted", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as JobRow[] | null) ?? []).map(rowToJob);
}

export async function getAllJobs(): Promise<Job[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await supabaseAdmin()
    .from("jobs")
    .select("slug,active,posted,data")
    .order("posted", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as JobRow[] | null) ?? []).map(rowToJob);
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  if (!hasSupabaseEnv()) return null;
  const { data } = await supabaseAdmin()
    .from("jobs")
    .select("slug,active,posted,data")
    .eq("slug", slug)
    .maybeSingle();
  return data ? rowToJob(data as JobRow) : null;
}
