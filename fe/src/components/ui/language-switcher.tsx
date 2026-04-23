"use client";

import { useLocale } from "@/contexts/locale-context";
import { locales } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  const toggle = () => {
    setLocale(locale === "en" ? "id" : "en");
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ${className || ""}`}
      title={`Switch to ${locale === "en" ? "Indonesian" : "English"}`}
    >
      <span>{locales[locale].flag}</span>
      <span className="hidden sm:inline">{locales[locale].label}</span>
    </button>
  );
}
