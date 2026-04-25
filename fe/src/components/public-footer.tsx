"use client";

import { useLocale } from "@/contexts/locale-context";

export function PublicFooter() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-white/20 dark:border-white/5 py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t.landing.footer}</p>
      </div>
    </footer>
  );
}
