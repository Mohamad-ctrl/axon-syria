import type { Locale } from "@/i18n/config";
import en, { type Dictionary } from "@/dictionaries/en";
import ar from "@/dictionaries/ar";
import tr from "@/dictionaries/tr";

const dictionaries: Record<Locale, Dictionary> = { en, ar, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
