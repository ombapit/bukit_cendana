"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pengumumanService } from "@/lib/services";
import type { Pengumuman } from "@/types";
import { Search, Loader2, ArrowLeft, Tag, Calendar, User } from "lucide-react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import Link from "next/link";

const KATEGORI_LIST = ["Umum", "Keamanan", "Kebersihan", "Kegiatan", "Penting", "Keuangan"];

function getImageURL(gambar: string): string {
  if (!gambar) return "";
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/v1", "");
  return `${base}${gambar}`;
}

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return "-"; }
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/ /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHtml(html: string) {
  // Convert non-breaking spaces back to regular spaces so text can wrap normally.
  // Keep all HTML tags intact.
  return (html ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/ /g, " ");
}

function PengumumanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [selected, setSelected] = useState<Pengumuman | null>(null);
  const [initialIdHandled, setInitialIdHandled] = useState(false);
  const fromHome = searchParams.get("from") === "home";

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pengumumanService.getAll(1, 100, search, kategoriFilter, true);
      const data: Pengumuman[] = res.data?.data || [];
      setRecords(data);

      if (!initialIdHandled) {
        const idParam = searchParams.get("id");
        if (idParam) {
          const found = data.find((r) => r.id === idParam);
          if (found) setSelected(found);
        }
        setInitialIdHandled(true);
      }
    } catch { setRecords([]); }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, kategoriFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(), 300);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  const openDetail = (r: Pengumuman) => {
    setSelected(r);
    router.replace(`/pengumuman?id=${r.id}`, { scroll: false });
  };

  const closeDetail = () => {
    if (fromHome) {
      router.push("/");
    } else {
      setSelected(null);
      router.replace("/pengumuman", { scroll: false });
    }
  };

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        <button
          onClick={closeDetail}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {fromHome ? "Kembali ke halaman utama" : "Kembali ke daftar"}
        </button>

        {selected.gambar && (
          <img
            src={getImageURL(selected.gambar)}
            alt={selected.judul}
            className="w-full max-h-56 sm:max-h-72 lg:max-h-80 object-cover rounded-2xl mb-5 sm:mb-6 border border-white/20"
          />
        )}

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 min-w-0">
          {selected.kategori && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 font-medium">
              {selected.kategori}
            </span>
          )}
          {selected.tags && selected.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/40 dark:bg-white/10 text-gray-500 dark:text-gray-400">
              <Tag className="w-3 h-3 shrink-0" />{tag}
            </span>
          ))}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
          {selected.judul}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-400 dark:text-gray-500 mb-5 sm:mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {formatTanggal(selected.created_at)}
          </span>
          {selected.created_by_name && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 shrink-0" />
              {selected.created_by_name}
            </span>
          )}
        </div>

        <div
          className="glass rounded-2xl p-4 sm:p-6 rich-content text-sm sm:text-[15px] text-gray-700 dark:text-gray-300 w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: cleanHtml(selected.konten) }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pengumuman</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Informasi dan pengumuman resmi dari pengurus Perumahan Bukit Cendana.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent backdrop-blur-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={kategoriFilter}
          onChange={(e) => setKategoriFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2.5 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white"
        >
          <option value="">Semua Kategori</option>
          {KATEGORI_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        </div>
      ) : records.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">Belum ada pengumuman</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => (
            <button
              key={r.id}
              onClick={() => openDetail(r)}
              className="glass rounded-2xl overflow-hidden text-left hover:shadow-lg hover:shadow-red-700/10 hover:-translate-y-0.5 transition-all duration-200 w-full"
            >
              {r.gambar ? (
                <img src={getImageURL(r.gambar)} alt={r.judul} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-red-700/10 to-rose-600/10 dark:from-red-700/20 dark:to-rose-600/20 flex items-center justify-center">
                  <span className="text-4xl">📢</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {r.kategori && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400">
                      {r.kategori}
                    </span>
                  )}
                  {r.tags && r.tags.split(",").slice(0, 2).map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 text-[11px] rounded bg-white/40 dark:bg-white/10 text-gray-400">{tag}</span>
                  ))}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1">{r.judul}</h3>
                {r.konten && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{stripHtml(r.konten)}</p>
                )}
                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatTanggal(r.created_at)}</p>
                  {r.created_by_name && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
                      <User className="w-3 h-3" />{r.created_by_name}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PengumumanPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <div className="flex-1">
        <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-red-700" /></div>}>
          <PengumumanContent />
        </Suspense>
      </div>
      <PublicFooter />
    </div>
  );
}
