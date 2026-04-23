import en from "./en";
import id from "./id";

export type Locale = "en" | "id";

export const locales: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  id: { label: "Indonesia", flag: "🇮🇩" },
};

const translations = { en, id } as const;

export type Translations = typeof en;

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export default translations;
