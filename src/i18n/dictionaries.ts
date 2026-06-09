import type { Locale } from "@/i18n/config";
import en, { type Dictionary } from "@/dictionaries/en";
import ar from "@/dictionaries/ar";
import tr from "@/dictionaries/tr";

/**
 * Static, build-time dictionaries with NO overrides applied.
 *
 * The override-aware, async `getDictionary(locale)` now lives in
 * `@/lib/content` (it merges admin edits from Supabase over these defaults).
 * Import it from there in server components. This module keeps the `Dictionary`
 * type (the EN dictionary is the type source) and the raw defaults.
 */
export const dictionaries: Record<Locale, Dictionary> = { en, ar, tr };

export type { Dictionary };
