"use client";

import Link from "next/link";
import { Shield, Users, LayoutDashboard, Menu, ArrowRight, Zap, Lock, Server } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLocale } from "@/contexts/locale-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function LandingPage() {
  const { t } = useLocale();

  const features = [
    { icon: Lock, ...t.landing.features.auth },
    { icon: Shield, ...t.landing.features.rbac },
    { icon: Menu, ...t.landing.features.menu },
    { icon: Users, ...t.landing.features.user },
    { icon: LayoutDashboard, ...t.landing.features.dashboard },
    { icon: Server, ...t.landing.features.api },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="glass-strong border-b border-white/20 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-rose-600 rounded-lg flex items-center justify-center glow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Bukit Cendana</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />              
            </div>
          </div>
        </div>
      </nav>

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="glass p-6 rounded-xl hover:shadow-lg hover:shadow-red-700/10 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700/20 to-rose-600/20 dark:from-red-700/30 dark:to-rose-600/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-red-700 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
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
