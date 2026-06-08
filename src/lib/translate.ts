/**
 * Server-only English → Arabic translation for job postings, via the Anthropic
 * Messages API. Admins write each posting in English; this fills in the Arabic
 * side that the public site shows for `ar`.
 *
 * Env:
 *  - ANTHROPIC_API_KEY  (required for translation to actually run)
 *  - ANTHROPIC_MODEL    (optional; defaults to a fast Haiku model)
 *
 * Returns null on ANY problem (missing key, network/API error, bad JSON) so the
 * caller can fall back to the English text — posting a job is never blocked by
 * a translation outage. Never import this into a Client Component.
 */

export type JobTranslatable = {
  title: string;
  company: string;
  location: string;
  description: string[];
  requirements: string[];
};

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-5-haiku-latest";

const SYSTEM_PROMPT =
  "You are a professional English→Arabic translator for a Syrian business/careers website. " +
  "You receive a JSON object describing a job posting. Translate every English string value into clear, " +
  "professional Modern Standard Arabic suitable for Syria and the Levant.\n" +
  "Rules:\n" +
  "1. Return ONLY a JSON object with the EXACT same keys and structure as the input — no markdown fences, no commentary.\n" +
  "2. Keep arrays the same length and order; translate each element.\n" +
  "3. Do NOT translate brand or company names such as 'Axon', 'Axon Syria', 'Axon Contracting', 'Imdad' — keep them in Latin script.\n" +
  "4. Translate place names naturally (e.g. 'Aleppo, Syria' → 'حلب، سوريا').\n" +
  "5. Do not add, omit, or summarize information.";

export async function translateJobToArabic(
  input: JobTranslatable
): Promise<JobTranslatable | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: JSON.stringify(input) }],
      }),
    });

    if (!res.ok) {
      console.error("[translate] Anthropic API error", res.status, await res.text().catch(() => ""));
      return null;
    }

    const json = (await res.json()) as { content?: { type: string; text?: string }[] };
    const raw = json.content?.find((b) => b.type === "text")?.text?.trim();
    if (!raw) return null;

    // Strip an optional ```json … ``` fence in case the model adds one.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const out = JSON.parse(cleaned) as Partial<JobTranslatable>;

    // Validate the shape; fall back to English on anything unexpected.
    if (
      typeof out.title !== "string" ||
      typeof out.company !== "string" ||
      typeof out.location !== "string" ||
      !Array.isArray(out.description) ||
      !Array.isArray(out.requirements)
    ) {
      return null;
    }

    return {
      title: out.title,
      company: out.company,
      location: out.location,
      description: out.description.map(String),
      requirements: out.requirements.map(String),
    };
  } catch (err) {
    console.error("[translate] failed", err);
    return null;
  }
}
