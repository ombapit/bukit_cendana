"use client";

import { Download } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

export default function ExportReportsPage() {
  const { t } = useLocale();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.reports.exportTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.reports.exportSubtitle}</p>
      </div>

      <div className="glass rounded-2xl p-12 text-center">
        <Download className="w-16 h-16 text-gray-300/80 dark:text-gray-600/80 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.reports.exportHeading}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          {t.reports.exportPlaceholder}
        </p>
      </div>
    </div>
  );
}
