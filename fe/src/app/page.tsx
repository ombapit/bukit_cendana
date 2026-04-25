"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, FileText, Bell } from "lucide-react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { useLocale } from "@/contexts/locale-context";
import { pengumumanService } from "@/lib/services";
import type { Pengumuman } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/v1", "");

function getImageURL(gambar: string) {
  return gambar ? `${API_BASE}${gambar}` : "";
}

function formatTanggal(iso: string) {
  try { return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "-"; }
}

export default function LandingPage() {
  const { t } = useLocale();
  const [latestPengumuman, setLatestPengumuman] = useState<Pengumuman[]>([]);

  useEffect(() => {
    pengumumanService.getAll(1, 3, "", "", true)
      .then((res) => setLatestPengumuman(res.data?.data || []))
      .catch(() => {});
  }, []);

  const features = [
    { icon: Users, title: t.landing.features.warga.title, desc: t.landing.features.warga.desc, href: "/warga" },
    { icon: Bell, title: t.landing.features.pengumuman.title, desc: t.landing.features.pengumuman.desc, href: "/pengumuman" },
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

      {/* Pengumuman Terbaru */}
      {latestPengumuman.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengumuman Terbaru</h2>
              <Link href="/pengumuman" className="text-sm text-red-700 dark:text-red-400 hover:underline">Lihat semua →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestPengumuman.map((p) => (
                <Link key={p.id} href={`/pengumuman?id=${p.id}&from=home`} className="glass rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-red-700/10 hover:-translate-y-0.5 transition-all duration-200">
                  {p.gambar ? (
                    <img src={getImageURL(p.gambar)} alt={p.judul} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-red-700/10 to-rose-600/10 dark:from-red-700/20 dark:to-rose-600/20 flex items-center justify-center">
                      <span className="text-3xl">📢</span>
                    </div>
                  )}
                  <div className="p-4">
                    {p.kategori && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 mb-2 inline-block">{p.kategori}</span>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1">{p.judul}</h3>
                    {p.konten && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{p.konten.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()}</p>}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatTanggal(p.created_at)}</p>
                      {p.created_by_name && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{p.created_by_name}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  );
}
