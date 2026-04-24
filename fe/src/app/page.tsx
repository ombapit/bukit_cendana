"use client";

import Link from "next/link";
import { Users, FileText } from "lucide-react";
import { PublicNavbar } from "@/components/public-navbar";
import { useLocale } from "@/contexts/locale-context";

export default function LandingPage() {
  const { t } = useLocale();

  const features = [
    { icon: Users, title: t.landing.features.warga.title, desc: t.landing.features.warga.desc, href: "/warga" },
    // { icon: Bell, title: t.landing.features.pengumuman.title, desc: t.landing.features.pengumuman.desc, href: "#" },
    { icon: FileText, title: t.landing.features.laporan.title, desc: t.landing.features.laporan.desc, href: "/laporan" },
  ];

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            {t.landing.heroTitle1}
            <br />
            <span className="bg-gradient-to-r from-red-700 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">{t.landing.heroTitle2}</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.landing.heroDesc}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#features"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-rose-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:from-red-800 hover:to-rose-700 transition-all shadow-lg shadow-red-700/25"
            >
              {t.landing.viewFeatures}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.landing.mainFeatures}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t.landing.mainFeaturesDesc}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="glass p-6 rounded-xl hover:shadow-lg hover:shadow-red-700/10 hover:-translate-y-1 transition-all duration-300 w-full max-w-sm">
                <Link href={feature.href || "#"} className="block">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-700/20 to-rose-600/20 dark:from-red-700/30 dark:to-rose-600/30 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-red-700 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 dark:border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t.landing.footer}</p>
        </div>
      </footer>
    </div>
  );
}
